import os
from dotenv import load_dotenv

load_dotenv()

def on_matches_found(message):
    """Callback when matches published"""
    print("✉️ Notifying students...")
    # TODO: Tomorrow - log student IDs
    pass

if __name__ == "__main__":
    print("🤖 Notification Agent Started")
    print("✅ Skeleton ready")