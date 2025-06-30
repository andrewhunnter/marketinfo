#!/usr/bin/env python3
"""
Cryptocurrency Data Scraper
Fetches crypto prices, hash rates, and fear & greed index data
"""

import requests
import json
import time
from datetime import datetime
import logging
from config import Config
import os

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CryptoScraper:
    def __init__(self):
        self.config = Config()
        self.ensure_data_directories()
    
    def ensure_data_directories(self):
        """Create data directories if they don't exist"""
        os.makedirs('crypto_data', exist_ok=True)
        logger.info("Ensured crypto_data directory exists")
    
    def get_crypto_prices(self):
        """Fetch cryptocurrency prices from CoinGecko"""
        try:
            crypto_data = {}
            
            # Get prices for BTC, ETH, SOL
            url = f"{self.config.COINGECKO_BASE_URL}/simple/price"
            params = {
                'ids': ','.join(self.config.CRYPTO_SYMBOLS),
                'vs_currencies': 'usd',
                'include_market_cap': 'true',
                'include_24hr_vol': 'true',
                'include_24hr_change': 'true',
                'x_cg_demo_api_key': self.config.COINGECKO_API_KEY
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Format the data according to your structure
            for crypto_id, symbol in self.config.CRYPTO_IDS.items():
                if symbol in data:
                    crypto_data[crypto_id] = {
                        'price_usd': data[symbol]['usd'],
                        'market_cap': data[symbol].get('usd_market_cap'),
                        'volume_24h': data[symbol].get('usd_24h_vol'),
                        'change_24h': data[symbol].get('usd_24h_change'),
                        'timestamp': datetime.utcnow().isoformat()
                    }
            
            logger.info(f"Successfully fetched crypto prices for {len(crypto_data)} cryptocurrencies")
            return crypto_data
            
        except Exception as e:
            logger.error(f"Error fetching crypto prices: {e}")
            return {}
    
    def get_hash_rates(self):
        """Fetch Bitcoin hash rate data"""
        try:
            # CoinGecko doesn't provide hash rate data directly
            # We'll use blockchain.info API for Bitcoin hash rate
            hash_rates = {}
            
            # Bitcoin hash rate from blockchain.info
            btc_stats_url = "https://api.blockchain.info/stats"
            response = requests.get(btc_stats_url)
            response.raise_for_status()
            data = response.json()
            
            hash_rates['BTC'] = {
                'hash_rate_th_s': data.get('hash_rate', 0) / 1e12,  # Convert to TH/s
                'difficulty': data.get('difficulty', 0),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            logger.info("Successfully fetched Bitcoin hash rate")
            return hash_rates
            
        except Exception as e:
            logger.error(f"Error fetching hash rates: {e}")
            return {'BTC': {'hash_rate_th_s': 0, 'difficulty': 0, 'timestamp': datetime.utcnow().isoformat()}}
    
    def get_fear_greed_index(self):
        """Fetch Fear & Greed Index"""
        try:
            response = requests.get(self.config.FEAR_GREED_URL)
            response.raise_for_status()
            data = response.json()
            
            if data['data']:
                fear_greed_data = {
                    'value': int(data['data'][0]['value']),
                    'value_classification': data['data'][0]['value_classification'],
                    'timestamp': datetime.utcnow().isoformat()
                }
                logger.info(f"Successfully fetched Fear & Greed Index: {fear_greed_data['value']}")
                return fear_greed_data
            
        except Exception as e:
            logger.error(f"Error fetching Fear & Greed Index: {e}")
            
        return {'value': 0, 'value_classification': 'Unknown', 'timestamp': datetime.utcnow().isoformat()}
    
    def scrape_crypto_data(self):
        """Main function to scrape all crypto data"""
        try:
            logger.info("Starting crypto data scraping...")
            
            # Fetch all crypto data
            crypto_prices = self.get_crypto_prices()
            hash_rates = self.get_hash_rates()
            fear_greed = self.get_fear_greed_index()
            
            # Structure the data according to your schema
            crypto_data = {
                'crypto_prices': crypto_prices,
                'hash_rates': hash_rates,
                'fear_greed_index': fear_greed,
                'timestamp': datetime.utcnow().isoformat(),
                'data_type': 'crypto'
            }
            
            return crypto_data
            
        except Exception as e:
            logger.error(f"Error in crypto data scraping: {e}")
            return None
    
    def save_to_json(self, data, filename="crypto_data/latest.json"):
        """Save data to JSON file, overwriting existing file"""
        try:
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            
            logger.info(f"Data saved to JSON file: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving to JSON: {e}")
            return False
    
    def run(self):
        """Run the crypto scraper"""
        data = self.scrape_crypto_data()
        
        if data:
            # Save to JSON
            self.save_to_json(data)
            
            logger.info("Crypto scraping completed successfully")
            return data
        else:
            logger.error("Failed to scrape crypto data")
            return None

def main():
    """Main function for standalone execution"""
    scraper = CryptoScraper()
    
    try:
        # Run the scraper
        data = scraper.run()
        
        if data:
            print("Crypto data scraped successfully!")
            print(f"Data saved to: crypto_data/latest.json")
        else:
            print("Failed to scrape crypto data")
            
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")

if __name__ == "__main__":
    main() 