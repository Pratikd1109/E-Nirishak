#!/usr/bin/env python3
"""
Detailed Sarvam AI debugging with multiple approaches
"""
import sys
import os
from pathlib import Path

# Add to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings

print("="*80)
print("Sarvam AI Detailed Debug")
print("="*80)

# Check API key
print(f"\n1. API Key Check:")
print(f"   Key present: {bool(settings.SARVAM_API_KEY)}")
if settings.SARVAM_API_KEY:
    print(f"   Key prefix: {settings.SARVAM_API_KEY[:10]}...")
    print(f"   Key length: {len(settings.SARVAM_API_KEY)}")

# Method 1: Test with langchain_sarvam package
print(f"\n2. Testing langchain_sarvam package:")
try:
    from langchain_sarvam import ChatSarvam
    
    print(f"   Creating ChatSarvam instance...")
    llm = ChatSarvam(
        model="sarvam-105b",
        api_key=settings.SARVAM_API_KEY,
    )
    print(f"   ✓ Instance created")
    
    print(f"\n   Test 1: Simple math question")
    try:
        response = llm.invoke("What is 5+3? Answer with just the number.")
        print(f"   Response object: {type(response)}")
        print(f"   Has content attr: {hasattr(response, 'content')}")
        if hasattr(response, 'content'):
            print(f"   Content: '{response.content}'")
            print(f"   Content length: {len(response.content)}")
            print(f"   Content stripped: '{response.content.strip()}'")
        else:
            print(f"   Full response: {response}")
    except Exception as e:
        print(f"   ✗ Error: {type(e).__name__}: {e}")
        
    print(f"\n   Test 2: Longer question")
    try:
        response = llm.invoke("Explain in one sentence what the Jan Vishwas Act is.")
        if hasattr(response, 'content'):
            print(f"   Content: '{response.content[:200]}'")
            print(f"   Length: {len(response.content)}")
        else:
            print(f"   Response: {response}")
    except Exception as e:
        print(f"   ✗ Error: {type(e).__name__}: {e}")
        
except ImportError as e:
    print(f"   ✗ Import error: {e}")
    print(f"\n   Installing langchain-sarvam...")
    print(f"   Run: pip install langchain-sarvam")
except Exception as e:
    print(f"   ✗ Unexpected error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

# Method 2: Test with direct sarvamai SDK
print(f"\n3. Testing direct sarvamai SDK:")
try:
    import sarvamai
    
    print(f"   Creating Sarvam client...")
    client = sarvamai.Sarvam(api_key=settings.SARVAM_API_KEY)
    
    print(f"   Calling chat.completions...")
    response = client.chat.completions.create(
        model="sarvam-105b",
        messages=[
            {"role": "user", "content": "What is 2+2? Answer in one word."}
        ],
        max_tokens=50
    )
    
    print(f"   Response type: {type(response)}")
    print(f"   Response: {response}")
    if hasattr(response, 'choices') and response.choices:
        print(f"   First choice: {response.choices[0]}")
        if hasattr(response.choices[0], 'message'):
            print(f"   Message: {response.choices[0].message}")
            if hasattr(response.choices[0].message, 'content'):
                print(f"   Content: '{response.choices[0].message.content}'")
    
except ImportError as e:
    print(f"   ✗ sarvamai not installed: {e}")
    print(f"   Run: pip install sarvamai")
except Exception as e:
    print(f"   ✗ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

# Method 3: Test with requests (direct API call)
print(f"\n4. Testing direct API call:")
try:
    import requests
    
    url = "https://api.sarvam.ai/v1/chat/completions"
    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "model": "sarvam-105b",
        "messages": [
            {"role": "user", "content": "Say 'hello' in one word."}
        ],
        "max_tokens": 20,
        "temperature": 0.3
    }
    
    print(f"   Calling {url}...")
    response = requests.post(url, json=payload, headers=headers, timeout=30)
    
    print(f"   Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success!")
        print(f"   Response keys: {list(data.keys())}")
        
        if 'choices' in data and data['choices']:
            content = data['choices'][0].get('message', {}).get('content', '')
            print(f"   Content: '{content}'")
            print(f"   Content length: {len(content)}")
            
            if not content or len(content.strip()) == 0:
                print(f"\n   ⚠️  ISSUE FOUND: API returns 200 but content is empty!")
                print(f"   Full response: {data}")
        
        if 'usage' in data:
            print(f"   Usage: {data['usage']}")
            
    else:
        print(f"   ✗ Error response:")
        print(f"   {response.text[:500]}")
        
except ImportError:
    print(f"   ✗ requests not installed")
except Exception as e:
    print(f"   ✗ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

# Method 4: Test with different parameters
print(f"\n5. Testing with different parameters:")
try:
    from langchain_sarvam import ChatSarvam
    
    test_params = [
        {"max_tokens": 100, "temperature": 0.5},
        {"max_tokens": 500, "temperature": 0.3},
        {"max_tokens": 1000, "temperature": 0.1},
    ]
    
    for i, params in enumerate(test_params, 1):
        print(f"\n   Test {i}: max_tokens={params['max_tokens']}, temp={params['temperature']}")
        try:
            llm = ChatSarvam(
                model="sarvam-105b",
                api_key=settings.SARVAM_API_KEY,
                max_tokens=params['max_tokens'],
                temperature=params['temperature'],
            )
            response = llm.invoke("Answer in 3 words: What is AI?")
            content = response.content if hasattr(response, 'content') else str(response)
            print(f"       Response: '{content[:100]}'")
            print(f"       Length: {len(content)}")
            
            if content and len(content.strip()) > 0:
                print(f"       ✓ Got non-empty response!")
                break
        except Exception as e:
            print(f"       ✗ Error: {type(e).__name__}: {str(e)[:100]}")
            
except Exception as e:
    print(f"   Skipped: {e}")

print("\n" + "="*80)
print("Debug Complete")
print("="*80)
print("\nNext steps:")
print("1. Check if content is empty in direct API calls")
print("2. Verify API key permissions and quota")
print("3. Check if model name is correct")
print("4. Try different max_tokens values")
