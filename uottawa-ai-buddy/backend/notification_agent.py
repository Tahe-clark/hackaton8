"""
NOTIFICATION AGENT - Sends notifications to matched students
Listens to Solace for match events and notifies students
"""

import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

class NotificationAgent:
    def __init__(self):
        self.notifications_sent = 0
        print(" Notification Agent started")
        print(" Ready to send notifications to students")
        print(" Listening for match events...")
    
    def listen_for_matches(self):
        """
        Listens to Solace for match events
        In production, this would use Solace SDK
        """
        print("\n Monitoring match events...")
        
        last_position = 0
        
        while True:
            try:
                # Read match events from file (simulating Solace)
                events = self._read_match_events(last_position)
                
                if events:
                    for event in events:
                        self.process_match_event(event)
                        last_position += 1
                
                time.sleep(2)  # Check every 2 seconds
                
            except FileNotFoundError:
                # No events yet
                time.sleep(5)
            except Exception as e:
                print(f" Error: {e}")
                time.sleep(5)
    
    def _read_match_events(self, start_from):
        """Read match events from log file"""
        try:
            with open('backend/logs/matching_events.json', 'r') as f:
                lines = f.readlines()
                
            # Get new events only
            new_events = []
            for i in range(start_from, len(lines)):
                event = json.loads(lines[i])
                new_events.append(event)
            
            return new_events
            
        except FileNotFoundError:
            return []
    
    def process_match_event(self, event):
        """Process a match event and notify students"""
        try:
            if event['type'] != 'MATCHES_FOUND':
                return
            
            data = event['data']
            opportunity_title = data['opportunity_title']
            matches = data['matches']
            
            print(f"\n{'='*60}")
            print(f" NEW MATCHES for: {opportunity_title}")
            print(f"{'='*60}")
            print(f" Notifying {len(matches)} students...")
            
            for match in matches:
                self._notify_student(match, opportunity_title)
            
            print(f" All notifications sent!")
            
        except Exception as e:
            print(f" Error processing event: {e}")
    
    def _notify_student(self, match, opportunity_title):
        """Send notification to a student"""
        try:
            student_id = match['student_id']
            match_score = match['match_score']
            reasoning = match['reasoning']
            
            # Get student details
            student = self._get_student(student_id)
            
            if not student:
                print(f"   Student {student_id} not found")
                return
            
            # Create notification
            notification = {
                "student_id": student_id,
                "opportunity_title": opportunity_title,
                "match_score": match_score,
                "reasoning": reasoning,
                "timestamp": time.time(),
                "status": "sent"
            }
            
            # Log notification
            self._log_notification(notification)
            
            # Display notification
            print(f"   → {student['name']}")
            print(f"     Match: {match_score}% - {reasoning}")
            
            # In production: Send actual email/push notification
            # self._send_email(student['email'], opportunity_title, reasoning)
            
            self.notifications_sent += 1
            
        except Exception as e:
            print(f"  Error notifying student: {e}")
    
    def _get_student(self, student_id):
        """Get student details from database"""
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/students?id=eq.{student_id}&select=*",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                }
            )
            
            if response.status_code == 200:
                students = response.json()
                return students[0] if students else None
            else:
                return None
                
        except Exception as e:
            print(f"   Error fetching student: {e}")
            return None
    
    def _log_notification(self, notification):
        """Log notification to file"""
        try:
            os.makedirs('backend/logs', exist_ok=True)
            with open('backend/logs/notifications.json', 'a') as f:
                f.write(json.dumps(notification) + '\n')
        except Exception as e:
            print(f"   Error logging notification: {e}")
    
    def _send_email(self, email, opportunity_title, reasoning):
        """
        Send actual email notification
        Placeholder for production implementation
        """
        # In production, integrate with:
        # - SendGrid
        # - AWS SES
        # - Mailgun
        # - etc.
        pass
    
    def get_stats(self):
        """Get notification statistics"""
        return {
            "total_sent": self.notifications_sent,
            "timestamp": time.time()
        }

# Global instance
notification_agent = NotificationAgent()

if __name__ == "__main__":
    print("\n" + "="*60)
    print(" NOTIFICATION AGENT - Student Notifier")
    print("="*60)
    
    print("\n Agent is running. Press Ctrl+C to stop.")
    print(" Waiting for match events from Matching Agent...")
    
    try:
        # Start listening for match events
        notification_agent.listen_for_matches()
        
    except KeyboardInterrupt:
        print("\n\n Notification Agent stopped")
        stats = notification_agent.get_stats()
        print(f" Total notifications sent: {stats['total_sent']}")
    except Exception as e:
        print(f"\n Error: {e}")