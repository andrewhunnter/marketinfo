import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # API Keys
    COINGECKO_API_KEY = os.getenv('COINGECKO_API_KEY')
    POLYGON_API_KEY = os.getenv('POLYGON_API_KEY')
    FRED_API_KEY = os.getenv('FRED_API_KEY')
    
    # MongoDB Configuration
    MONGODB_CONNECTION_STRING = os.getenv('MONGODB_CONNECTION_STRING')
    MONGODB_DATABASE = os.getenv('MONGODB_DATABASE', 'marketdata')
    MONGODB_COLLECTION = os.getenv('MONGODB_COLLECTION', 'market_info')
    
    # API Endpoints
    COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
    POLYGON_BASE_URL = "https://api.polygon.io"
    FEAR_GREED_URL = "https://api.alternative.me/fng/"
    
    # Crypto symbols to track
    CRYPTO_SYMBOLS = ['bitcoin', 'ethereum', 'solana']
    CRYPTO_IDS = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum', 
        'SOL': 'solana'
    }
    
    # Stock indices to track
    STOCK_INDICES = {
        'sp500': 'SPY',
        'nasdaq100': 'QQQ',
        'vix': 'VIX'
    }
    
    # FRED Economic indicators
    FRED_SERIES = {
        'fed_funds_rate': 'FEDFUNDS',      # Federal Funds Rate
        'cpi': 'CPIAUCSL',                 # Consumer Price Index for All Urban Consumers
        'retail_sales': 'RSAFS',           # Advance Retail Sales: Retail Trade
        'unemployment_rate': 'UNRATE',     # Unemployment Rate
        'gdp': 'GDP',                      # Gross Domestic Product
        'inflation_rate': 'FPCPITOTLZGUSA' # Inflation Rate (Annual % Change)
    } 