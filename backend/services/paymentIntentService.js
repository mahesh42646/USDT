const PaymentIntent = require('../schemas/paymentIntent');
const getHDWallet = require('./hdWalletService');
const qrcode = require('qrcode');

class PaymentIntentService {
  constructor() {
    this.usdtContract = process.env.USDT_CONTRACT_ADDRESS || 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs';
  }

  /**
   * Create a new payment intent with unique derived address
   * @param {Object} params
   * @param {string} params.userId - User ID
   * @param {number} params.usdAmount - USD amount to invest
   * @param {string} params.currency - Payment currency (USDT or TRX)
   * @param {number} params.expiresInMinutes - Expiration time in minutes (default: 15)
   * @returns {Promise<Object>} Payment intent with QR code
   */
  async createPaymentIntent({ userId, usdAmount, currency = 'USDT', convertedAmount = null, expiresInMinutes = 15 }) {
    try {
      // Generate new unique address
      const hdWallet = getHDWallet();
      let address, index;
      let attempts = 0;
      const maxAttempts = 10;

      // Retry if address already exists (shouldn't happen, but safety check)
      while (attempts < maxAttempts) {
        const result = await hdWallet.generateNewAddress();
        address = result.address;
        index = result.index;

        // Check if address already exists in database (case-insensitive)
        const existing = await PaymentIntent.findOne({ 
          derivedAddress: { $regex: new RegExp(`^${address}$`, 'i') }
        });
        
        if (!existing) {
          break; // Address is unique, proceed
        }

        console.warn(`⚠️  Address ${address} already exists (index ${index}), generating new one...`);
        attempts++;
      }

      if (attempts >= maxAttempts) {
        console.error(`❌ Failed to generate unique address after ${maxAttempts} attempts.`);
        console.error(`   This usually means the HD wallet index is out of sync.`);
        console.error(`   Please run: cd backend && node scripts/resetHDWallet.js`);
        throw new Error('Failed to generate unique address. Please run reset script to clear old addresses.');
      }

      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

      // Create payment intent
      const paymentIntent = new PaymentIntent({
        userId,
        derivedAddress: address,
        derivationIndex: index,
        asset: currency || 'USDT',
        usdAmount,
        convertedAmount: convertedAmount || 0,
        status: 'pending',
        expiresAt,
      });

      await paymentIntent.save();

      // Generate QR code with address only (no prefix, no amount)
      // Most wallets will open send screen when scanning address
      const qrCode = await qrcode.toDataURL(address, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 400,
        margin: 2,
      });

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent._id,
          orderId: paymentIntent._id.toString(),
          derivedAddress: address,
          qrCode,
          usdAmount,
          convertedAmount: paymentIntent.convertedAmount,
          currency: paymentIntent.asset,
          expiresAt: paymentIntent.expiresAt,
          status: paymentIntent.status,
        },
      };
    } catch (error) {
      console.error('Create payment intent error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment intent',
      };
    }
  }

  /**
   * Get payment intent by ID
   * @param {string} intentId - Payment intent ID
   * @param {string} userId - User ID (optional, for validation)
   * @returns {Promise<Object|null>}
   */
  async getPaymentIntent(intentId, userId = null) {
    try {
      const query = { _id: intentId };
      if (userId) {
        query.userId = userId;
      }
      return await PaymentIntent.findOne(query).populate('userId');
    } catch (error) {
      console.error('Get payment intent error:', error);
      return null;
    }
  }

  /**
   * Get payment intent by derived address
   * @param {string} address - Derived address
   * @returns {Promise<Object|null>}
   */
  async getPaymentIntentByAddress(address) {
    try {
      return await PaymentIntent.findOne({
        derivedAddress: address.toLowerCase(),
        status: 'pending',
      }).populate('userId');
    } catch (error) {
      console.error('Get payment intent by address error:', error);
      return null;
    }
  }

  /**
   * Mark payment intent as paid
   * @param {string} intentId - Payment intent ID
   * @param {Object} paymentData - Payment data (txHash, amountReceived)
   * @returns {Promise<Object>}
   */
  async markAsPaid(intentId, paymentData) {
    try {
      const { txHash, amountReceived } = paymentData;
      
      const paymentIntent = await PaymentIntent.findById(intentId);
      if (!paymentIntent) {
        return { success: false, error: 'Payment intent not found' };
      }

      if (paymentIntent.status !== 'pending') {
        return { success: false, error: `Payment intent is already ${paymentIntent.status}` };
      }

      paymentIntent.status = 'paid';
      paymentIntent.txHash = txHash;
      paymentIntent.amountReceived = amountReceived;
      paymentIntent.paidAt = new Date();
      await paymentIntent.save();

      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Mark as paid error:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark as paid',
      };
    }
  }

  /**
   * Get all pending payment intents
   * @returns {Promise<Array>}
   */
  async getPendingIntents() {
    try {
      return await PaymentIntent.find({
        status: 'pending',
        expiresAt: { $gt: new Date() },
      }).populate('userId');
    } catch (error) {
      console.error('Get pending intents error:', error);
      return [];
    }
  }

  /**
   * Expire old payment intents
   * @returns {Promise<number>} Number of expired intents
   */
  async expireOldIntents() {
    try {
      const result = await PaymentIntent.updateMany(
        {
          status: 'pending',
          expiresAt: { $lt: new Date() },
        },
        {
          $set: { status: 'expired' },
        }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error('Expire old intents error:', error);
      return 0;
    }
  }
}

module.exports = new PaymentIntentService();
