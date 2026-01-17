import os
import requests
from dotenv import load_dotenv

load_dotenv()

YELLOWCAKE_API_KEY = os.getenv('YELLOWCAKE_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def scrape_uottawa_events():
    """Scrape uOttawa events using Yellowcake"""
    print("🕷️ Starting scraper...")
    
    # TODO: Tomorrow - implement Yellowcake API call
    # Target: https://www.uottawa.ca/events
    
    # Mock data for now
    events = [
        {
            "title": "Career Fair 2026",
            "description": "Annual career fair",
            "date": "2026-03-15",
            "location": "UCU",
            "category": "discovered"
        }
    ]
    
    print(f"✅ Found {len(events)} events")
    return events

def save_to_database(opportunities):
    """Save opportunities to Supabase"""
    print("💾 Saving to database...")
    
    # TODO: Tomorrow - implement Supabase insert
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/opportunities"
    
    # Mock for now
    print(f"✅ Saved {len(opportunities)} opportunities")
    pass

if __name__ == "__main__":
    print("🤖 Scraper Agent Started")
    events = scrape_uottawa_events()
    save_to_database(events)
    print("✅ Scraper agent skeleton complete")