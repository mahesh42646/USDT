#!/bin/bash
echo "🚀 Setting up ngrok for NOWPayments webhook..."
echo ""
echo "Choose installation method:"
echo "1. Homebrew (recommended for macOS)"
echo "2. npm"
echo "3. Already installed"
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "Installing via Homebrew..."
    brew install ngrok/ngrok/ngrok
    ;;
  2)
    echo "Installing via npm..."
    npm install -g ngrok
    ;;
  3)
    echo "Skipping installation..."
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start your backend: cd backend && npm start"
echo "2. In another terminal, run: ngrok http 3500"
echo "3. Copy the HTTPS URL from ngrok"
echo "4. Configure in NOWPayments dashboard:"
echo "   https://account.nowpayments.io → Settings → Payment Settings"
echo "   IPN Callback URL: https://YOUR-NGROK-URL/api/payment/webhook/nowpayments"
echo ""
