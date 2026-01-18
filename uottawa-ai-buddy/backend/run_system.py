"""
ORCHESTRATOR - Runs the entire system for demo
"""

import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def run_scraper():
    """Step 1: Run scraper to get opportunities"""
    print("\n" + "="*60)
    print("STEP 1: SCRAPING OPPORTUNITIES")
    print("="*60)
    
    from scraper_agent import scrape_uottawa_events, save_to_database
    
    events = scrape_uottawa_events()
    
    if len(events) > 0:
        saved = save_to_database(events)
        print(f"\n✅ Scraper complete: {saved} opportunities added")
        return True
    else:
        print("\n❌ No events scraped")
        return False

def run_matching():
    """Step 2: Matching agent processes opportunities"""
    print("\n" + "="*60)
    print("STEP 2: MATCHING WITH GEMINI AI")
    print("="*60)
    
    from matching_agent import matching_agent
    
    # Get all opportunities from database
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/opportunities?select=*",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
    )
    
    if response.status_code == 200:
        opportunities = response.json()
        print(f"📋 Found {len(opportunities)} opportunities to match")
        
        for opp in opportunities:
            matching_agent.process_opportunity(opp)
        
        print(f"\n✅ Matching complete: {matching_agent.matched_count} total matches")
        return True
    else:
        print("❌ Could not fetch opportunities")
        return False

def verify_results():
    """Verify everything worked"""
    print("\n" + "="*60)
    print("VERIFICATION")
    print("="*60)
    
    # Check opportunities
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/opportunities?select=count",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Prefer': 'count=exact'
        }
    )
    opp_count = response.headers.get('Content-Range', '*/0').split('/')[-1]
    print(f"  📋 Opportunities: {opp_count}")
    
    # Check students
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/students?select=count",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Prefer': 'count=exact'
        }
    )
    student_count = response.headers.get('Content-Range', '*/0').split('/')[-1]
    print(f"  👥 Students: {student_count}")
    
    # Check matches
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/matches?select=count",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Prefer': 'count=exact'
        }
    )
    match_count = response.headers.get('Content-Range', '*/0').split('/')[-1]
    print(f"  🎯 Matches: {match_count}")
    
    if student_count == '0':
        print("\n⚠️  WARNING: No students in database!")
        print("   Go to student-signup.html to create student profiles")

if __name__ == "__main__":
    print("\n" + "="*70)
    print(" "*20 + "🤖 UOTTAWA AI BUDDY SYSTEM")
    print("="*70)
    
    try:
        # Step 1: Scrape
        run_scraper()
        time.sleep(2)
        
        # Step 2: Match
        run_matching()
        time.sleep(2)
        
        # Verify
        verify_results()
        
        print("\n" + "="*70)
        print(" "*25 + "🎉 SYSTEM COMPLETE!")
        print("="*70)
        print("\nNext steps:")
        print("  1. Open student-signup.html to create student profiles")
        print("  2. Then open student-feed.html to see matched opportunities")
        
    except KeyboardInterrupt:
        print("\n\n👋 System stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()