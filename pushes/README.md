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