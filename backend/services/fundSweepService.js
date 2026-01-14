/**
 * Fund Sweep Service
 * 
 * Periodically sweeps funds from HD wallet derived addresses to admin wallet.
 * This ensures all payments end up in the main admin wallet address.
 */

const TronWeb = require('tronweb');
const axios = require('axios');
const PaymentIntent = require('../schemas/paymentIntent');
const getHDWallet = require('./hdWalletService');

class FundSweepService {
  constructor() {
    this.apiKey = process.env.TRONGRID_API_KEY;
    this.apiUrl = process.env.TRONGRID_API_URL || 'https://api.trongrid.io';
    this.adminWallet = process.env.ADMIN_WALLET_ADDRESS;
    this.adminWalletPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY; // For sending TRX for fees
    this.usdtContract = process.env.USDT_CONTRACT_ADDRESS || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    this.isRunning = false;
    this.sweepInterval = null;
    this.sweepIntervalMinutes = 5; // Sweep every 5 minutes for faster fund collection
    this.tronWeb = null;
    this.adminTronWeb = null; // Separate TronWeb instance for admin wallet
    this.initialize();
  }

  initialize() {
    // Initialize TronWeb for derived addresses
    this.tronWeb = new TronWeb.TronWeb({
      fullHost: this.apiUrl,
      headers: { 'TRON-PRO-API-KEY': this.apiKey },
    });

    // Initialize separate TronWeb instance for admin wallet (if private key provided)
    if (this.adminWalletPrivateKey) {
      this.adminTronWeb = new TronWeb.TronWeb({
        fullHost: this.apiUrl,
        headers: { 'TRON-PRO-API-KEY': this.apiKey },
        privateKey: this.adminWalletPrivateKey,
      });
    }

    if (!this.adminWallet) {
      console.warn('⚠️  ADMIN_WALLET_ADDRESS not configured. Fund sweep service will not run.');
    }

    if (!this.adminWalletPrivateKey) {
      console.warn('⚠️  ADMIN_WALLET_PRIVATE_KEY not configured. Cannot send TRX for fees automatically.');
    }
  }

  /**
   * Start the fund sweep service
   */
  start() {
    if (this.isRunning) {
      console.log('Fund sweep service already running');
      return;
    }

    if (!this.adminWallet) {
      console.log('⚠️  Fund sweep service not started: ADMIN_WALLET_ADDRESS not configured');
      return;
    }

    this.isRunning = true;
    console.log('✅ Fund sweep service started');
    console.log(`   Admin wallet: ${this.adminWallet}`);
    console.log(`   Sweep interval: ${this.sweepIntervalMinutes} minutes`);

    // Run immediately, then on interval
    this.sweepFunds();
    this.sweepInterval = setInterval(() => {
      this.sweepFunds();
    }, this.sweepIntervalMinutes * 60 * 1000);
  }

  /**
   * Stop the fund sweep service
   */
  stop() {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    this.isRunning = false;
    console.log('Fund sweep service stopped');
  }

  /**
   * Sweep funds from all paid payment intents
   * @returns {Promise<{swept: number, failed: number, errors: Array}>}
   */
  async sweepFunds() {
    try {
      // Get all paid payment intents that haven't been swept yet
      const paidIntents = await PaymentIntent.find({
        status: 'paid',
        txHash: { $ne: null },
      }).limit(20); // Process 20 at a time

      if (paidIntents.length === 0) {
        return { swept: 0, failed: 0, errors: [] };
      }

      console.log(`🔄 Sweeping funds from ${paidIntents.length} paid addresses...`);

      let swept = 0;
      let failed = 0;
      const errors = [];

      for (const intent of paidIntents) {
        try {
          // Check if address has balance before attempting sweep
          const balance = await this.getAddressBalance(intent.derivedAddress);
          if (balance && balance.usdt > 0) {
            await this.sweepAddress(intent);
            swept++;
          }
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          failed++;
          errors.push({
            address: intent.derivedAddress,
            error: error.message,
          });
          console.error(`❌ Error sweeping address ${intent.derivedAddress}:`, error.message);
        }
      }

      return { swept, failed, errors, total: paidIntents.length };
    } catch (error) {
      console.error('Fund sweep error:', error.message);
      throw error;
    }
  }

  /**
   * Sweep funds from a specific derived address to admin wallet
   * @param {Object} intent - Payment intent
   */
  async sweepAddress(intent) {
    try {
      const derivedAddress = intent.derivedAddress;
      const derivationIndex = intent.derivationIndex;

      // Check balance of derived address
      const balance = await this.getAddressBalance(derivedAddress);
      
      if (!balance || balance.usdt === 0) {
        return; // No USDT to sweep
      }

      console.log(`💰 Sweeping ${derivedAddress}: ${balance.usdt} USDT`);

      // Get private key for this address
      const hdWallet = getHDWallet();
      const privateKey = hdWallet.getPrivateKey(derivationIndex);

      // Set private key in TronWeb for signing
      this.tronWeb.setPrivateKey(privateKey);

      // Only sweep USDT (TRX option removed)
      if (balance.usdt > 0) {
        // Check if address has enough TRX for transaction fees (need at least 0.1 TRX)
        const minTRXForFees = 0.1;
        if (balance.trx < minTRXForFees) {
          // Send TRX from admin wallet to cover fees
          console.log(`   💸 Sending ${minTRXForFees} TRX from admin wallet to ${derivedAddress} for fees...`);
          try {
            await this.sendTRXForFees(derivedAddress, minTRXForFees);
            // Wait a bit for transaction to confirm
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Re-check balance
            const updatedBalance = await this.getAddressBalance(derivedAddress);
            balance.trx = updatedBalance.trx;
          } catch (error) {
            console.error(`   ❌ Failed to send TRX for fees:`, error.message);
            throw new Error(`Insufficient TRX for fees. Need to send ${minTRXForFees} TRX from admin wallet first.`);
          }
        }

        // Now sweep USDT
        try {
          await this.sweepUSDT(derivedAddress, balance.usdt);
        } catch (error) {
          // If address doesn't exist error, it means address isn't activated yet
          if (error.message.includes('does not exist') || error.message.includes('account')) {
            console.warn(`   ⚠️  Address ${derivedAddress} not activated yet. Will retry in next cycle.`);
            return; // Skip this address for now
          }
          // If resource insufficient, it means still not enough TRX
          if (error.message.includes('resource insufficient') || error.message.includes('insufficient')) {
            console.warn(`   ⚠️  Address ${derivedAddress} has insufficient TRX for fees. Will retry in next cycle.`);
            return; // Skip this address for now
          }
          throw error; // Re-throw other errors
        }
      }

      console.log(`✅ Swept funds from ${derivedAddress} to ${this.adminWallet}`);
    } catch (error) {
      console.error(`Error sweeping address ${intent.derivedAddress}:`, error.message);
      throw error;
    }
  }

  /**
   * Get balance of an address (TRX and USDT)
   * @param {string} address - TRON address
   * @returns {Promise<{trx: number, usdt: number}>}
   */
  async getAddressBalance(address) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': this.apiKey,
      };

      // Get TRX balance
      const accountResponse = await axios.get(
        `${this.apiUrl}/v1/accounts/${address}`,
        { headers, timeout: 10000 }
      );

      const trxBalance = accountResponse.data?.balance ? accountResponse.data.balance / 1000000 : 0;

      // Get USDT balance
      let usdtBalance = 0;
      try {
        const trc20Response = await axios.post(
          `${this.apiUrl}/wallet/triggerconstantcontract`,
          {
            owner_address: this.tronWeb.address.toHex(address),
            contract_address: this.tronWeb.address.toHex(this.usdtContract),
            function_selector: 'balanceOf(address)',
            parameter: this.tronWeb.utils.abi.encodeParams(['address'], [address]).substring(2),
          },
          { headers, timeout: 10000 }
        );

        if (trc20Response.data?.constant_result?.[0]) {
          usdtBalance = parseInt(trc20Response.data.constant_result[0], 16) / 1000000; // USDT has 6 decimals
        }
      } catch (error) {
        // USDT balance check failed, continue with 0
      }

      return {
        trx: trxBalance,
        usdt: usdtBalance,
      };
    } catch (error) {
      console.error(`Error getting balance for ${address}:`, error.message);
      return { trx: 0, usdt: 0 };
    }
  }

  /**
   * Sweep TRX from derived address to admin wallet
   * @param {string} fromAddress - Source address
   * @param {number} amount - Amount in TRX
   */
  async sweepTRX(fromAddress, amount) {
    try {
      const amountInSun = Math.floor(amount * 1000000); // Convert to sun

      const transaction = await this.tronWeb.transactionBuilder.sendTrx(
        this.adminWallet,
        amountInSun,
        fromAddress
      );

      const signedTx = await this.tronWeb.trx.sign(transaction);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      if (result.result) {
        console.log(`   ✅ Swept ${amount} TRX (TX: ${result.txid})`);
      } else {
        throw new Error(`TRX sweep failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error sweeping TRX:`, error.message);
      throw error;
    }
  }

  /**
   * Sweep USDT from derived address to admin wallet
   * @param {string} fromAddress - Source address
   * @param {number} amount - Amount in USDT
   */
  async sweepUSDT(fromAddress, amount) {
    try {
      const amountInSmallestUnit = Math.floor(amount * 1000000); // USDT has 6 decimals

      // Check if address exists/is activated first
      try {
        const accountInfo = await this.tronWeb.trx.getAccount(fromAddress);
        if (!accountInfo || !accountInfo.address) {
          throw new Error(`Account ${fromAddress} does not exist or is not activated`);
        }
      } catch (error) {
        if (error.message.includes('does not exist') || error.message.includes('not activated')) {
          throw new Error(`Account ${fromAddress} does not exist`);
        }
      }

      // Build TRC20 transfer transaction using contract instance
      const contract = await this.tronWeb.contract().at(this.usdtContract);
      
      // Use contract.transfer method
      const transaction = await contract.transfer(
        this.adminWallet,
        amountInSmallestUnit
      ).send({
        feeLimit: 100000000, // 100 TRX fee limit
        callValue: 0,
        shouldPollResponse: false,
      });

      if (!transaction) {
        throw new Error('Failed to build USDT transfer transaction');
      }

      // Sign and broadcast
      const signedTx = await this.tronWeb.trx.sign(transaction);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      if (result.result) {
        console.log(`   ✅ Swept ${amount} USDT to ${this.adminWallet} (TX: ${result.txid})`);
        return result.txid;
      } else {
        // Decode hex error message if present
        let errorMsg = result.message || 'Unknown error';
        if (errorMsg.match(/^[0-9a-f]+$/i) && errorMsg.length > 20) {
          try {
            errorMsg = Buffer.from(errorMsg, 'hex').toString('utf8');
          } catch (e) {
            // Keep original if decode fails
          }
        }
        throw new Error(`USDT sweep failed: ${errorMsg}`);
      }
    } catch (error) {
      // Decode hex error message if present
      let errorMsg = error.message || 'Unknown error';
      if (errorMsg.match(/^[0-9a-f]+$/i) && errorMsg.length > 20) {
        try {
          errorMsg = Buffer.from(errorMsg, 'hex').toString('utf8');
        } catch (e) {
          // Keep original if decode fails
        }
      }
      throw new Error(errorMsg);
    }
  }

  /**
   * Send TRX from admin wallet to derived address to cover transaction fees
   * @param {string} toAddress - Destination address
   * @param {number} amount - Amount in TRX (default: 0.1)
   */
  async sendTRXForFees(toAddress, amount = 0.1) {
    if (!this.adminWalletPrivateKey || !this.adminTronWeb) {
      throw new Error('Admin wallet private key not configured. Cannot send TRX for fees.');
    }

    try {
      const amountInSun = Math.floor(amount * 1000000); // Convert to sun

      // Build transaction from admin wallet
      const transaction = await this.adminTronWeb.transactionBuilder.sendTrx(
        toAddress,
        amountInSun,
        this.adminWallet
      );

      // Sign with admin wallet private key
      const signedTx = await this.adminTronWeb.trx.sign(transaction);
      
      // Broadcast transaction
      const result = await this.adminTronWeb.trx.sendRawTransaction(signedTx);

      if (result.result) {
        console.log(`   ✅ Sent ${amount} TRX for fees (TX: ${result.txid})`);
        return result.txid;
      } else {
        throw new Error(`Failed to send TRX: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error sending TRX for fees:`, error.message);
      throw error;
    }
  }

  /**
   * Immediately sweep funds from a specific payment intent (called after payment detection)
   * @param {Object} intent - Payment intent
   */
  async sweepPaymentIntent(intent) {
    try {
      // Wait a few seconds for transaction to be fully confirmed
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await this.sweepAddress(intent);
    } catch (error) {
      console.warn(`⚠️  Immediate sweep failed for ${intent.derivedAddress}. Will retry in next cycle:`, error.message);
      // Don't throw - will retry in periodic sweep
    }
  }
}

module.exports = new FundSweepService();
