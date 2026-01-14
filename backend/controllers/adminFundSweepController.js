const PaymentIntent = require('../schemas/paymentIntent');
const fundSweepService = require('../services/fundSweepService');

/**
 * Get unswept balances (addresses with funds that haven't been swept)
 */
exports.getUnsweptBalances = async (req, res) => {
  try {
    // Get all paid payment intents
    const paidIntents = await PaymentIntent.find({
      status: 'paid',
      txHash: { $ne: null },
    }).populate('userId', 'mobile fullName').sort({ paidAt: -1 });

    const unsweptAddresses = [];

    // Check balance for each address
    for (const intent of paidIntents) {
      try {
        const balance = await fundSweepService.getAddressBalance(intent.derivedAddress);
        
        if (balance && balance.usdt > 0) {
          unsweptAddresses.push({
            address: intent.derivedAddress,
            derivationIndex: intent.derivationIndex,
            usdAmount: intent.usdAmount,
            amountReceived: intent.amountReceived,
            usdtBalance: balance.usdt,
            trxBalance: balance.trx,
            paidAt: intent.paidAt,
            transactionHash: intent.txHash,
            userId: intent.userId?._id || null,
            userMobile: intent.userId?.mobile || 'N/A',
            userName: intent.userId?.fullName || 'N/A',
            investmentId: intent.investmentId,
          });
        }
      } catch (error) {
        console.error(`Error checking balance for ${intent.derivedAddress}:`, error.message);
        // Still include it but mark as error
        unsweptAddresses.push({
          address: intent.derivedAddress,
          derivationIndex: intent.derivationIndex,
          usdAmount: intent.usdAmount,
          amountReceived: intent.amountReceived,
          usdtBalance: 0,
          trxBalance: 0,
          paidAt: intent.paidAt,
          transactionHash: intent.txHash,
          userId: intent.userId?._id || null,
          userMobile: intent.userId?.mobile || 'N/A',
          userName: intent.userId?.fullName || 'N/A',
          investmentId: intent.investmentId,
          error: error.message,
        });
      }
    }

    // Calculate totals
    const totalUnsweptUSDT = unsweptAddresses.reduce((sum, addr) => sum + (addr.usdtBalance || 0), 0);
    const totalUnsweptTRX = unsweptAddresses.reduce((sum, addr) => sum + (addr.trxBalance || 0), 0);
    const totalAddresses = unsweptAddresses.length;

    res.json({
      success: true,
      data: {
        addresses: unsweptAddresses,
        summary: {
          totalAddresses,
          totalUnsweptUSDT: totalUnsweptUSDT.toFixed(6),
          totalUnsweptTRX: totalUnsweptTRX.toFixed(6),
          adminWallet: process.env.ADMIN_WALLET_ADDRESS,
        },
      },
    });
  } catch (error) {
    console.error('Get unswept balances error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get unswept balances',
    });
  }
};

/**
 * Manually trigger fund sweep for all unswept addresses
 */
exports.triggerSweep = async (req, res) => {
  try {
    const { address } = req.body; // Optional: sweep specific address

    if (address) {
      // Sweep specific address
      const intent = await PaymentIntent.findOne({
        derivedAddress: address,
        status: 'paid',
      });

      if (!intent) {
        return res.status(404).json({
          success: false,
          message: 'Payment intent not found for this address',
        });
      }

      try {
        await fundSweepService.sweepAddress(intent);
        res.json({
          success: true,
          message: `Funds swept from ${address} to admin wallet`,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: `Failed to sweep address: ${error.message}`,
        });
      }
    } else {
      // Sweep all unswept addresses
      const result = await fundSweepService.sweepFunds();
      res.json({
        success: true,
        message: 'Fund sweep triggered successfully',
        data: result,
      });
    }
  } catch (error) {
    console.error('Trigger sweep error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to trigger sweep',
    });
  }
};

/**
 * Get sweep service status
 */
exports.getSweepStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        isRunning: fundSweepService.isRunning,
        sweepIntervalMinutes: fundSweepService.sweepIntervalMinutes,
        adminWallet: process.env.ADMIN_WALLET_ADDRESS,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get sweep status',
    });
  }
};
