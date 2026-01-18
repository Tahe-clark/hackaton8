import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

print(f"🔑 Testing Gemini API Key...")
print(f"   Key: {GEMINI_API_KEY[:20]}...{GEMINI_API_KEY[-10:]}")

# Test avec gemini-3-flash-preview (NOUVEAU MODÈLE)
response = requests.post(
    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={GEMINI_API_KEY}",
    headers={'Content-Type': 'application/json'},
    json={
        "contents": [{
            "parts": [{"text": "Say hello in one word"}]
        }]
    }
)

print(f"\n📡 Status: {response.status_code}")

if response.status_code == 200:
    print("✅ API Key is VALID with gemini-3-flash-preview!")
    data = response.json()
    print(f"Response: {data['candidates'][0]['content']['parts'][0]['text']}")
else:
    print(f"❌ Error: {response.text}")