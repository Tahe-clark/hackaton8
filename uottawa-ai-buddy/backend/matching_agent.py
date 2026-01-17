import os
from dotenv import load_dotenv
# from solace_config import get_messaging_service, create_receiver

load_dotenv()

def on_opportunity_received(message):
    """Callback when new opportunity published"""
    print("📩 Received opportunity")
    # TODO: Tomorrow - get students, call Gemini, publish matches
    pass

def match_students_to_opportunity(opportunity_id):
    """Use Gemini to match students"""
    print("🧠 Matching with Gemini...")
    # TODO: Tomorrow - Gemini API call
    pass

if __name__ == "__main__":
    print("🤖 Matching Agent Started")
    print("✅ Skeleton ready")