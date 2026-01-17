import os
from dotenv import load_dotenv
from solace.messaging.messaging_service import MessagingService
from solace.messaging.config.solace_properties import service_properties

load_dotenv()

def get_messaging_service():
    """Connect to Solace"""
    broker_props = {
        service_properties.TRANSPORT_PROTOCOL: "tcp",
        service_properties.SERVICE_HOST: os.getenv('SOLACE_HOST'),
        service_properties.SERVICE_VPN_NAME: os.getenv('SOLACE_VPN'),
        service_properties.AUTHENTICATION_SCHEME_BASIC_USER_NAME: os.getenv('SOLACE_USERNAME'),
        service_properties.AUTHENTICATION_SCHEME_BASIC_PASSWORD: os.getenv('SOLACE_PASSWORD')
    }
    
    messaging_service = MessagingService.builder().from_properties(broker_props).build()
    messaging_service.connect()
    print("✅ Connected to Solace")
    return messaging_service

def create_publisher(service, topic_name):
    """Create publisher for topic"""
    # TODO: Implement tomorrow
    print(f"📤 Publisher created for: {topic_name}")
    pass

def create_receiver(service, topic_name, callback):
    """Create receiver for topic"""
    # TODO: Implement tomorrow
    print(f"📥 Receiver created for: {topic_name}")
    pass

if __name__ == "__main__":
    # Test connection
    try:
        service = get_messaging_service()
        print("✅ Solace config ready")
        service.disconnect()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("⚠️ Add Solace credentials to .env tomorrow")