# HD Wallet Environment Variables Setup

## Step 1: Generate Master Seed

Run this command in your terminal:

```bash
cd backend
node scripts/generateHDSeed.js
```

**Follow the prompts:**
1. When asked "Do you want to use an existing mnemonic? (y/n):" → Type `n` and press Enter
2. When asked "Enter seed strength (12 or 24 words, default 12):" → Press Enter (uses 12 words)
3. The script will generate a mnemonic - **WRITE IT DOWN SECURELY!**
4. When asked "Enter encryption key (or press Enter to use JWT_SECRET):" → Press Enter (uses your JWT_SECRET)

**The script will output:**
```
HD_WALLET_ENCRYPTED_SEED=U2FsdGVkX1... (long encrypted string)
HD_WALLET_ENCRYPTION_KEY=your_jwt_secret_key_here
```

## Step 2: Add to .env File

Open `backend/.env` and add these lines at the end:

```env
# HD Wallet Configuration
HD_WALLET_ENCRYPTED_SEED=U2FsdGVkX1... (paste the encrypted seed from script output)
HD_WALLET_ENCRYPTION_KEY= (leave empty to use JWT_SECRET, or paste your custom key)
```

## Example .env Section

```env
# HD Wallet Configuration
HD_WALLET_ENCRYPTED_SEED=U2FsdGVkX1+example+encrypted+seed+string+here
HD_WALLET_ENCRYPTION_KEY=
```

**Note:** If you leave `HD_WALLET_ENCRYPTION_KEY` empty, it will use your `JWT_SECRET` value automatically.

## Step 3: Restart Server

After adding the variables, restart your backend server:

```bash
cd backend
npm start
```

You should see:
```
✅ Blockchain watcher started (HD wallet system)
```

If you see an error, check that:
- The encrypted seed is correctly pasted (no extra spaces)
- The encryption key matches (or is empty to use JWT_SECRET)
- The mnemonic was valid BIP39 format
