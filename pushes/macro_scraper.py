#!/usr/bin/env python3
"""
Macroeconomic Data Scraper
Fetches market indices, interest rates, and consumer data
"""

import requests
import json
import yfinance as yf
from datetime import datetime, timedelta
import logging
from config import Config
import time
from fredapi import Fred
import os

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MacroScraper:
    def __init__(self):
        self.config = Config()
        self.fred = None
        self.setup_fred_api()
        self.ensure_data_directories()
    
    def ensure_data_directories(self):
        """Create data directories if they don't exist"""
        os.makedirs('macro_data', exist_ok=True)
        logger.info("Ensured macro_data directory exists")
    
    def setup_fred_api(self):
        """Setup FRED API connection"""
        try:
            if self.config.FRED_API_KEY:
                self.fred = Fred(api_key=self.config.FRED_API_KEY)
                logger.info("FRED API initialized successfully")
            else:
                logger.warning("FRED API key not found. Economic data will use placeholders.")
        except Exception as e:
            logger.error(f"Failed to initialize FRED API: {e}")
            self.fred = None
    
    def get_market_indices(self):
        """Fetch market indices data using yfinance and Polygon.io"""
        try:
            market_data = {}
            
            # Using yfinance for market indices
            for name, symbol in self.config.STOCK_INDICES.items():
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="1d")
                    
                    if not hist.empty:
                        latest = hist.iloc[-1]
                        market_data[name] = {
                            'price': float(latest['Close']),
                            'open': float(latest['Open']),
                            'high': float(latest['High']),
                            'low': float(latest['Low']),
                            'volume': int(latest['Volume']),
                            'change': float(latest['Close'] - latest['Open']),
                            'change_percent': float((latest['Close'] - latest['Open']) / latest['Open'] * 100),
                            'timestamp': datetime.utcnow().isoformat()
                        }
                    
                    time.sleep(0.5)  # Rate limiting
                    
                except Exception as e:
                    logger.error(f"Error fetching {symbol}: {e}")
                    market_data[name] = {
                        'price': 0,
                        'open': 0,
                        'high': 0,
                        'low': 0,
                        'volume': 0,
                        'change': 0,
                        'change_percent': 0,
                        'timestamp': datetime.utcnow().isoformat(),
                        'error': str(e)
                    }
            
            # Try to get additional data from Polygon.io if available
            if self.config.POLYGON_API_KEY:
                self._enhance_with_polygon_data(market_data)
            
            logger.info(f"Successfully fetched market indices for {len(market_data)} indices")
            return market_data
            
        except Exception as e:
            logger.error(f"Error fetching market indices: {e}")
            return {}
    
    def _enhance_with_polygon_data(self, market_data):
        """Enhance market data with Polygon.io data"""
        try:
            # Get additional data from Polygon.io for more accurate real-time data
            polygon_symbols = {'sp500': 'SPY', 'nasdaq100': 'QQQ'}
            
            for name, symbol in polygon_symbols.items():
                try:
                    url = f"{self.config.POLYGON_BASE_URL}/v2/aggs/ticker/{symbol}/prev"
                    params = {'apikey': self.config.POLYGON_API_KEY}
                    
                    response = requests.get(url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('results'):
                            result = data['results'][0]
                            if name in market_data:
                                market_data[name].update({
                                    'polygon_price': result.get('c'),
                                    'polygon_volume': result.get('v'),
                                    'polygon_high': result.get('h'),
                                    'polygon_low': result.get('l')
                                })
                    
                    time.sleep(0.2)  # Rate limiting for Polygon
                    
                except Exception as e:
                    logger.warning(f"Could not enhance {symbol} with Polygon data: {e}")
                    
        except Exception as e:
            logger.warning(f"Error enhancing with Polygon data: {e}")
    
    def get_interest_rates(self):
        """Fetch interest rates data"""
        try:
            interest_rates = {}
            
            # Get 10-year Treasury yield using yfinance
            try:
                tnx = yf.Ticker("^TNX")  # 10-year Treasury
                hist = tnx.history(period="1d")
                
                if not hist.empty:
                    latest = hist.iloc[-1]
                    interest_rates['us10yr'] = {
                        'yield_percent': float(latest['Close']),
                        'change': float(latest['Close'] - latest['Open']),
                        'timestamp': datetime.utcnow().isoformat()
                    }
                
            except Exception as e:
                logger.error(f"Error fetching 10-year Treasury: {e}")
                interest_rates['us10yr'] = {
                    'yield_percent': 0,
                    'change': 0,
                    'timestamp': datetime.utcnow().isoformat(),
                    'error': str(e)
                }
            
            # Get Fed funds rate from FRED API
            try:
                if self.fred:
                    fed_rate_data = self.fred.get_series('FEDFUNDS', limit=1)
                    if not fed_rate_data.empty:
                        latest_rate = fed_rate_data.iloc[-1]
                        interest_rates['fed_funds_rate'] = {
                            'rate_percent': float(latest_rate),
                            'date': fed_rate_data.index[-1].strftime('%Y-%m-%d'),
                            'timestamp': datetime.utcnow().isoformat(),
                            'source': 'FRED'
                        }
                    else:
                        raise ValueError("No data returned from FRED")
                else:
                    # Fallback to approximate value if FRED not available
                    interest_rates['fed_funds_rate'] = {
                        'rate_percent': 5.25,
                        'timestamp': datetime.utcnow().isoformat(),
                        'note': 'FRED API not available - using approximate value'
                    }
                    
            except Exception as e:
                logger.error(f"Error fetching Fed funds rate: {e}")
                interest_rates['fed_funds_rate'] = {
                    'rate_percent': 5.25,
                    'timestamp': datetime.utcnow().isoformat(),
                    'error': str(e),
                    'note': 'Using fallback value due to API error'
                }
            
            logger.info("Successfully fetched interest rates data")
            return interest_rates
            
        except Exception as e:
            logger.error(f"Error fetching interest rates: {e}")
            return {}
    
    def get_consumer_data(self):
        """Fetch consumer data (CPI, retail sales) from FRED API"""
        try:
            consumer_data = {}
            
            if not self.fred:
                logger.warning("FRED API not available. Using placeholder consumer data.")
                return {
                    'cpi': {
                        'value': 0,
                        'change_mom': 0,
                        'change_yoy': 0,
                        'timestamp': datetime.utcnow().isoformat(),
                        'note': 'FRED API not configured'
                    },
                    'retail_sales': {
                        'value': 0,
                        'change_mom': 0,
                        'change_yoy': 0,
                        'timestamp': datetime.utcnow().isoformat(),
                        'note': 'FRED API not configured'
                    }
                }
            
            # Fetch CPI data
            try:
                cpi_data = self.fred.get_series('CPIAUCSL', limit=13)  # Get last 13 months for YoY calculation
                if len(cpi_data) >= 2:
                    latest_cpi = cpi_data.iloc[-1]
                    previous_cpi = cpi_data.iloc[-2]
                    yoy_cpi = cpi_data.iloc[-13] if len(cpi_data) >= 13 else cpi_data.iloc[0]
                    
                    consumer_data['cpi'] = {
                        'value': float(latest_cpi),
                        'change_mom': float(((latest_cpi - previous_cpi) / previous_cpi) * 100),
                        'change_yoy': float(((latest_cpi - yoy_cpi) / yoy_cpi) * 100),
                        'date': cpi_data.index[-1].strftime('%Y-%m-%d'),
                        'timestamp': datetime.utcnow().isoformat(),
                        'source': 'FRED'
                    }
                else:
                    raise ValueError("Insufficient CPI data")
                    
            except Exception as e:
                logger.error(f"Error fetching CPI data: {e}")
                consumer_data['cpi'] = {
                    'value': 0,
                    'change_mom': 0,
                    'change_yoy': 0,
                    'timestamp': datetime.utcnow().isoformat(),
                    'error': str(e)
                }
            
            # Fetch Retail Sales data
            try:
                retail_data = self.fred.get_series('RSAFS', limit=13)  # Get last 13 months
                if len(retail_data) >= 2:
                    latest_retail = retail_data.iloc[-1]
                    previous_retail = retail_data.iloc[-2]
                    yoy_retail = retail_data.iloc[-13] if len(retail_data) >= 13 else retail_data.iloc[0]
                    
                    consumer_data['retail_sales'] = {
                        'value': float(latest_retail),
                        'change_mom': float(((latest_retail - previous_retail) / previous_retail) * 100),
                        'change_yoy': float(((latest_retail - yoy_retail) / yoy_retail) * 100),
                        'date': retail_data.index[-1].strftime('%Y-%m-%d'),
                        'timestamp': datetime.utcnow().isoformat(),
                        'source': 'FRED'
                    }
                else:
                    raise ValueError("Insufficient retail sales data")
                    
            except Exception as e:
                logger.error(f"Error fetching retail sales data: {e}")
                consumer_data['retail_sales'] = {
                    'value': 0,
                    'change_mom': 0,
                    'change_yoy': 0,
                    'timestamp': datetime.utcnow().isoformat(),
                    'error': str(e)
                }
            
            # Fetch additional economic indicators
            try:
                # Unemployment Rate
                unemployment_data = self.fred.get_series('UNRATE', limit=1)
                if not unemployment_data.empty:
                    consumer_data['unemployment_rate'] = {
                        'rate_percent': float(unemployment_data.iloc[-1]),
                        'date': unemployment_data.index[-1].strftime('%Y-%m-%d'),
                        'timestamp': datetime.utcnow().isoformat(),
                        'source': 'FRED'
                    }
                
                # Inflation Rate (Annual)
                inflation_data = self.fred.get_series('FPCPITOTLZGUSA', limit=1)
                if not inflation_data.empty:
                    consumer_data['inflation_rate'] = {
                        'rate_percent': float(inflation_data.iloc[-1]),
                        'date': inflation_data.index[-1].strftime('%Y-%m-%d'),
                        'timestamp': datetime.utcnow().isoformat(),
                        'source': 'FRED'
                    }
                    
            except Exception as e:
                logger.warning(f"Error fetching additional economic indicators: {e}")
            
            logger.info("Successfully fetched consumer data from FRED")
            return consumer_data
            
        except Exception as e:
            logger.error(f"Error creating consumer data structure: {e}")
            return {}
    
    def scrape_macro_data(self):
        """Main function to scrape all macroeconomic data"""
        try:
            logger.info("Starting macroeconomic data scraping...")
            
            # Fetch all macro data
            market_indices = self.get_market_indices()
            interest_rates = self.get_interest_rates()
            consumer_data = self.get_consumer_data()
            
            # Structure the data according to your schema
            macro_data = {
                'market_indices': market_indices,
                'interest_rates': interest_rates,
                'consumer_data': consumer_data,
                'timestamp': datetime.utcnow().isoformat(),
                'data_type': 'macro'
            }
            
            return macro_data
            
        except Exception as e:
            logger.error(f"Error in macro data scraping: {e}")
            return None
    
    def save_to_json(self, data, filename="macro_data/latest.json"):
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
        """Run the macro scraper"""
        data = self.scrape_macro_data()
        
        if data:
            # Save to JSON
            self.save_to_json(data)
            
            logger.info("Macro scraping completed successfully")
            return data
        else:
            logger.error("Failed to scrape macro data")
            return None

def main():
    """Main function for standalone execution"""
    scraper = MacroScraper()
    
    try:
        # Run the scraper
        data = scraper.run()
        
        if data:
            print("Macro data scraped successfully!")
            print(f"Data saved to: macro_data/latest.json")
        else:
            print("Failed to scrape macro data")
            
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")

if __name__ == "__main__":
    main() 