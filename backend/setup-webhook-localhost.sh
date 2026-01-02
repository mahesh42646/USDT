#!/bin/bash

# NOWPayments Webhook Setup for Localhost
# This script helps you set up ngrok to expose your local server for webhook testing

echo "=========================================="
echo "NOWPayments Webhook Setup for Localhost"
echo "=========================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "Please install ngrok:"
    echo "  macOS: brew install ngrok/ngrok/ngrok"
    echo "  Or download from: https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Get backend port from .env or use default
BACKEND_PORT=${BACKEND_PORT:-3500}
if [ -f .env ]; then
    PORT_FROM_ENV=$(grep -E "^PORT=" .env | cut -d '=' -f2)
    if [ ! -z "$PORT_FROM_ENV" ]; then
        BACKEND_PORT=$PORT_FROM_ENV
    fi
fi

echo "Starting ngrok tunnel on port $BACKEND_PORT..."
echo ""
echo "Your webhook URL will be: https://YOUR-NGROK-URL.ngrok.io/api/payment/webhook/nowpayments"
echo ""
echo "⚠️  IMPORTANT: Copy the 'Forwarding' URL from ngrok output below"
echo "   Then update it in NOWPayments dashboard:"
echo "   https://account.nowpayments.io → Settings → Payment Settings → IPN Callback URL"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""
echo "=========================================="
echo ""

# Start ngrok
ngrok http $BACKEND_PORT
