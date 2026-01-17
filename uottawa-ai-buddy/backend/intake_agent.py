import os
from dotenv import load_dotenv
# from solace_config import get_messaging_service, create_publisher

load_dotenv()

def listen_for_new_opportunities():
    """Poll database for new opportunities"""
    print("👂 Listening for new opportunities...")
    # TODO: Tomorrow - poll Supabase every 30s
    pass

def publish_to_solace(opportunity):
    """Publish new opportunity event to Solace"""
    print(f"📤 Publishing to Solace: {opportunity.get('title')}")
    # TODO: Tomorrow - publish to topic "opportunities/new"
    pass

if __name__ == "__main__":
    print("🤖 Intake Agent Started")
    print("✅ Skeleton ready")