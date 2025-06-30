# Market Data Scraper

A Python application for scraping cryptocurrency and macroeconomic data using CoinGecko, Polygon.io, and FRED APIs, with MongoDB integration for data storage.

## Data Collected

### Cryptocurrency Data
- **Crypto Prices**: BTC, ETH, SOL prices with market cap, volume, and 24h changes
- **Hash Rates**: Bitcoin network hash rate and difficulty
- **Fear & Greed Index**: Market sentiment indicator

### Macroeconomic Data
- **Market Indices**: S&P 500, NASDAQ 100, VIX
- **Interest Rates**: US 10-year Treasury yield, Fed funds rate
- **Consumer Data**: CPI, retail sales, unemployment rate, inflation rate

## Implementation

Both the cryptocurrency and macroeconomic data scrapers are implemented in Python, using:
- `crypto_scraper.py`: Handles cryptocurrency data collection
- `macro_scraper.py`: Handles macroeconomic data collection
- `main.py`: Orchestrates the data collection process

Data is stored in MongoDB for efficient time-series tracking and analysis.

## API Coverage Analysis

### ✅ **Fully Covered with Your APIs:**

**CoinGecko + Polygon.io + FRED:**
- ✅ **Crypto Prices**: BTC, ETH, SOL (CoinGecko)
- ✅ **Fear & Greed Index**: Alternative.me API (free)
- ✅ **Market Indices**: S&P 500, NASDAQ 100, VIX (Polygon.io + yfinance)
- ✅ **Interest Rates**: Fed funds rate (FRED), 10-year Treasury (yfinance)
- ✅ **Consumer Data**: CPI, retail sales, unemployment (FRED)

### ⚠️ **Requires Additional Setup:**
- **Hash Rates**: Use blockchain.info API (free, no key required)

## Setup

### 1. Get API Keys

#### FRED API (Federal Reserve Economic Data)
1. Go to [https://research.stlouisfed.org/useraccount/apikey](https://research.stlouisfed.org/useraccount/apikey)
2. Create a free account
3. Generate your API key

You already have:
- **CoinGecko**: `CG-VaDeq5mSGTs9TzYDHfKuEX75`
- **Polygon.io**: `b73VcU7voSwpL7TIB3Dmq25AIo0oXk4T`

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file with your MongoDB connection string and API keys:
```env
# API Keys
COINGECKO_API_KEY=CG-VaDeq5mSGTs9TzYDHfKuEX75
POLYGON_API_KEY=b73VcU7voSwpL7TIB3Dmq25AIo0oXk4T
FRED_API_KEY=your_fred_api_key_here

# MongoDB Configuration
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=marketdata
MONGODB_COLLECTION=market_info
```

## Usage

### Run Individual Scrapers

#### Crypto Data Only
```bash
python crypto_scraper.py
```

#### Macro Data Only
```bash
python macro_scraper.py
```

### Run Combined Scraper
```bash
# Run once
python main.py --mode once

# Run crypto only
python main.py --mode crypto

# Run macro only
python main.py --mode macro

# Run with scheduling (every 15 minutes)
python main.py --mode schedule
```

### Data Output Structure

The scraped data follows this JSON structure:
```json
{
  "crypto_prices": {
    "BTC": {
      "price": 65000,
      "market_cap": 1280000000000,
      "volume_24h": 25000000000,
      "change_24h": 2.5
    },
    "ETH": { ... },
    "SOL": { ... }
  },
  "hash_rates": {
    "BTC": {
      "hash_rate": "450 EH/s",
      "difficulty": 62463471666407
    }
  },
  "fear_greed_index": {
    "value": 45,
    "classification": "Neutral"
  },
  "market_indices": {
    "sp500": {
      "price": 4500,
      "change": 25.5,
      "change_percent": 0.57
    },
    "nasdaq100": { ... },
    "vix": { ... }
  },
  "interest_rates": {
    "us10yr": {
      "yield_percent": 4.25
    },
    "fed_funds_rate": {
      "rate_percent": 5.25,
      "source": "FRED"
    }
  },
  "consumer_data": {
    "cpi": {
      "value": 307.671,
      "change_mom": 0.1,
      "change_yoy": 3.2,
      "source": "FRED"
    },
    "retail_sales": {
      "value": 704587,
      "change_mom": 0.4,
      "change_yoy": 2.1,
      "source": "FRED"
    },
    "unemployment_rate": {
      "rate_percent": 3.7,
      "source": "FRED"
    }
  }
}
```

## Real Economic Data with FRED

The application now uses the FRED (Federal Reserve Economic Data) API for real macroeconomic indicators:

- **Federal Funds Rate**: Real-time Fed policy rate
- **CPI (Consumer Price Index)**: Monthly inflation data
- **Retail Sales**: Consumer spending indicator
- **Unemployment Rate**: Labor market data
- **Inflation Rate**: Annual percentage change

## Scheduling

The main script supports automated data collection:
- **Every 15 minutes**: Crypto prices and market indices
- **Daily**: Economic indicators (CPI, retail sales update monthly)
- **Real-time**: Market sentiment and fear/greed index

## Data Storage

Data is stored in MongoDB with the following benefits:
- **Time-series data**: Historical tracking of all metrics
- **JSON structure**: Flexible schema for different data types
- **Scalability**: Handle large volumes of market data
- **Backup**: Automatic JSON file backup for each scrape

## Error Handling

The scrapers include robust error handling:
- **API rate limiting**: Automatic delays between requests
- **Fallback values**: Graceful degradation when APIs are unavailable
- **Logging**: Detailed logs for monitoring and debugging
- **Data validation**: Ensures data quality before storage

## Cost Analysis

**Free Tier Limits:**
- **CoinGecko**: 30 calls/minute (sufficient for crypto data)
- **Polygon.io**: 5 calls/minute (adequate for basic market data)
- **FRED**: 120 calls/minute (more than enough for economic data)
- **Alternative.me**: Unlimited (fear/greed index)

This setup can run continuously within free tier limits with proper rate limiting.

## Files

- **`crypto_scraper.py`**: Cryptocurrency data scraper
- **`macro_scraper.py`**: Macroeconomic data scraper
- **`main.py`**: Main orchestrator with scheduling
- **`config.py`**: Configuration management
- **`.env`**: Environment variables and API keys
- **`requirements.txt`**: Python dependencies

## Extending the Project

### Adding More APIs
To get real-time economic data, consider adding:
- **FRED API** for Federal Reserve economic data
- **Alpha Vantage** for additional financial data
- **Trading Economics API** for global economic indicators

### Database Options
- Current: MongoDB Atlas
- Alternatives: PostgreSQL, InfluxDB (time-series), Redis

### Monitoring
The application logs to both console and `market_scraper.log` file.

## Error Handling
- Automatic retries for API failures
- Fallback data structures when APIs are unavailable
- Comprehensive logging for debugging

## Security Notes
- Keep your `.env` file secure and never commit it to version control
- Rotate API keys regularly
- Use MongoDB authentication and IP whitelisting

## Rate Limiting
- Built-in delays between API calls
- Respects API rate limits for CoinGecko and Polygon.io
- Configurable intervals in the scheduler 