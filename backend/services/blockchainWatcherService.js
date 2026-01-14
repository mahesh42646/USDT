const axios = require('axios');
const PaymentIntent = require('../schemas/paymentIntent');
const paymentIntentService = require('./paymentIntentService');
const Investment = require('../schemas/investment');
const User = require('../schemas/user');
const bs58 = require('bs58');
const crypto = require('crypto');

class BlockchainWatcherService {
  constructor() {
    this.apiKey = process.env.TRONGRID_API_KEY;
    this.apiUrl = process.env.TRONGRID_API_URL || 'https://api.shasta.trongrid.io';
    this.usdtContract = process.env.USDT_CONTRACT_ADDRESS || 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs';
    this.isRunning = false;
    this.watchInterval = null;
    this.checkInterval = 10000; // Check every 10 seconds
  }

  /**
   * Start the blockchain watcher
   */
  start() {
    if (this.isRunning) {
      console.log('Blockchain watcher already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting blockchain watcher...');

    // Run immediately, then on interval
    this.checkPayments();
    this.watchInterval = setInterval(() => {
      this.checkPayments();
    }, this.checkInterval);
  }

  /**
   * Stop the blockchain watcher
   */
  stop() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    this.isRunning = false;
    console.log('Blockchain watcher stopped');
  }

  /**
   * Check for payments to all pending addresses
   */
  async checkPayments() {
    try {
      // Get all pending payment intents
      const pendingIntents = await paymentIntentService.getPendingIntents();
      
      if (pendingIntents.length === 0) {
        return;
      }

      console.log(`Checking ${pendingIntents.length} pending payment intents...`);

      // Check each address
      for (const intent of pendingIntents) {
        await this.checkAddress(intent);
      }

      // Expire old intents
      await paymentIntentService.expireOldIntents();
    } catch (error) {
      console.error('Blockchain watcher error:', error.message);
    }
  }

  /**
   * Check a specific address for USDT payments
   * @param {Object} intent - Payment intent
   */
  async checkAddress(intent) {
    try {
      const address = intent.derivedAddress;
      
      // Get recent transactions to this address
      const transactions = await this.getRecentTransactions(address);

      if (!transactions || transactions.length === 0) {
        return;
      }

      // Process each transaction
      for (const tx of transactions) {
        await this.processTransaction(tx, intent);
      }
    } catch (error) {
      console.error(`Error checking address ${intent.derivedAddress}:`, error.message);
    }
  }

  /**
   * Get recent USDT TRC20 transactions to an address
   * @param {string} address - TRON address
   * @returns {Promise<Array>}
   */
  async getRecentTransactions(address) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': this.apiKey,
      };

      const transactions = [];

      // 1. Get TRC20 token transfers (USDT) to this address
      try {
        const trc20Response = await axios.get(
          `${this.apiUrl}/v1/accounts/${address}/transactions/trc20`,
          {
            headers,
            params: {
              limit: 50,
              only_confirmed: true,
              only_to: true,
              contract_address: this.usdtContract,
            },
            timeout: 15000,
          }
        );

        if (trc20Response.data?.data?.length) {
          for (const tx of trc20Response.data.data) {
            const txId = tx.transaction_id;
            
            // Check if transaction is already processed
            const existingIntent = await PaymentIntent.findOne({
              txHash: txId,
              status: 'paid',
            });

            if (existingIntent) {
              continue;
            }

            // Check if this is a USDT Transfer
            if (tx.token_info?.symbol === 'USDT' && tx.type === 'Transfer') {
              const fromAddress = tx.from;
              const toAddress = tx.to;
              const value = tx.value;
              
              if (toAddress && toAddress.toLowerCase() === address.toLowerCase()) {
                const amount = parseFloat(value) / (10 ** (tx.token_info.decimals || 6));

                transactions.push({
                  txId,
                  from: fromAddress,
                  to: toAddress,
                  amount,
                  currency: 'USDT',
                  timestamp: tx.block_timestamp || Date.now(),
                  blockNumber: tx.block_number || 0,
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error getting TRC20 transactions:`, error.message);
      }

      // TRX transfers removed - Only USDT (TRC20) is supported

      return transactions;
    } catch (error) {
      console.error(`Error getting transactions for ${address}:`, error.message);
      return [];
    }
  }

  /**
   * Parse transaction to extract USDT transfer
   * @param {Object} tx - Raw transaction
   * @param {string} expectedTo - Expected recipient address
   * @returns {Promise<Object|null>}
   */
  async parseTransaction(tx, expectedTo) {
    try {
      const txId = tx.txID || tx.transaction_id || tx.tx_hash || tx.hash || tx.id;
      if (!txId) return null;

      // Check if transaction succeeded
      if (tx.ret?.[0]?.contractRet !== 'SUCCESS') {
        return null;
      }

      // Check for USDT TRC20 transfer
      // Get transaction info with events
      const headers = {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': this.apiKey,
      };

      try {
        const infoResponse = await axios.get(
          `${this.apiUrl}/v1/transactions/${txId}/events`,
          { headers, timeout: 10000 }
        );

        if (infoResponse.data && infoResponse.data.length > 0) {
          // Find USDT Transfer event
          const usdtTransfer = infoResponse.data.find(event => 
            event.contract_address === this.usdtContract &&
            event.event_name === 'Transfer'
          );

          if (usdtTransfer && usdtTransfer.result) {
            const result = usdtTransfer.result;
            let toAddress = result.to;
            const fromAddress = result.from;
            const value = result.value;

            // Convert hex address to base58 if needed
            if (toAddress && !toAddress.startsWith('T')) {
              toAddress = this.hexToBase58(toAddress);
            }

            // Check if payment is to expected address (case-insensitive)
            if (toAddress && toAddress.toLowerCase() === expectedTo.toLowerCase()) {
              // USDT has 6 decimals
              const amount = parseFloat(value) / 1000000;

              return {
                txId,
                from: fromAddress,
                to: toAddress,
                amount,
                currency: 'USDT',
                timestamp: tx.block_timestamp || Date.now(),
                blockNumber: tx.blockNumber || 0,
              };
            }
          }
        }
      } catch (error) {
        // Try alternative method - check contract calls
        const contract = tx.raw_data?.contract?.find(c => c.type === 'TriggerSmartContract');
        if (contract) {
          const contractAddress = contract.parameter?.value?.contract_address;
          if (contractAddress && contractAddress.toLowerCase() === this.usdtContract.toLowerCase()) {
            // This is a USDT contract call, but we need to parse the data
            // For now, return null and let it be handled by event logs
            return null;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Parse transaction error:', error.message);
      return null;
    }
  }

  /**
   * Convert hex address to base58 (TRON address format)
   * @param {string} hex - Hex address
   * @returns {string} Base58 address
   */
  hexToBase58(hex) {
    try {
      // If it's already a base58 address (starts with T), return as is
      if (hex.startsWith('T') && hex.length === 34) {
        return hex;
      }
      
      // Remove '41' prefix if present (TRON address prefix)
      let addressHex = hex;
      if (hex.startsWith('41')) {
        addressHex = hex.substring(2);
      } else if (hex.startsWith('0x')) {
        addressHex = hex.substring(2);
      }
      
      // Convert hex to bytes
      const bytes = Buffer.from(addressHex, 'hex');
      
      // Add TRON address prefix (0x41 = 65 in decimal)
      const prefixedBytes = Buffer.concat([Buffer.from([0x41]), bytes]);
      
      // Double SHA256 hash
      const hash1 = crypto.createHash('sha256').update(prefixedBytes).digest();
      const hash2 = crypto.createHash('sha256').update(hash1).digest();
      
      // Take first 4 bytes as checksum
      const checksum = hash2.slice(0, 4);
      
      // Combine address + checksum
      const addressWithChecksum = Buffer.concat([prefixedBytes, checksum]);
      
      // Encode to base58
      const bs58Lib = bs58.default || bs58;
      return bs58Lib.encode(addressWithChecksum);
    } catch (error) {
      // Fallback: return hex if conversion fails
      return hex;
    }
  }

  /**
   * Process a matched transaction
   * @param {Object} tx - Parsed transaction
   * @param {Object} intent - Payment intent
   */
  async processTransaction(tx, intent) {
    try {
      // Verify transaction matches intent
      if (tx.to.toLowerCase() !== intent.derivedAddress.toLowerCase()) {
        return;
      }

      // Check if already processed
      const existing = await PaymentIntent.findOne({
        txHash: tx.txId,
        status: 'paid',
      });

      if (existing) {
        return; // Already processed
      }

      // Mark intent as paid
      const result = await paymentIntentService.markAsPaid(intent._id, {
        txHash: tx.txId,
        amountReceived: tx.amount,
      });

      if (!result.success) {
        console.error(`Failed to mark intent ${intent._id} as paid:`, result.error);
        return;
      }

      // Create investment
      await this.createInvestment(intent, tx);

      console.log(`✅ Payment detected: ${tx.amount} ${tx.currency} to ${intent.derivedAddress} (TX: ${tx.txId})`);

      // Immediately trigger fund sweep to admin wallet
      try {
        const fundSweepService = require('./fundSweepService');
        fundSweepService.sweepPaymentIntent(intent);
      } catch (error) {
        console.warn(`⚠️  Failed to trigger immediate sweep:`, error.message);
        // Will retry in periodic sweep cycle
      }
    } catch (error) {
      console.error('Process transaction error:', error.message);
    }
  }

  /**
   * Create investment from paid intent
   * @param {Object} intent - Payment intent
   * @param {Object} tx - Transaction data
   */
  async createInvestment(intent, tx) {
    try {
      const user = await User.findById(intent.userId);
      if (!user) {
        console.error(`User not found for intent ${intent._id}`);
        return;
      }

      // Check if investment already exists
      const existingInvestment = await Investment.findOne({
        transactionHash: tx.txId,
      });

      if (existingInvestment) {
        console.log(`Investment already exists for TX ${tx.txId}`);
        return;
      }

      // Calculate USD investment based on actual received amount (TRX or USDT)
      // Convert actual received amount to USD using real-time rate
      // ANY amount paid (in TRX or USDT) is accepted and converted properly
      const currencyConverter = require('./currencyConverter');
      const currencyToUsdConversion = await currencyConverter.convertCurrencyToUSD(tx.amount, tx.currency);
      
      // Use actual converted amount, or fallback to 1:1 if conversion fails
      // This ensures ANY amount paid is accepted and converted properly
      let investmentAmountUSD;
      if (currencyToUsdConversion.success) {
        investmentAmountUSD = currencyToUsdConversion.usdAmount;
        console.log(`💰 Converting ${tx.amount} ${tx.currency} to $${investmentAmountUSD.toFixed(2)} USD (Rate: ${currencyToUsdConversion.rate} USD per ${tx.currency})`);
      } else {
        // Fallback: assume 1:1 if conversion fails (USDT is usually 1:1 with USD)
        investmentAmountUSD = tx.amount;
        console.log(`💰 Using 1:1 fallback: ${tx.amount} USDT = $${investmentAmountUSD.toFixed(2)} USD`);
      }

      // Create investment
      const now = new Date();
      const lockInEndDate = new Date(now);
      lockInEndDate.setDate(lockInEndDate.getDate() + 90);

      const investment = new Investment({
        userId: intent.userId,
        amount: investmentAmountUSD,
        transactionHash: tx.txId,
        type: 'new',
        status: 'confirmed',
        confirmedAt: now,
        lockInEndDate: lockInEndDate,
        isAvailableForWithdrawal: false,
        paymentCurrency: 'USDT', // Only USDT supported
        paymentAmount: tx.amount,
      });

      await investment.save();

      // Update payment intent with investment ID
      intent.investmentId = investment._id;
      await intent.save();

      // Update user balance
      user.totalInvestment = (user.totalInvestment || 0) + investmentAmountUSD;
      user.currentInvestmentBalance = (user.currentInvestmentBalance || 0) + investmentAmountUSD;
      user.platoCoins = (user.platoCoins || 0) + investmentAmountUSD;
      await user.save();

      // Handle referral activation
      if (user.referrerId && user.totalInvestment >= 10) {
        const Referral = require('../schemas/referral');
        const referral = await Referral.findOne({
          referrerId: user.referrerId,
          referredUserId: user._id,
        });

        if (referral && referral.status === 'pending') {
          referral.status = 'active';
          referral.activatedAt = new Date();
          await referral.save();

          const referrer = await User.findById(user.referrerId);
          if (referrer) {
            referrer.directActiveReferrals = (referrer.directActiveReferrals || 0) + 1;
            await referrer.save();
          }
        }
      }

      console.log(`✅ Investment created: $${investmentAmountUSD} USD for user ${user._id}`);
    } catch (error) {
      console.error('Create investment error:', error.message);
    }
  }
}

module.exports = new BlockchainWatcherService();
