const bip39 = require('bip39');
const BIP32Factory = require('bip32');
const ecc = require('tiny-secp256k1');
const TronWeb = require('tronweb');
const CryptoJS = require('crypto-js');

// Initialize BIP32 with ECC library
const bip32 = BIP32Factory.default(ecc);

class HDWalletService {
  constructor() {
    this.masterSeed = null;
    this.masterNode = null;
    this.network = process.env.TRON_NETWORK || 'mainnet';
    this.tronWeb = null;
    this.initialize();
  }

  initialize() {
    // Get encrypted seed from environment
    const encryptedSeed = process.env.HD_WALLET_ENCRYPTED_SEED;
    const encryptionKey = process.env.HD_WALLET_ENCRYPTION_KEY || process.env.JWT_SECRET;

    if (!encryptedSeed) {
      throw new Error('HD_WALLET_ENCRYPTED_SEED not found in environment variables');
    }

    // Decrypt seed
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedSeed, encryptionKey);
      const mnemonic = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic seed');
      }

      // Generate seed from mnemonic
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      
      // Create master node using BIP32
      // TRON uses m/44'/195'/0'/0/index (195 is TRON's coin type)
      this.masterNode = bip32.fromSeed(seed);
      
      // Initialize TronWeb
      const apiUrl = process.env.TRONGRID_API_URL || 'https://api.shasta.trongrid.io';
      this.tronWeb = new TronWeb.TronWeb({
        fullHost: apiUrl,
        headers: { 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY },
      });
    } catch (error) {
      console.error('HD Wallet initialization error:', error.message);
      throw new Error('Failed to initialize HD wallet');
    }
  }

  /**
   * Derive TRON address from index
   * @param {number} index - Derivation index (0, 1, 2, ...)
   * @returns {string} TRON address (base58)
   */
  deriveAddress(index) {
    if (!this.masterNode) {
      throw new Error('HD wallet not initialized');
    }

    // TRON derivation path: m/44'/195'/0'/0/index
    // 195 is TRON's coin type according to BIP44
    const path = `m/44'/195'/0'/0/${index}`;
    const childNode = this.masterNode.derivePath(path);
    
    // Get public key
    const publicKey = childNode.publicKey;
    
    // Convert to TRON address
    // Extract private key as Buffer and convert to hex
    const privateKeyBuffer = Buffer.from(childNode.privateKey);
    const privateKeyHex = privateKeyBuffer.toString('hex');
    const address = this.tronWeb.address.fromPrivateKey(privateKeyHex);

    return address;
  }

  /**
   * Generate new payment address (increment index and derive)
   * @returns {Promise<{address: string, index: number}>}
   */
  async generateNewAddress() {
    const HDAddressIndex = require('../schemas/hdAddressIndex');
    
    // Lock and increment index atomically
    const indexDoc = await HDAddressIndex.getOrCreate(this.network);
    
    // Use findOneAndUpdate for atomic operation
    const updated = await HDAddressIndex.findOneAndUpdate(
      { network: this.network },
      { 
        $inc: { lastUsedIndex: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true, upsert: true }
    );

    const newIndex = updated.lastUsedIndex;
    const address = this.deriveAddress(newIndex);

    return {
      address,
      index: newIndex,
    };
  }

  /**
   * Get private key for address (for sweeping funds - admin only)
   * @param {number} index - Derivation index
   * @returns {string} Private key (hex)
   */
  getPrivateKey(index) {
    if (!this.masterNode) {
      throw new Error('HD wallet not initialized');
    }

    const path = `m/44'/195'/0'/0/${index}`;
    const childNode = this.masterNode.derivePath(path);
    
    // Extract private key as Buffer and convert to hex
    const privateKeyBuffer = Buffer.from(childNode.privateKey);
    return privateKeyBuffer.toString('hex');
  }
}

// Singleton instance
let hdWalletInstance = null;

function getHDWallet() {
  if (!hdWalletInstance) {
    hdWalletInstance = new HDWalletService();
  }
  return hdWalletInstance;
}

module.exports = getHDWallet;
