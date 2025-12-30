const axios = require('axios');
const Investment = require('../schemas/investment');
const User = require('../schemas/user');
const Referral = require('../schemas/referral');

class TRC20VerificationService {
  constructor() {
    this.apiKey = process.env.TRONGRID_API_KEY;
    this.apiUrl = process.env.TRONGRID_API_URL || 'https://api.trongrid.io';
    this.adminWallet = process.env.ADMIN_WALLET_ADDRESS;
    this.usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT TRC20 contract
  }

  // Convert hex address to base58 (TRON address format)
  hexToBase58(hex) {
    // This is a simplified version - in production, use a proper base58 library
    // For now, we'll use the API which returns addresses in hex format
    return hex;
  }

  // Verify transaction on TRON blockchain
  async verifyTransaction(transactionHash) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['TRON-PRO-API-KEY'] = this.apiKey;
      }

      // Get transaction info
      const txResponse = await axios.get(
        `${this.apiUrl}/v1/transactions/${transactionHash}`,
        { headers }
      );

      if (!txResponse.data || txResponse.data.length === 0) {
        return { valid: false, error: 'Transaction not found' };
      }

      const tx = txResponse.data[0];
      
      // Check if transaction is confirmed
      if (tx.ret && tx.ret[0] && tx.ret[0].contractRet !== 'SUCCESS') {
        return { valid: false, error: 'Transaction failed' };
      }

      // Get transaction info with more details
      const infoResponse = await axios.get(
        `${this.apiUrl}/v1/transactions/${transactionHash}/events`,
        { headers }
      );

      // Look for USDT transfer event
      let usdtTransfer = null;
      if (infoResponse.data && infoResponse.data.length > 0) {
        usdtTransfer = infoResponse.data.find(event => 
          event.contract_address === this.usdtContract &&
          event.event_name === 'Transfer'
        );
      }

      if (!usdtTransfer) {
        // Alternative: Check contract calls
        const contract = tx.raw_data?.contract?.find(c => c.type === 'TriggerSmartContract');
        if (contract && contract.parameter?.value?.contract_address === this.usdtContract) {
          // Decode transfer data
          const data = contract.parameter.value.data;
          if (data && data.startsWith('a9059cbb')) {
            // Transfer function signature
            // Amount is in the last 32 bytes (64 hex chars)
            const amountHex = data.slice(-64);
            const amount = parseInt(amountHex, 16) / 1000000; // USDT has 6 decimals
            
            // Get recipient address (20 bytes after function signature)
            const toAddressHex = '41' + data.slice(34, 74); // Add 41 prefix for base58
            
            return {
              valid: true,
              amount: amount,
              toAddress: toAddressHex,
              fromAddress: contract.parameter.value.owner_address,
              blockNumber: tx.blockNumber,
              timestamp: tx.block_timestamp,
            };
          }
        }
        return { valid: false, error: 'Not a USDT transfer transaction' };
      }

      // Extract amount from transfer event
      const amountHex = usdtTransfer.result?.value || usdtTransfer.data?.value;
      const amount = amountHex ? parseInt(amountHex, 16) / 1000000 : 0;

      // Get recipient address
      const toAddress = usdtTransfer.result?.to || usdtTransfer.data?.to;
      const fromAddress = usdtTransfer.result?.from || usdtTransfer.data?.from;

      return {
        valid: true,
        amount: amount,
        toAddress: toAddress,
        fromAddress: fromAddress,
        blockNumber: tx.blockNumber,
        timestamp: tx.block_timestamp,
      };
    } catch (error) {
      console.error('TRC20 verification error:', error.response?.data || error.message);
      return { valid: false, error: error.message || 'Verification failed' };
    }
  }

  // Process pending investments automatically
  async processPendingInvestments() {
    try {
      if (!this.adminWallet) {
        console.log('Admin wallet address not configured. Skipping auto-verification.');
        return { success: false, error: 'Admin wallet not configured' };
      }

      // Get all pending investments
      const pendingInvestments = await Investment.find({
        status: 'pending',
        type: 'new',
      }).populate('userId');

      if (pendingInvestments.length === 0) {
        return { success: true, processed: 0, confirmed: 0, failed: 0 };
      }

      let processedCount = 0;
      let confirmedCount = 0;
      let failedCount = 0;

      for (const investment of pendingInvestments) {
        try {
          // Skip if transaction hash starts with GATEWAY- (gateway payments)
          if (investment.transactionHash.startsWith('GATEWAY-')) {
            continue;
          }

          // Verify transaction
          const verification = await this.verifyTransaction(investment.transactionHash);

          if (verification.valid) {
            // Check if amount matches (allow small difference for fees)
            const amountDifference = Math.abs(verification.amount - investment.amount);
            const tolerance = 0.01; // 0.01 USDT tolerance

            if (amountDifference <= tolerance) {
              // Verify recipient is admin wallet (convert hex to base58 if needed)
              // For now, we'll do a simple check - you may need to adjust based on API response format
              const recipientMatches = verification.toAddress && (
                verification.toAddress.toLowerCase() === this.adminWallet.toLowerCase() ||
                verification.toAddress.includes(this.adminWallet.substring(1)) // Handle hex/base58 conversion
              );

              if (recipientMatches || !verification.toAddress) {
                // Confirm investment
                investment.status = 'confirmed';
                investment.confirmedAt = new Date();
                
                if (!investment.lockInEndDate) {
                  const lockInEndDate = new Date();
                  lockInEndDate.setDate(lockInEndDate.getDate() + 90);
                  investment.lockInEndDate = lockInEndDate;
                }
                
                await investment.save();

                // Update user balance
                const user = investment.userId;
                if (user) {
                  user.totalInvestment = (user.totalInvestment || 0) + investment.amount;
                  user.currentInvestmentBalance = (user.currentInvestmentBalance || 0) + investment.amount;
                  user.platoCoins = (user.platoCoins || 0) + investment.amount;
                  await user.save();

                  // Handle referral activation
                  if (user.referrerId && user.totalInvestment >= 10) {
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
                }

                confirmedCount++;
                console.log(`✅ Auto-confirmed investment ${investment._id} for ${investment.amount} USDT`);
              } else {
                console.log(`❌ Investment ${investment._id}: Wrong recipient address. Expected: ${this.adminWallet}, Got: ${verification.toAddress}`);
                failedCount++;
              }
            } else {
              console.log(`❌ Investment ${investment._id}: Amount mismatch. Expected: ${investment.amount}, Got: ${verification.amount}`);
              failedCount++;
            }
          } else {
            console.log(`❌ Investment ${investment._id}: Verification failed - ${verification.error}`);
            failedCount++;
          }

          processedCount++;

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error processing investment ${investment._id}:`, error);
          failedCount++;
        }
      }

      return {
        success: true,
        processed: processedCount,
        confirmed: confirmedCount,
        failed: failedCount,
      };
    } catch (error) {
      console.error('Process pending investments error:', error);
      throw error;
    }
  }
}

module.exports = new TRC20VerificationService();

