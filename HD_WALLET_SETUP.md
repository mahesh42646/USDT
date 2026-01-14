# HD Wallet Payment System Setup Guide

## Overview
This system uses HD (Hierarchical Deterministic) wallets to generate unique payment addresses for each investment. Each user gets a unique address that is never reused, ensuring secure and automatic payment detection.

## Initial Setup (One-Time)

### Step 1: Generate Master Seed

Run the seed generator script:

```bash
cd backend
node scripts/generateHDSeed.js
```

This will:
- Generate a new BIP39 mnemonic (12 or 24 words)
- Encrypt it with your encryption key
- Output the encrypted seed for your `.env` file

**IMPORTANT**: 
- Save the mnemonic phrase securely offline
- Never commit the encrypted seed to git
- Store the encryption key separately

### Step 2: Add to .env

Add these lines to `backend/.env`:

```env
# HD Wallet Configuration
HD_WALLET_ENCRYPTED_SEED=your_encrypted_seed_from_step_1
HD_WALLET_ENCRYPTION_KEY=your_encryption_key (optional, uses JWT_SECRET if not set)
```

### Step 3: Start Server

The blockchain watcher will start automatically when the server starts:

```bash
cd backend
npm start
```

You should see:
```
✅ Blockchain watcher started (HD wallet system)
```

## How It Works

1. **User clicks "Generate QR Code"**
   - Backend generates unique TRON address from HD wallet
   - Creates payment intent with 15-minute expiry
   - Returns QR code to frontend

2. **User scans QR and pays**
   - User sends USDT (TRC20) to the unique address
   - No transaction hash input needed

3. **Automatic Detection**
   - Background watcher checks all pending addresses every 10 seconds
   - When payment detected, automatically:
     - Marks payment intent as paid
     - Creates investment record
     - Updates user balance
     - Activates referrals if applicable

4. **Frontend Auto-Refresh**
   - Frontend polls payment status every 5 seconds
   - Shows success message when payment detected
   - Closes modal automatically

## Security Features

✅ **Unique Addresses**: Each payment gets a new address (never reused)
✅ **Automatic Detection**: No manual transaction hash input
✅ **Secure Storage**: Master seed encrypted in environment
✅ **Atomic Operations**: Index increment is atomic (no duplicates)
✅ **Expiry Handling**: Old intents expire automatically

## Database Collections

- **PaymentIntent**: Stores payment requests with derived addresses
- **HDAddressIndex**: Tracks last used derivation index (single document)

## API Endpoints

- `POST /api/payment/hd/initiate` - Create payment intent
- `GET /api/payment/hd/status/:orderId` - Get payment status

## Troubleshooting

**Error: "HD_WALLET_ENCRYPTED_SEED not found"**
- Run `node scripts/generateHDSeed.js` to generate seed
- Add encrypted seed to `.env` file

**Error: "Failed to initialize HD wallet"**
- Check encrypted seed format
- Verify encryption key matches
- Ensure mnemonic is valid BIP39

**Payments not detected:**
- Check blockchain watcher is running (server logs)
- Verify TronGrid API key is valid
- Check network configuration (testnet/mainnet)
- Ensure USDT contract address is correct

## Production Checklist

- [ ] Generate master seed using script
- [ ] Store mnemonic offline in secure location
- [ ] Add encrypted seed to production `.env`
- [ ] Set strong encryption key
- [ ] Test on testnet first
- [ ] Verify blockchain watcher starts successfully
- [ ] Test payment flow end-to-end
- [ ] Monitor server logs for errors
