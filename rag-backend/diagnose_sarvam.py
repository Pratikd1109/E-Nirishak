#!/usr/bin/env python3
"""
Comprehensive Sarvam AI diagnostic script
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings

print("="*80)
print("Sarvam AI Diagnostic")
print("="*80)

# Test 1: Check API key
print("\n1. Checking Sarvam API Key:")
if settings.SARVAM_API_KEY:
    print(f"   API Key: {settings.SARVAM_API_KEY[:15]}...{settings.SARVAM_API_KEY[-5:]}")
    print(f"   Length: {len(settings.SARVAM_API_KEY)} characters")
else:
    print("   ✗ API Key not found!")
    sys.exit(1)

# Test 2: Check langchain_sarvam package
print("\n2. Checking langchain_sarvam package:")
try:
    import langchain_sarvam
    print(f"   ✓ Package installed")
    print(f"   Version: {getattr(langchain_sarvam, '__version__', 'unknown')}")
except ImportError as e:
    print(f"   ✗ Package not installed: {e}")
    print("\n   To install: pip install langchain-sarvam")
    sys.exit(1)

# Test 3: Import ChatSarvam
print("\n3. Importing ChatSarvam:")
try:
    from langchain_sarvam import ChatSarvam
    print(f"   ✓ ChatSarvam imported successfully")
except ImportError as e:
    print(f"   ✗ Import failed: {e}")
    sys.exit(1)

# Test 4: Initialize ChatSarvam
print("\n4. Initializing ChatSarvam:")
try:
    llm = ChatSarvam(
        model="sarvam-105b",
        api_key=settings.SARVAM_API_KEY,
    )
    print(f"   ✓ ChatSarvam initialized")
    print(f"   Model: sarvam-105b")
except Exception as e:
    print(f"   ✗ Initialization failed: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Simple invoke test
print("\n5. Testing simple invoke (What is 2+2?):")
try:
    response = llm.invoke("What is 2+2? Answer in one short sentence.")
    print(f"   Response type: {type(response)}")
    print(f"   Response: {response}")
    
    if hasattr(response, 'content'):
        print(f"   Content: '{response.content}'")
        print(f"   Content length: {len(response.content)} characters")
        if len(response.content.strip()) == 0:
            print(f"   ⚠️  WARNING: Content is empty!")
    else:
        print(f"   ⚠️  No 'content' attribute found")
        
except Exception as e:
    print(f"   ✗ Invoke failed: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

# Test 6: Test with different model names
print("\n6. Testing different Sarvam model names:")
model_names = ["sarvam-105b", "sarvam-2b", "sarvam-1", "sarvam"]
for model_name in model_names:
    try:
        print(f"\n   Testing: {model_name}")
        llm_test = ChatSarvam(
            model=model_name,
            api_key=settings.SARVAM_API_KEY,
        )
        response = llm_test.invoke("Say 'hello' in one word.")
        content = response.content if hasattr(response, 'content') else str(response)
        print(f"      Response: '{content[:100]}'")
        if content and len(content.strip()) > 0:
            print(f"      ✓ Model {model_name} works!")
            break
    except Exception as e:
        print(f"      ✗ Failed: {type(e).__name__}: {str(e)[:100]}")

# Test 7: Check available parameters
print("\n7. Checking ChatSarvam signature:")
try:
    import inspect
    sig = inspect.signature(ChatSarvam.__init__)
    print(f"   Parameters: {list(sig.parameters.keys())}")
except Exception as e:
    print(f"   Could not inspect: {e}")

# Test 8: Direct API call test (if requests available)
print("\n8. Testing direct Sarvam API:")
try:
    import requests
    
    # Try to find Sarvam API endpoint
    headers = {
        "Authorization": f"Bearer {settings.SARVAM_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Common API endpoints to try
    endpoints = [
        "https://api.sarvam.ai/v1/chat/completions",
        "https://api.sarvam.ai/chat/completions",
        "https://api.sarvam.ai/v1/completions",
    ]
    
    test_payload = {
        "model": "sarvam-105b",
        "messages": [{"role": "user", "content": "Say hello"}],
        "max_tokens": 50
    }
    
    for endpoint in endpoints:
        print(f"\n   Trying: {endpoint}")
        try:
            response = requests.post(endpoint, json=test_payload, headers=headers, timeout=10)
            print(f"      Status: {response.status_code}")
            if response.status_code == 200:
                print(f"      ✓ Success! Response: {response.json()}")
                break
            else:
                print(f"      Response: {response.text[:200]}")
        except Exception as e:
            print(f"      Error: {type(e).__name__}: {str(e)[:100]}")
            
except ImportError:
    print("   Skipping (requests not installed)")
except Exception as e:
    print(f"   Error: {type(e).__name__}: {e}")

print("\n" + "="*80)
print("Diagnostic Complete")
print("="*80)
