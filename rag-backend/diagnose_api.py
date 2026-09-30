"""
Quick diagnostic script to:
1. Verify the API key loads correctly
2. List all available Gemini models that support embedContent
"""
import os
import sys
from pathlib import Path

# Load .env manually
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent / ".env"
print(f"Loading .env from: {env_path} (exists={env_path.exists()})")
load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {'YES - prefix: ' + api_key[:12] if api_key else 'NO - NOT FOUND'}")

if not api_key:
    print("ERROR: Could not load API key. Exiting.")
    sys.exit(1)

try:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    print("\nAvailable models supporting embedContent:")
    found = 0
    for m in genai.list_models():
        if "embedContent" in m.supported_generation_methods:
            print(f"  -> {m.name}")
            found += 1
    if found == 0:
        print("  (none found - API key may not have access to embedding models)")
    
    print("\nAll available models:")
    for m in genai.list_models():
        print(f"  {m.name}: {m.supported_generation_methods}")
except Exception as e:
    print(f"\nERROR calling Gemini API: {e}")
