const axios = require('axios');

class CurrencyConverter {
  constructor() {
    // Use CoinGecko API for currency conversion (free tier)
    this.apiUrl = 'https://api.coingecko.com/api/v3';
    this.cache = new Map();
    this.cacheTimeout = 30 * 1000; // 30 seconds cache for real-time rates
  }

  // Get current exchange rate from USD to target currency
  async getExchangeRate(targetCurrency) {
    try {
      const cacheKey = `USD_${targetCurrency}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`[CurrencyConverter] Using cached rate: 1 USD = ${cached.rate} ${targetCurrency}`);
        return cached.rate;
      }

      // Map currency symbols to CoinGecko IDs
      const currencyMap = {
        'TRX': 'tron',
        'USDT': 'tether',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
      };

      const coinId = currencyMap[targetCurrency.toUpperCase()] || targetCurrency.toLowerCase();
      
      const response = await axios.get(
        `${this.apiUrl}/simple/price`,
        {
          params: {
            ids: coinId,
            vs_currencies: 'usd',
          },
          timeout: 10000,
        }
      );

      if (!response.data || !response.data[coinId]) {
        throw new Error(`Currency ${targetCurrency} not found`);
      }

      const usdPrice = response.data[coinId].usd;
      const rate = 1 / usdPrice; // How many units of target currency = 1 USD

      // Cache the rate
      this.cache.set(cacheKey, {
        rate: rate,
        timestamp: Date.now(),
      });

      console.log(`[CurrencyConverter] Fetched rate: 1 USD = ${rate} ${targetCurrency} (${usdPrice} USD per ${targetCurrency})`);
      return rate;
    } catch (error) {
      console.error(`[CurrencyConverter] Error fetching rate for ${targetCurrency}:`, error.message);
      
      // Don't use fallback rates - force real-time API calls
      // Retry once before failing
      console.warn(`[CurrencyConverter] Retrying API call for ${targetCurrency}...`);
      try {
        const retryResponse = await axios.get(
          `${this.apiUrl}/simple/price`,
          {
            params: {
              ids: currencyMap[targetCurrency.toUpperCase()] || targetCurrency.toLowerCase(),
              vs_currencies: 'usd',
            },
            timeout: 5000, // Shorter timeout on retry
          }
        );
        
        const coinId = currencyMap[targetCurrency.toUpperCase()] || targetCurrency.toLowerCase();
        if (retryResponse.data && retryResponse.data[coinId]) {
          const usdPrice = retryResponse.data[coinId].usd;
          const rate = 1 / usdPrice;
          console.log(`[CurrencyConverter] Retry successful: 1 USD = ${rate} ${targetCurrency}`);
          return rate;
        }
      } catch (retryError) {
        console.error(`[CurrencyConverter] Retry also failed: ${retryError.message}`);
      }

      throw new Error(`Failed to get exchange rate for ${targetCurrency}. Please try again.`);
    }
  }

  // Convert USD amount to target currency
  async convertUSDToCurrency(usdAmount, targetCurrency) {
    try {
      const rate = await this.getExchangeRate(targetCurrency);
      const convertedAmount = usdAmount * rate;
      return {
        success: true,
        amount: convertedAmount,
        currency: targetCurrency,
        usdAmount: usdAmount,
        rate: rate,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Convert currency amount to USD (reverse conversion)
  async convertCurrencyToUSD(currencyAmount, sourceCurrency) {
    try {
      // Get USD price of the currency (e.g., 1 USDT = X USD)
      const currencyMap = {
        'TRX': 'tron',
        'USDT': 'tether',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
      };

      const coinId = currencyMap[sourceCurrency.toUpperCase()] || sourceCurrency.toLowerCase();
      const cacheKey = `USD_PRICE_${sourceCurrency}`;
      const cached = this.cache.get(cacheKey);
      
      let usdPrice;
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        usdPrice = cached.usdPrice;
      } else {
        const response = await axios.get(
          `${this.apiUrl}/simple/price`,
          {
            params: {
              ids: coinId,
              vs_currencies: 'usd',
            },
            timeout: 10000,
          }
        );

        if (!response.data || !response.data[coinId]) {
          throw new Error(`Currency ${sourceCurrency} not found`);
        }

        usdPrice = response.data[coinId].usd;
        this.cache.set(cacheKey, {
          usdPrice: usdPrice,
          timestamp: Date.now(),
        });
      }

      const usdAmount = currencyAmount * usdPrice;
      return {
        success: true,
        usdAmount: usdAmount,
        currencyAmount: currencyAmount,
        currency: sourceCurrency,
        rate: usdPrice, // 1 unit of currency = X USD
      };
    } catch (error) {
      console.error(`[CurrencyConverter] Error converting ${sourceCurrency} to USD:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get supported currencies
  getSupportedCurrencies() {
    return [
      { symbol: 'TRX', name: 'TRON (TRX)', network: 'TRON' },
      { symbol: 'USDT', name: 'Tether (USDT)', network: 'TRON TRC20' },
      // Add more currencies as needed
    ];
  }
}

module.exports = new CurrencyConverter();
