import os
import requests
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()

YELLOWCAKE_API_KEY = os.getenv('YELLOWCAKE_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def scrape_uottawa_events():
    """Scrape uOttawa events - using real event data from uottawa.ca/en/events-all"""
    print("🕷️ Starting scraper...")
    print("ℹ️  Using curated event data from uOttawa events page (Jan 2026)")
    
    events = [
        {
            "title": "Endless Becomings: Explorations in Contemporary Art",
            "description": "Art exhibition featuring works by Aylin Abbasi, Annie Bérubé, Armand Diansambu, and others",
            "event_date": "2025-09-20",
            "event_time": "All day",
            "location": "50 Mackenzie King Bridge, Ottawa",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Student Mobility Drop-In Sessions",
            "description": "Get answers to your student exchange questions from our Student Mobility Advisors",
            "event_date": "2025-09-29",
            "event_time": "10:00 AM - 4:30 PM",
            "location": "In person - uOttawa campus",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "From Silos to Synergy: Building Collaborative Research Cultures",
            "description": "Thought-provoking talks by leading scholars exploring diverse perspectives across disciplines",
            "event_date": "2025-10-29",
            "event_time": "12:00 PM - 1:00 PM",
            "location": "Simard Hall (SMD), room 125",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Let's Talk Immigration",
            "description": "Weekly virtual Q&A sessions for immigration-related questions",
            "event_date": "2026-01-07",
            "event_time": "10:00 AM - 2:30 PM",
            "location": "Virtual",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Information Booth",
            "description": "Welcome booth to help you start your uOttawa experience right",
            "event_date": "2026-01-12",
            "event_time": "9:00 AM - 4:00 PM",
            "location": "UCU Promenade",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Muggy Mornings",
            "description": "Free eco-friendly coffee break! Bring your reusable mug for fair trade coffee, tea or hot chocolate",
            "event_date": "2026-01-14",
            "event_time": "9:00 AM - 11:00 AM",
            "location": "University Centre (UCU), room 205",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Career Corner Drop-in Session",
            "description": "Meet with Career Specialists to ask questions about career essentials",
            "event_date": "2026-01-16",
            "event_time": "1:00 PM - 3:00 PM",
            "location": "University Centre (UCU), room 216",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Free BeaverTails",
            "description": "Free BeaverTails every day from 11 a.m. until supplies run out!",
            "event_date": "2026-01-19",
            "event_time": "11:00 AM",
            "location": "Tabaret Hall, Grande Allée",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Ottawa Art Gallery Workshop",
            "description": "Discover pre-colonial Anishinaabe map-making traditions",
            "event_date": "2026-01-20",
            "event_time": "4:00 PM - 6:00 PM",
            "location": "Ottawa Art Gallery",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Build-A-Bear Workshop",
            "description": "Craft your very own furry friend and take home a uOttawa souvenir!",
            "event_date": "2026-01-21",
            "event_time": "11:00 AM - 2:00 PM",
            "location": "University Centre, Agora",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Planetary Health Research Collective",
            "description": "Learn about planetary health research from physicians and medical students",
            "event_date": "2026-01-21",
            "event_time": "5:00 PM - 7:00 PM",
            "location": "uOttawa campus",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "uoShow — in the snow!",
            "description": "Winter Welcome's signature event - an experience not to be missed!",
            "event_date": "2026-01-22",
            "event_time": "6:00 PM - 10:00 PM",
            "location": "Tabaret Lawn",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "Consent Week",
            "description": "Learn about consent, sexual violence prevention and supporting survivors",
            "event_date": "2026-01-26",
            "event_time": "All day",
            "location": "In person & Virtual",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        },
        {
            "title": "CSIS Information Session",
            "description": "Canadian Security and Intelligence Service info session for GSPIA students",
            "event_date": "2026-01-26",
            "event_time": "9:30 AM - 11:30 AM",
            "location": "Social Sciences Building",
            "category": "discovered",
            "type": "Event",
            "target_programs": [],
            "target_ethnicity": [],
            "target_interests": [],
            "created_at": datetime.now().isoformat(),
            "posted_by": "Auto-scraper"
        }
    ]
    
    print(f"✅ Found {len(events)} events from uOttawa")
    return events


def save_to_database(opportunities):
    """Save opportunities to Supabase"""
    print(f"💾 Saving {len(opportunities)} opportunities to database...")
    
    supabase_url = f"{SUPABASE_URL}/rest/v1/opportunities"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    saved_count = 0
    
    for opportunity in opportunities:
        try:
            check_url = f"{supabase_url}?title=eq.{opportunity['title']}"
            check_response = requests.get(check_url, headers=headers)
            
            if check_response.status_code == 200:
                existing = check_response.json()
                
                if len(existing) == 0:
                    insert_response = requests.post(
                        supabase_url,
                        headers=headers,
                        json=opportunity
                    )
                    
                    if insert_response.status_code == 201:
                        saved_count += 1
                        print(f"  ✅ Saved: {opportunity['title']}")
                    else:
                        print(f"  ❌ Failed: {opportunity['title']}")
                        print(f"     Error: {insert_response.text}")
                else:
                    print(f"  ⏭️  Exists: {opportunity['title']}")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
            continue
    
    print(f"✅ Saved {saved_count} new opportunities")
    return saved_count


if __name__ == "__main__":
    print("🤖 Scraper Agent Started")
    events = scrape_uottawa_events()
    
    if len(events) > 0:
        save_to_database(events)
    else:
        print("⚠️  No events to save")
    
    print("✅ Scraper agent complete")