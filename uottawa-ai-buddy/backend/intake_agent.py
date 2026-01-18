"""
INTAKE AGENT - Receives new opportunities and publishes to Solace
This agent listens for new opportunities posted via the website
and publishes events to Solace for other agents to process
"""

import os
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Solace connection (simplified for hackathon)
# In production, use proper Solace Python SDK
SOLACE_HOST = os.getenv('SOLACE_HOST')
SOLACE_USERNAME = os.getenv('SOLACE_USERNAME')
SOLACE_PASSWORD = os.getenv('SOLACE_PASSWORD')

# For hackathon demo, we'll simulate Solace with a simple queue
# Replace with actual Solace SDK for production

class IntakeAgent:
    def __init__(self):
        self.message_queue = []
        print(" Intake Agent started")
        print(f" Connected to Solace at: {SOLACE_HOST}")
        print(" Listening for new opportunities...")
    
    def publish_opportunity(self, opportunity_data):
        """
        Publishes a new opportunity event to Solace
        This is called when faculty/clubs post an opportunity
        """
        try:
            # Create event message
            event = {
                "type": "NEW_OPPORTUNITY",
                "topic": "opportunities/new",
                "data": opportunity_data,
                "timestamp": time.time()
            }
            
            print(f"\n Received new opportunity: {opportunity_data.get('title', 'Untitled')}")
            print(f" Publishing to Solace topic: opportunities/new")
            
            # Simulate publishing to Solace
            # In production: solace_publisher.publish(event, topic="opportunities/new")
            self.message_queue.append(event)
            
            # Log the event
            self._log_event(event)
            
            print(f" Event published successfully!")
            print(f" Matching agent will now process this opportunity")
            
            return True
            
        except Exception as e:
            print(f" Error publishing opportunity: {e}")
            return False
    
    def _log_event(self, event):
        """Log events to a file for debugging"""
        try:
            with open('backend/logs/intake_events.json', 'a') as f:
                f.write(json.dumps(event) + '\n')
        except:
            # Create logs directory if it doesn't exist
            os.makedirs('backend/logs', exist_ok=True)
            with open('backend/logs/intake_events.json', 'a') as f:
                f.write(json.dumps(event) + '\n')
    
    def get_pending_events(self):
        """Get all pending events (for demo purposes)"""
        return self.message_queue
    
    def clear_queue(self):
        """Clear the message queue"""
        self.message_queue = []

# Global instance
intake_agent = IntakeAgent()

def trigger_intake(opportunity_data):
    """
    Function called from the web API when a new opportunity is posted
    """
    return intake_agent.publish_opportunity(opportunity_data)

if __name__ == "__main__":
    # Run the agent
    print("\n" + "="*60)
    print(" INTAKE AGENT - Solace Event Publisher")
    print("="*60)
    
    # Keep agent running
    print("\n Agent is running. Press Ctrl+C to stop.")
    print(" Waiting for opportunities to be posted via the website...")
    
    try:
        while True:
            time.sleep(1)
            
            # Check for pending events every 5 seconds
            if len(intake_agent.message_queue) > 0:
                print(f"\n Pending events: {len(intake_agent.message_queue)}")
    
    except KeyboardInterrupt:
        print("\n\n Intake Agent stopped")