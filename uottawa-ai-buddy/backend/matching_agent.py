"""
MATCHING AGENT - Uses Gemini AI to match opportunities to students
Listens to Solace for new opportunities and publishes match results
"""

import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# API Keys
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

class MatchingAgent:
    def __init__(self):
        self.matched_count = 0
        print(" Matching Agent started")
        print(" Gemini AI matching engine initialized")
        print("✅ Listening for opportunity events...")
    
    def listen_for_opportunities(self, intake_agent):
        """
        Listens to Solace for new opportunity events
        In production, this would use Solace SDK to subscribe to topics
        """
        while True:
            # Get pending events from intake agent (simulating Solace)
            events = intake_agent.get_pending_events()
            
            if events:
                for event in events:
                    if event['type'] == 'NEW_OPPORTUNITY':
                        print(f"\n🔔 Received event: {event['topic']}")
                        self.process_opportunity(event['data'])
                
                # Clear processed events
                intake_agent.clear_queue()
            
            time.sleep(2)  # Check every 2 seconds
    
    def process_opportunity(self, opportunity):
        """Process a new opportunity and match to students"""
        try:
            print(f"\n{'='*60}")
            print(f"🔍 MATCHING: {opportunity['title']}")
            print(f"{'='*60}")
            
            # Get all students from database
            students = self._get_all_students()
            print(f" Found {len(students)} students in database")
            
            if not students:
                print("⚠️  No students found. Skipping matching.")
                return
            
            # Use Gemini AI to find matches
            print(f"🤖 Analyzing with Gemini AI...")
            matches = self._match_with_gemini(opportunity, students)
            
            print(f"✅ Found {len(matches)} high-quality matches!")
            
            # Publish matches to Solace
            self._publish_matches(opportunity, matches)
            
            # Log matches
            self._log_matches(opportunity, matches)
            
            self.matched_count += len(matches)
            
        except Exception as e:
            print(f"❌ Error processing opportunity: {e}")
    
    def _get_all_students(self):
        """Get all student profiles from Supabase"""
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/students?select=*",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"⚠️  Error fetching students: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Database error: {e}")
            return []
    
    def _match_with_gemini(self, opportunity, students):
        """Use Gemini AI to intelligently match students to opportunity"""
        try:
            # Prepare prompt for Gemini
            prompt = self._create_matching_prompt(opportunity, students)
            
            # Call Gemini API
            response = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}",
                headers={'Content-Type': 'application/json'},
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                text = data['candidates'][0]['content']['parts'][0]['text']
                
                # Parse JSON response
                matches = self._parse_gemini_response(text)
                
                # Display matches
                for match in matches:
                    student = next((s for s in students if s['id'] == match['student_id']), None)
                    if student:
                        print(f"  ✓ {student['name']} ({match['match_score']}%) - {match['reasoning']}")
                
                return matches
            else:
                print(f"⚠️  Gemini API error: {response.status_code}")
                # Fallback to simple matching
                return self._simple_match(opportunity, students)
                
        except Exception as e:
            print(f"❌ Gemini error: {e}")
            # Fallback to simple matching
            return self._simple_match(opportunity, students)
    
    def _create_matching_prompt(self, opportunity, students):
        """Create the prompt for Gemini"""
        # Limit to first 20 students for faster response
        students_sample = students[:20]
        
        return f"""You are a university opportunity matching system.

Opportunity:
- Title: {opportunity['title']}
- Description: {opportunity['description']}
- Category: {opportunity['category']}
- Type: {opportunity['type']}
- Target Programs: {', '.join(opportunity.get('target_programs', []))}
- Target Years: {', '.join(map(str, opportunity.get('target_years', [])))}
- Target Interests: {', '.join(opportunity.get('target_interests', []))}

Students (showing first {len(students_sample)}):
{json.dumps([{
    'id': s['id'],
    'name': s['name'],
    'program': s['program'],
    'year': s['year'],
    'interests': s.get('interests', []),
    'ethnicity': s.get('ethnicity', [])
} for s in students_sample], indent=2)}

Analyze and return ONLY students with match_score > 70.
Return JSON array with this exact format:
[
  {{
    "student_id": "uuid-here",
    "match_score": 85,
    "reasoning": "Brief reason why this is a good match"
  }}
]

Return ONLY the JSON array, no other text."""
    
    def _parse_gemini_response(self, text):
        """Parse Gemini's JSON response"""
        try:
            # Clean up response
            clean_text = text.strip()
            if clean_text.startswith('```json'):
                clean_text = clean_text[7:]
            if clean_text.endswith('```'):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            
            # Parse JSON
            matches = json.loads(clean_text)
            return matches
            
        except Exception as e:
            print(f"⚠️  Error parsing Gemini response: {e}")
            return []
    
    def _simple_match(self, opportunity, students):
        """Fallback simple matching based on program and year"""
        print("🔄 Using simple fallback matching...")
        matches = []
        
        target_programs = opportunity.get('target_programs', [])
        target_years = opportunity.get('target_years', [])
        
        for student in students:
            # Check if student matches criteria
            program_match = 'All Programs' in target_programs or student['program'] in target_programs
            year_match = student['year'] in target_years
            
            if program_match and year_match:
                matches.append({
                    'student_id': student['id'],
                    'match_score': 75,
                    'reasoning': f"Matches program ({student['program']}) and year ({student['year']})"
                })
        
        return matches[:10]  # Limit to top 10
    
    def _publish_matches(self, opportunity, matches):
        """Publish match results to Solace"""
        try:
            event = {
                "type": "MATCHES_FOUND",
                "topic": "matches/found",
                "data": {
                    "opportunity_id": opportunity.get('id'),
                    "opportunity_title": opportunity['title'],
                    "matches": matches,
                    "match_count": len(matches)
                },
                "timestamp": time.time()
            }
            
            print(f"\n Publishing matches to Solace topic: matches/found")
            
            # Save to file (simulating Solace publish)
            self._save_event(event)
            
            print(f"✅ Published {len(matches)} matches!")
            
        except Exception as e:
            print(f"❌ Error publishing matches: {e}")
    
    def _save_event(self, event):
        """Save event to file"""
        try:
            os.makedirs('backend/logs', exist_ok=True)
            with open('backend/logs/matching_events.json', 'a') as f:
                f.write(json.dumps(event) + '\n')
        except Exception as e:
            print(f"⚠️  Error saving event: {e}")
    
    def _log_matches(self, opportunity, matches):
        """Log detailed match information"""
        try:
            log_entry = {
                "timestamp": time.time(),
                "opportunity": opportunity['title'],
                "total_matches": len(matches),
                "matches": matches
            }
            
            os.makedirs('backend/logs', exist_ok=True)
            with open('backend/logs/matches.json', 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
                
        except Exception as e:
            print(f"⚠️  Error logging: {e}")

# Global instance
matching_agent = MatchingAgent()

if __name__ == "__main__":
    print("\n" + "="*60)
    print(" MATCHING AGENT - Gemini AI Matcher")
    print("="*60)
    
    # Import intake agent to listen to its events
    try:
        from intake_agent import intake_agent
        
        print("\n Agent is running. Press Ctrl+C to stop.")
        print(" Listening for new opportunities from Intake Agent...")
        
        # Start listening
        matching_agent.listen_for_opportunities(intake_agent)
        
    except KeyboardInterrupt:
        print("\n\n👋 Matching Agent stopped")
        print(f" Total matches made: {matching_agent.matched_count}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("💡 Make sure intake_agent.py is in the same directory")