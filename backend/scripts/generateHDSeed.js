/**
 * Script to generate HD wallet master seed
 * 
 * Run this ONCE to generate your master seed:
 * node scripts/generateHDSeed.js
 * 
 * IMPORTANT: Save the encrypted seed and encryption key securely!
 * Never commit these to git!
 */

const bip39 = require('bip39');
const CryptoJS = require('crypto-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function generateSeed() {
  console.log('\n🔐 HD Wallet Master Seed Generator\n');
  console.log('This script will generate a BIP39 mnemonic seed for your HD wallet.');
  console.log('⚠️  IMPORTANT: This seed is the root of ALL payment addresses!');
  console.log('⚠️  Store it securely and NEVER lose it!\n');

  const useExisting = await question('Do you want to use an existing mnemonic? (y/n): ');
  
  let mnemonic;
  if (useExisting.toLowerCase() === 'y') {
    mnemonic = await question('Enter your 12 or 24 word mnemonic: ');
    mnemonic = mnemonic.trim();
    
    if (!bip39.validateMnemonic(mnemonic)) {
      console.error('❌ Invalid mnemonic! Please check and try again.');
      rl.close();
      process.exit(1);
    }
  } else {
    // Generate new mnemonic
    const strength = await question('Enter seed strength (12 or 24 words, default 12): ');
    const wordCount = strength.trim() === '24' ? 256 : 128;
    
    mnemonic = bip39.generateMnemonic(wordCount);
    console.log('\n✅ Generated new mnemonic:');
    console.log(`\n${mnemonic}\n`);
    console.log('⚠️  WRITE THIS DOWN AND STORE IT SECURELY!');
    console.log('⚠️  You will need this to recover all addresses!\n');
  }

  // Get encryption key
  const encryptionKey = await question('Enter encryption key (or press Enter to use JWT_SECRET): ');
  const key = encryptionKey.trim() || process.env.JWT_SECRET || 'default-key-change-in-production';

  // Encrypt mnemonic
  const encrypted = CryptoJS.AES.encrypt(mnemonic, key).toString();

  console.log('\n✅ Encryption complete!\n');
  console.log('Add these to your .env file:\n');
  console.log(`HD_WALLET_ENCRYPTED_SEED=${encrypted}`);
  if (!encryptionKey.trim()) {
    console.log(`HD_WALLET_ENCRYPTION_KEY=${key}`);
  }
  console.log('\n⚠️  SECURITY REMINDERS:');
  console.log('   1. Never commit .env to git');
  console.log('   2. Store encrypted seed in secure vault');
  console.log('   3. Backup mnemonic offline');
  console.log('   4. Never share these values\n');

  rl.close();
}

generateSeed().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
