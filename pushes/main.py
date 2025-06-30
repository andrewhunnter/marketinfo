#!/usr/bin/env python3
"""
Main Market Data Scraper
Single execution snapshot of both crypto and macro data
"""

import json
import argparse
from datetime import datetime
import logging
from crypto_scraper import CryptoScraper
from macro_scraper import MacroScraper
import os

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('market_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MarketDataOrchestrator:
    def __init__(self):
        self.crypto_scraper = CryptoScraper()
        self.macro_scraper = MacroScraper()
        self.ensure_data_directories()
    
    def ensure_data_directories(self):
        """Create data directories if they don't exist"""
        os.makedirs('crypto_data', exist_ok=True)
        os.makedirs('macro_data', exist_ok=True)
        os.makedirs('combined_data', exist_ok=True)
        logger.info("Ensured all data directories exist")
    
    def run_crypto_scraping(self):
        """Run crypto data scraping"""
        try:
            logger.info("Starting crypto data scraping...")
            data = self.crypto_scraper.run()
            if data:
                logger.info("Crypto scraping completed successfully")
                return data
            else:
                logger.error("Crypto scraping failed")
                return None
        except Exception as e:
            logger.error(f"Error in crypto scraping: {e}")
            return None
    
    def run_macro_scraping(self):
        """Run macro data scraping"""
        try:
            logger.info("Starting macro data scraping...")
            data = self.macro_scraper.run()
            if data:
                logger.info("Macro scraping completed successfully")
                return data
            else:
                logger.error("Macro scraping failed")
                return None
        except Exception as e:
            logger.error(f"Error in macro scraping: {e}")
            return None
    
    def run_combined_scraping(self):
        """Run both crypto and macro scraping"""
        try:
            logger.info("Starting combined market data scraping...")
            
            # Run both scrapers
            crypto_data = self.crypto_scraper.scrape_crypto_data()
            macro_data = self.macro_scraper.scrape_macro_data()
            
            # Combine the data
            combined_data = {
                'timestamp': datetime.utcnow().isoformat(),
                'data_type': 'combined'
            }
            
            # Add crypto data if available
            if crypto_data:
                combined_data.update(crypto_data)
            
            # Add macro data if available
            if macro_data:
                combined_data.update(macro_data)
            
            # Save combined data
            if crypto_data and macro_data:
                # Save to combined data file
                filename = "combined_data/latest.json"
                with open(filename, 'w') as f:
                    json.dump(combined_data, f, indent=2, default=str)
                
                logger.info(f"Combined data saved successfully to {filename}")
                return combined_data
            else:
                logger.error("Failed to collect both crypto and macro data")
                return None
            
        except Exception as e:
            logger.error(f"Error in combined scraping: {e}")
            return None

def main():
    """Main function with command line arguments"""
    parser = argparse.ArgumentParser(description='Market Data Scraper - Single Snapshot')
    parser.add_argument('--mode', choices=['crypto', 'macro', 'combined'], 
                       default='combined', help='Scraping mode')
    parser.add_argument('--output', help='Output JSON filename (optional)')
    
    args = parser.parse_args()
    
    orchestrator = MarketDataOrchestrator()
    
    try:
        if args.mode == 'crypto':
            logger.info("Running crypto scraping snapshot...")
            data = orchestrator.run_crypto_scraping()
            
        elif args.mode == 'macro':
            logger.info("Running macro scraping snapshot...")
            data = orchestrator.run_macro_scraping()
            
        elif args.mode == 'combined':
            logger.info("Running combined scraping snapshot...")
            data = orchestrator.run_combined_scraping()
        
        if data:
            logger.info("Market data snapshot completed successfully")
            if args.output:
                with open(args.output, 'w') as f:
                    json.dump(data, f, indent=2, default=str)
                logger.info(f"Data also saved to {args.output}")
        else:
            logger.error("Market data snapshot failed")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")

if __name__ == "__main__":
    main() 