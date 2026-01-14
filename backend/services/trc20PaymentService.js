const axios = require('axios');
const crypto = require('crypto');
const QRCode = require('qrcode');
const bs58 = require('bs58');

class TRC20PaymentService {
  constructor() {
    this.apiKey = process.env.TRONGRID_API_KEY || '1ad77570-fe58-42dc-9edb-e21a54514d84';
    // Use Shasta Testnet for testing, Mainnet for production
    this.useTestnet = process.env.TRON_NETWORK === 'testnet' || process.env.TRON_NETWORK === 'shasta';
    this.apiUrl = this.useTestnet 
      ? (process.env.TRONGRID_API_URL || 'https://api.shasta.trongrid.io')
      : (process.env.TRONGRID_API_URL || 'https://api.trongrid.io');
    this.adminWallet = process.env.ADMIN_WALLET_ADDRESS || 'TGxinWnWkaczv8kCGe13Q81NMDcd5qtr8d';
    
    // USDT Contract Addresses
    // Shasta Testnet USDT: TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs (official testnet USDT)
    // Mainnet USDT: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
    if (process.env.USDT_CONTRACT_ADDRESS) {
      this.usdtContract = process.env.USDT_CONTRACT_ADDRESS;
    } else {
      this.usdtContract = this.useTestnet
        ? 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs' // Shasta Testnet USDT
        : 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // Mainnet USDT
    }
    
  }

  // Generate QR code for payment (supports TRX and USDT)
  // Using address-only QR for maximum wallet compatibility
  // Most wallets will open send screen when scanning address
  async generateQRCode(paymentData) {
    try {
      const paymentAddress = this.adminWallet;
      const amount = parseFloat(paymentData.amount);
      const currency = paymentData.currency || 'TRX';
      
      // Calculate amount in smallest unit (for reference, not in QR)
      let amountInSmallestUnit = 0;
      if (currency === 'USDT' || currency === 'USDTTRC20') {
        // USDT has 6 decimals
        amountInSmallestUnit = Math.round(amount * 1000000);
      } else {
        // TRX has 6 decimals (sun)
        amountInSmallestUnit = Math.round(amount * 1000000);
      }
      
      // Generate QR code with ONLY THE ADDRESS for maximum wallet compatibility
      // Most TRON wallets recognize address-only QR codes and open send screen
      // The address format is universally supported across all TRON wallets
      const qrCodeDataUrl = await QRCode.toDataURL(paymentAddress, {
        errorCorrectionLevel: 'H', // High error correction for better scanning
        type: 'image/png',
        quality: 0.92,
        margin: 2, // Increased margin for better scanning
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 400, // Larger size for better scanning
      });

      // Also generate TRON URI for display/reference (but not in QR code)
      let paymentUri = '';
      if (currency === 'USDT' || currency === 'USDTTRC20') {
        paymentUri = `tron:${paymentAddress}?amount=${amountInSmallestUnit}&token=${this.usdtContract}`;
      } else {
        paymentUri = `tron:${paymentAddress}?amount=${amountInSmallestUnit}`;
      }


      return {
        success: true,
        qrCode: qrCodeDataUrl,
        paymentUri: paymentUri, // TRON URI for reference (not in QR)
        paymentAddress: paymentAddress,
        amount: amount, // Exact amount user entered
        currency: currency, // Payment currency
        amountInSmallestUnit: amountInSmallestUnit, // Amount in smallest unit
        orderId: paymentData.orderId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate QR code',
      };
    }
  }

  // Verify transaction on TRON blockchain - accepts ANY amount if expectedAmount is 0
  async verifyTransaction(transactionHash, expectedAmount = 0, expectedToAddress, currency = 'TRX') {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': this.apiKey,
      };

      // Get transaction details - try different endpoints for Shasta Testnet
      let tx;
      
      // Method 1: Try wallet/gettransactionbyid (most reliable for Shasta)
      try {
        const txResponse = await axios.post(
          `${this.apiUrl}/wallet/gettransactionbyid`,
          { value: transactionHash },
          { headers, timeout: 10000 }
        );
        
        if (txResponse.data && txResponse.data.txID) {
          tx = txResponse.data;
        }
      } catch (error1) {
        // Method 2: Try v1/transactions endpoint
        try {
          const txResponse = await axios.get(
            `${this.apiUrl}/v1/transactions/${transactionHash}`,
            { headers, timeout: 10000 }
          );
          
          if (txResponse.data) {
            if (Array.isArray(txResponse.data) && txResponse.data.length > 0) {
              tx = txResponse.data[0];
            } else if (!Array.isArray(txResponse.data) && txResponse.data.txID) {
              tx = txResponse.data;
            }
          }
        } catch (error2) {
          return {
            valid: false,
            error: `Transaction not found on blockchain: ${error2.message}`,
          };
        }
      }

      if (!tx || !tx.txID) {
        return {
          valid: false,
          error: 'Transaction not found or invalid format',
        };
      }

      // Check if transaction is confirmed
      if (tx.ret && tx.ret[0] && tx.ret[0].contractRet !== 'SUCCESS') {
        return {
          valid: false,
          error: 'Transaction failed on blockchain',
        };
      }

      // Get transaction info with contract details (only for USDT, not needed for TRX)
      let infoResponse = { data: [] };
      if (currency !== 'TRX') {
        try {
          infoResponse = await axios.get(
            `${this.apiUrl}/v1/transactions/${transactionHash}/events`,
            { headers, timeout: 10000 }
          );
        } catch (error) {
          // Events fetch failed, continue with contract check
        }
      }

      // Handle TRX (native) vs USDT (TRC20) transactions
      if (currency === 'TRX') {
        // For TRX, check TransferContract (native TRX transfer)
        const transferContract = tx.raw_data?.contract?.find(c => c.type === 'TransferContract');
        
        if (transferContract) {
          const transferAmount = transferContract.parameter?.value?.amount || 0;
          const transferTo = this.hexToBase58(transferContract.parameter?.value?.to_address || '');
          const transferFrom = this.hexToBase58(transferContract.parameter?.value?.owner_address || '');
          
          // Convert from sun to TRX (1 TRX = 1,000,000 sun)
          const amountInTRX = transferAmount / 1000000;
          
          // Validate amount only if expectedAmount is provided (> 0)
          if (expectedAmount > 0) {
            const amountDiff = Math.abs(amountInTRX - expectedAmount);
            if (amountDiff > 0.01) {
              return {
                valid: false,
                error: `Amount mismatch. Expected: ${expectedAmount} TRX, Received: ${amountInTRX.toFixed(6)} TRX`,
                receivedAmount: amountInTRX,
              };
            }
          }
          
          // Check recipient address
          const transferToLower = transferTo.toLowerCase();
          const expectedToLower = expectedToAddress.toLowerCase();
          
          if (transferToLower !== expectedToLower) {
            return {
              valid: false,
              error: `Address mismatch. Expected: ${expectedToAddress}, Received: ${transferTo}`,
            };
          }
          
          // Get block number for confirmation count
          const blockNumber = tx.blockNumber || 0;
          const currentBlockResponse = await axios.get(
            `${this.apiUrl}/wallet/getnowblock`,
            { headers, timeout: 10000 }
          );
          const currentBlock = currentBlockResponse.data?.block_header?.raw_data?.number || blockNumber;
          const confirmations = currentBlock - blockNumber;
          
          return {
            valid: true,
            amount: amountInTRX,
            receivedAmount: amountInTRX, // Alias for compatibility
            from: transferFrom,
            to: transferTo,
            transactionHash: transactionHash,
            blockNumber: blockNumber,
            confirmations: confirmations,
            timestamp: tx.block_timestamp || Date.now(),
          };
        } else {
          return {
            valid: false,
            error: 'TRX transfer not found in transaction',
          };
        }
      }
      
      // For USDT (TRC20), look for USDT transfer event
      let usdtTransfer = null;
      if (infoResponse.data && infoResponse.data.length > 0) {
        usdtTransfer = infoResponse.data.find(event => {
          return (
            event.contract_address &&
            event.contract_address.toLowerCase() === this.usdtContract.toLowerCase() &&
            event.event_name === 'Transfer'
          );
        });
      }

      if (!usdtTransfer) {
        // Try alternative method: check contract calls in transaction
        const contract = tx.raw_data?.contract?.find(c => 
          c.type === 'TriggerSmartContract' &&
          c.parameter?.value?.contract_address &&
          this.hexToBase58(c.parameter.value.contract_address).toLowerCase() === this.usdtContract.toLowerCase()
        );

        if (!contract) {
          return {
            valid: false,
            error: 'USDT transfer not found in transaction',
          };
        }
      }

      // Extract transfer details from event
      let transferAmount = null;
      let transferTo = null;
      let transferFrom = null;

      if (usdtTransfer && usdtTransfer.result) {
        // Parse Transfer event data
        // Transfer(address indexed from, address indexed to, uint256 value)
        const result = usdtTransfer.result;
        if (result.from && result.to && result.value) {
          // TronGrid API returns addresses in hex format, need to convert
          transferFrom = result.from;
          transferTo = result.to;
          // USDT has 6 decimals
          transferAmount = parseFloat(result.value) / 1000000;
        }
      }

      // If event parsing didn't work, try alternative method
      if (!transferAmount) {
        // Get transaction info with contract details
        const contractInfoResponse = await axios.get(
          `${this.apiUrl}/v1/transactions/${transactionHash}`,
          { headers, timeout: 10000 }
        );

        if (contractInfoResponse.data && contractInfoResponse.data.length > 0) {
          const contractTx = contractInfoResponse.data[0];
          const contract = contractTx.raw_data?.contract?.find(c => 
            c.type === 'TriggerSmartContract' &&
            c.parameter?.value?.contract_address
          );

          if (contract) {
            const contractAddressHex = contract.parameter.value.contract_address;
            // Convert hex to base58 for comparison
            const contractAddress = this.hexToBase58(contractAddressHex);
            
            if (contractAddress.toLowerCase() === this.usdtContract.toLowerCase() ||
                contractAddressHex.toLowerCase() === this.usdtContract.toLowerCase()) {
              // Try to extract amount from data parameter
              const data = contract.parameter.value.data;
              if (data && data.length >= 136) {
                // Transfer function signature: a9059cbb
                // Parameters: to (address, 32 bytes), value (uint256, 32 bytes)
                const toAddressHex = '41' + data.substring(32, 72); // Add TRON prefix
                transferTo = this.hexToBase58(toAddressHex);
                const amountHex = data.substring(72, 136);
                transferAmount = parseInt(amountHex, 16) / 1000000; // USDT has 6 decimals
              }
            }
          }
        }
      }

      // Validate transaction
      if (!transferAmount || !transferTo) {
        return {
          valid: false,
          error: 'Could not extract transfer details from transaction',
        };
      }

      // Check if amount matches only if expectedAmount is provided (> 0)
      if (expectedAmount > 0) {
        const amountDiff = Math.abs(transferAmount - expectedAmount);
        if (amountDiff > 0.01) {
          return {
            valid: false,
            error: `Amount mismatch. Expected: ${expectedAmount} USDT, Received: ${transferAmount.toFixed(6)} USDT`,
            receivedAmount: transferAmount,
          };
        }
      }

      // Check if sent to correct address (handle both hex and base58 formats)
      const transferToLower = transferTo.toLowerCase();
      const expectedToLower = expectedToAddress.toLowerCase();
      const transferToBase58 = transferTo.startsWith('T') ? transferTo : this.hexToBase58(transferTo);
      const expectedToBase58 = expectedToAddress.startsWith('T') ? expectedToAddress : this.hexToBase58(expectedToAddress);
      
      if (transferToLower !== expectedToLower && 
          transferToBase58.toLowerCase() !== expectedToBase58.toLowerCase() &&
          transferToBase58.toLowerCase() !== expectedToLower) {
        return {
          valid: false,
          error: `Address mismatch. Expected: ${expectedToAddress}, Received: ${transferTo}`,
        };
      }

      // Get block number for confirmation count
      const blockNumber = tx.blockNumber || 0;
      const currentBlockResponse = await axios.get(
        `${this.apiUrl}/wallet/getnowblock`,
        { headers, timeout: 10000 }
      );
      const currentBlock = currentBlockResponse.data?.block_header?.raw_data?.number || blockNumber;
      const confirmations = currentBlock - blockNumber;

      return {
        valid: true,
        amount: transferAmount,
        receivedAmount: transferAmount, // Alias for compatibility
        from: transferFrom,
        to: transferTo,
        transactionHash: transactionHash,
        blockNumber: blockNumber,
        confirmations: confirmations,
        timestamp: tx.block_timestamp || Date.now(),
      };
    } catch (error) {
      return {
        valid: false,
        error: error.response?.data?.message || error.message || 'Failed to verify transaction',
      };
    }
  }

  // Convert hex address to base58 (TRON address format)
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
      
      // Encode to base58 - handle default export
      const bs58Lib = bs58.default || bs58;
      return bs58Lib.encode(addressWithChecksum);
    } catch (error) {
      // Fallback: return hex if conversion fails
      return hex;
    }
  }

  // Get ALL recent transactions to admin wallet (for matching to payments)
  async getAllRecentTransactions(limit = 50) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': this.apiKey,
      };
      
      const response = await axios.get(
        `${this.apiUrl}/v1/accounts/${this.adminWallet}/transactions`,
        {
          headers,
          params: {
            limit: limit,
            only_confirmed: true,
            only_to: true,
          },
          timeout: 15000,
        }
      );

      if (!response.data?.data?.length) {
        return [];
      }

      const transactions = [];
      for (const tx of response.data.data) {
        const txId = tx.txID || tx.transaction_id || tx.tx_hash || tx.hash || tx.id;
        if (!txId) continue;
        if (tx.ret?.[0]?.contractRet !== 'SUCCESS') continue;
        
        const contracts = tx.raw_data?.contract || [];
        const transferContract = contracts.find(c => c.type === 'TransferContract');
        
        if (transferContract?.parameter?.value) {
          const toAddressHex = transferContract.parameter.value.to_address;
          let addressMatches = false;
          let transferTo = '';
          
          try {
            transferTo = this.hexToBase58(toAddressHex);
            addressMatches = transferTo.toLowerCase() === this.adminWallet.toLowerCase();
          } catch (error) {
            try {
              const bs58Lib = bs58.default || bs58;
              const adminWalletBuf = bs58Lib.decode(this.adminWallet);
              const adminWalletHex = adminWalletBuf.slice(0, -4).toString('hex');
              const txHex = toAddressHex.toLowerCase();
              const adminHex = adminWalletHex.toLowerCase();
              addressMatches = txHex === adminHex || txHex === adminHex.substring(2) || adminHex === txHex.substring(2);
              if (addressMatches) transferTo = this.adminWallet;
            } catch (e) {
              continue;
            }
          }
          
          if (addressMatches) {
            const txAmount = transferContract.parameter.value.amount || 0;
            const amountInTRX = txAmount / 1000000;
            
            // Extract sender address
            let transferFrom = '';
            try {
              const fromAddressHex = transferContract.parameter.value.owner_address || transferContract.parameter.value.from_address;
              if (fromAddressHex) {
                transferFrom = this.hexToBase58(fromAddressHex);
              }
            } catch (error) {
              continue;
            }
            
            if (!transferFrom) continue;
            
            transactions.push({
              transactionHash: txId,
              amount: amountInTRX,
              from: transferFrom,
              to: transferTo || this.adminWallet,
              timestamp: tx.block_timestamp || 0,
              blockNumber: tx.blockNumber || 0,
            });
          }
        }
      }

      return transactions;
    } catch (error) {
      return [];
    }
  }

  // Check if payment was received - accepts ANY amount, matches by time window only
  // IMPORTANT: Transaction hash uniqueness is checked in controller to prevent duplicate matching
  async checkPaymentStatus(orderId, expectedAmount, currency = 'TRX', paymentCreatedAt = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': this.apiKey,
      };
      
      const response = await axios.get(
        `${this.apiUrl}/v1/accounts/${this.adminWallet}/transactions`,
        {
          headers,
          params: {
            limit: 50,
            only_confirmed: true,
            only_to: true,
          },
          timeout: 15000,
        }
      );

      if (!response.data?.data?.length) {
        return { found: false, message: 'No recent transactions' };
      }

      const transactions = response.data.data;
      const paymentTime = paymentCreatedAt ? new Date(paymentCreatedAt).getTime() : Date.now() - 15 * 60 * 1000;
      const timeWindow = 20 * 60 * 1000; // 20 minutes
      
      // Find transactions within time window (sorted by timestamp, newest first)
      const validTransactions = [];
      for (const tx of transactions) {
        const txId = tx.txID || tx.transaction_id || tx.tx_hash || tx.hash || tx.id;
        if (!txId) continue;
        if (tx.ret?.[0]?.contractRet !== 'SUCCESS') continue;
        
        const txTimestamp = tx.block_timestamp || 0;
        if (paymentCreatedAt && (txTimestamp < paymentTime || txTimestamp > paymentTime + timeWindow)) continue;
        
        const contracts = tx.raw_data?.contract || [];
        const transferContract = contracts.find(c => c.type === 'TransferContract');
        
        if (transferContract?.parameter?.value) {
          const toAddressHex = transferContract.parameter.value.to_address;
          let addressMatches = false;
          let transferTo = '';
          
          try {
            transferTo = this.hexToBase58(toAddressHex);
            addressMatches = transferTo.toLowerCase() === this.adminWallet.toLowerCase();
          } catch (error) {
            try {
              const bs58Lib = bs58.default || bs58;
              const adminWalletBuf = bs58Lib.decode(this.adminWallet);
              const adminWalletHex = adminWalletBuf.slice(0, -4).toString('hex');
              const txHex = toAddressHex.toLowerCase();
              const adminHex = adminWalletHex.toLowerCase();
              addressMatches = txHex === adminHex || txHex === adminHex.substring(2) || adminHex === txHex.substring(2);
              if (addressMatches) transferTo = this.adminWallet;
            } catch (e) {
              continue;
            }
          }
          
          if (addressMatches) {
            const txAmount = transferContract.parameter.value.amount || 0;
            const amountInTRX = txAmount / 1000000;
            
            // Extract sender address (who actually paid)
            let transferFrom = '';
            try {
              const fromAddressHex = transferContract.parameter.value.owner_address || transferContract.parameter.value.from_address;
              if (fromAddressHex) {
                transferFrom = this.hexToBase58(fromAddressHex);
              }
            } catch (error) {
              // Sender address extraction failed, skip
              continue;
            }
            
            if (!transferFrom) continue; // Must have sender address
            
            validTransactions.push({
              txId,
              amount: amountInTRX,
              timestamp: txTimestamp,
              transferTo: transferTo || this.adminWallet,
              transferFrom: transferFrom, // WHO PAID (sender address)
              blockNumber: tx.blockNumber || 0,
            });
          }
        }
      }

      // Return first valid transaction with sender address (who actually paid)
      if (validTransactions.length > 0) {
        const tx = validTransactions[0]; // Most recent transaction
        return {
          found: true,
          transactionHash: tx.txId,
          verification: {
            valid: true,
            amount: tx.amount,
            from: tx.transferFrom, // WHO PAID - critical for matching
            to: tx.transferTo,
            transactionHash: tx.txId,
            blockNumber: tx.blockNumber,
            timestamp: tx.timestamp,
          },
        };
      }

      return { found: false, message: 'No payment found' };
    } catch (error) {
      return { found: false, error: 'Payment check failed' };
    }
  }

  // Poll for payment confirmation
  async pollForPayment(orderId, expectedAmount, maxAttempts = 30, intervalSeconds = 10) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const status = await this.checkPaymentStatus(orderId, expectedAmount);
      
      if (status.found && status.verification && status.verification.valid) {
        return {
          success: true,
          transactionHash: status.transactionHash,
          verification: status.verification,
          attempts: attempt,
        };
      }

      // Wait before next attempt
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
      }
    }

    return {
      success: false,
      message: 'Payment not found after maximum attempts',
      attempts: maxAttempts,
    };
  }
}

module.exports = new TRC20PaymentService();
