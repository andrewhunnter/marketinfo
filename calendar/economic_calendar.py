#!/usr/bin/env python3
"""
Economic Calendar Data Fetcher
Fetches upcoming economic calendar events and saves them to a JSON file
"""

import os
import json
import requests
import logging
from datetime import datetime, timedelta
import sys
import time
from dotenv import load_dotenv

# Add the parent directory to the path so we can import from pushes
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pushes.config import Config

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EconomicCalendarFetcher:
    def __init__(self):
        self.config = Config()
        self.fred_api_key = self.config.FRED_API_KEY
        self.ensure_output_directory()
        
        if not self.fred_api_key:
            logger.error("FRED API key not found. Please set the FRED_API_KEY environment variable.")
            sys.exit(1)
    
    def ensure_output_directory(self):
        """Create output directory if it doesn't exist"""
        # Create data directory in the calendar folder (same directory as this script)
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
        os.makedirs(data_dir, exist_ok=True)
        logger.info(f"Ensured data directory exists at: {data_dir}")
    
    def fetch_economic_releases(self, days_ahead=30):
        """
        Fetch upcoming economic data releases from FRED
        
        Args:
            days_ahead (int): Number of days ahead to fetch releases for
            
        Returns:
            list: List of economic release events
        """
        try:
            # Calculate date range
            today = datetime.now().strftime('%Y-%m-%d')
            end_date = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
            
            # FRED API endpoint for releases
            url = "https://api.stlouisfed.org/fred/releases/dates"
            
            params = {
                'api_key': self.fred_api_key,
                'file_type': 'json',
                'realtime_start': today,
                'realtime_end': end_date,
                'limit': 1000,  # Maximum allowed by FRED API
            }
            
            response = requests.get(url, params=params)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch economic releases: {response.status_code} - {response.text}")
                return []
            
            data = response.json()
            release_dates = data.get('release_dates', [])
            
            # Now fetch details for each release
            calendar_events = []
            
            for release_date in release_dates:
                release_id = release_date.get('release_id')
                date = release_date.get('date')
                
                # Get release details
                release_info = self.get_release_info(release_id)
                if release_info:
                    event = {
                        'date': date,
                        'release_id': release_id,
                        'name': release_info.get('name', 'Unknown'),
                        'press_release': release_info.get('press_release', False),
                        'link': release_info.get('link', ''),
                        'notes': release_info.get('notes', '')
                    }
                    calendar_events.append(event)
                
                # Respect rate limits
                time.sleep(0.5)
            
            # Sort by date
            calendar_events.sort(key=lambda x: x['date'])
            
            logger.info(f"Successfully fetched {len(calendar_events)} economic calendar events")
            return calendar_events
            
        except Exception as e:
            logger.error(f"Error fetching economic releases: {e}")
            return []
    
    def get_release_info(self, release_id):
        """
        Get detailed information about a specific release
        
        Args:
            release_id (int): The FRED release ID
            
        Returns:
            dict: Release information
        """
        try:
            url = "https://api.stlouisfed.org/fred/release"
            
            params = {
                'api_key': self.fred_api_key,
                'file_type': 'json',
                'release_id': release_id
            }
            
            response = requests.get(url, params=params)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch release info for ID {release_id}: {response.status_code}")
                return {}
            
            data = response.json()
            return data.get('releases', [{}])[0]
            
        except Exception as e:
            logger.error(f"Error fetching release info for ID {release_id}: {e}")
            return {}
    
    def load_existing_events(self, filename):
        """
        Load existing events from the JSON file
        
        Args:
            filename (str): Path to the JSON file
            
        Returns:
            list: List of existing events, empty list if file doesn't exist or is invalid
        """
        try:
            if os.path.exists(filename):
                with open(filename, 'r') as f:
                    data = json.load(f)
                    existing_events = data.get('events', [])
                    logger.info(f"Loaded {len(existing_events)} existing events from {filename}")
                    return existing_events
            else:
                logger.info(f"No existing file found at {filename}, starting fresh")
                return []
        except Exception as e:
            logger.error(f"Error loading existing events from {filename}: {e}")
            return []
    
    def merge_events(self, existing_events, new_events, max_days_old=90):
        """
        Merge new events with existing events, removing duplicates and old events
        
        Args:
            existing_events (list): Previously cached events
            new_events (list): Newly fetched events
            max_days_old (int): Maximum days to keep old events (default 90 days)
            
        Returns:
            list: Merged and deduplicated events
        """
        try:
            # Calculate cutoff date for old events
            cutoff_date = (datetime.now() - timedelta(days=max_days_old)).strftime('%Y-%m-%d')
            
            # Create a set to track unique events (using date + release_id as key)
            event_keys = set()
            merged_events = []
            
            # Add new events first (they take priority)
            for event in new_events:
                key = (event.get('date'), event.get('release_id'))
                if key not in event_keys:
                    event_keys.add(key)
                    merged_events.append(event)
            
            # Add existing events that aren't duplicates and aren't too old
            for event in existing_events:
                key = (event.get('date'), event.get('release_id'))
                event_date = event.get('date', '')
                
                # Skip if duplicate or too old
                if key in event_keys or event_date < cutoff_date:
                    continue
                
                event_keys.add(key)
                merged_events.append(event)
            
            # Sort by date
            merged_events.sort(key=lambda x: x.get('date', ''))
            
            logger.info(f"Merged events: {len(new_events)} new + {len(existing_events)} existing = {len(merged_events)} total (removed {len(existing_events) + len(new_events) - len(merged_events)} duplicates/old events)")
            return merged_events
            
        except Exception as e:
            logger.error(f"Error merging events: {e}")
            # Fallback to just new events if merge fails
            return new_events
    
    def save_to_json(self, calendar_events, filename=None):
        """
        Save calendar events to a JSON file, merging with existing events
        
        Args:
            calendar_events (list): List of newly fetched economic calendar events
            filename (str): Output filename (defaults to data/economic_calendar.json)
        """
        try:
            if filename is None:
                # Save to data directory in the calendar folder
                script_dir = os.path.dirname(os.path.abspath(__file__))
                filename = os.path.join(script_dir, 'data', 'economic_calendar.json')
            
            # Load existing events
            existing_events = self.load_existing_events(filename)
            
            # Merge new events with existing ones
            merged_events = self.merge_events(existing_events, calendar_events)
            
            output = {
                'updated_at': datetime.now().isoformat(),
                'events_count': len(merged_events),
                'new_events_count': len(calendar_events),
                'cached_events_count': len(existing_events),
                'events': merged_events
            }
            
            with open(filename, 'w') as f:
                json.dump(output, f, indent=2)
            
            logger.info(f"Successfully saved {len(merged_events)} total events to {filename} ({len(calendar_events)} new, {len(existing_events)} previously cached)")
            
        except Exception as e:
            logger.error(f"Error saving calendar events to {filename}: {e}")
    
    def run(self, days_ahead=30):
        """
        Run the economic calendar fetcher
        
        Args:
            days_ahead (int): Number of days ahead to fetch events for
        """
        logger.info(f"Fetching economic calendar events for the next {days_ahead} days")
        events = self.fetch_economic_releases(days_ahead)
        
        if events:
            self.save_to_json(events)
            return True
        else:
            logger.warning("No economic calendar events found")
            return False

def main():
    """Main entry point"""
    try:
        # Load environment variables
        load_dotenv()
        
        # Parse command line arguments
        import argparse
        parser = argparse.ArgumentParser(description='Fetch economic calendar events')
        parser.add_argument('--days', type=int, default=30, help='Number of days ahead to fetch events for')
        args = parser.parse_args()
        
        # Run the fetcher
        fetcher = EconomicCalendarFetcher()
        success = fetcher.run(days_ahead=args.days)
        
        if success:
            print(f"Successfully fetched economic calendar events for the next {args.days} days")
            sys.exit(0)
        else:
            print("Failed to fetch economic calendar events")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Unhandled exception: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 