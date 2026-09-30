#!/usr/bin/env python3
"""
Quick test to see if Sarvam API is working at all
"""
import sys
import os
from pathlib import Path

# Add to path
sys.path.insert(0, str(Path(__file__).parent))

print("="*80)
print("Quick Sarvam AI Test")
print("="*80)

# Load env
from app.core.config import settings

print(f"\n1. API Key loaded: {bool(settings.SARVAM_API_KEY)}")

# Test 1: Try with langchain-sarvam
print(f"\n2. Testing with langchain-sarvam:")
try:
    from langchain_sarvam import ChatSarvam
    
    llm = ChatSarvam(
        model="sarvam-105b",
        api_key=settings.SARVAM_API_KEY,
        max_tokens=100,
        temperature=0.3
    )
    
    print(f"   Sending: 'What is 2+2?'")
    response = llm.invoke("What is 2+2? Answer in one sentence.")
    
    print(f"   Response type: {type(response)}")
    print(f"   Has content: {hasattr(response, 'content')}")
    
    if hasattr(response, 'content'):
        content = response.content
        print(f"   Content: '{content}'")
        print(f"   Length: {len(content)}")
        print(f"   Stripped length: {len(content.strip())}")
        
        if content and len(content.strip()) > 0:
            print(f"\n   ✓ SUCCESS! Sarvam is working!")
        else:
            print(f"\n   ✗ ISSUE: Sarvam returns empty content")
            print(f"\n   Full response object:")
            print(f"   {response}")
            
            # Check for other attributes
            print(f"\n   Response attributes: {dir(response)}")
            
    else:
        print(f"   ✗ No content attribute")
        print(f"   Response: {response}")
        
except ImportError as e:
    print(f"   ✗ Package not installed: {e}")
    print(f"\n   Install with: pip install langchain-sarvam")
    
except Exception as e:
    print(f"   ✗ Error: {type(e).__name__}")
    print(f"   Message: {e}")
    
    # Try to get more details
    if hasattr(e, '__dict__'):
        print(f"   Details: {e.__dict__}")

# Test 2: Try direct API call
print(f"\n3. Testing direct API call:")
try:
    import requests
    
    url = "https://api.sarvam.ai/v1/chat/completions"
    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "sarvam-105b",
        "messages": [{"role": "user", "content": "What is 2+2? Answer with just the number."}],
        "max_tokens": 50,
        "temperature": 0.3
    }
    
    print(f"   Calling: {url}")
    response = requests.post(url, json=payload, headers=headers, timeout=15)
    
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        if 'choices' in data and data['choices']:
            content = data['choices'][0].get('message', {}).get('content', '')
            print(f"   Content: '{content}'")
            print(f"   Length: {len(content)}")
            
            if content and len(content.strip()) > 0:
                print(f"\n   ✓ Direct API works! Content: '{content}'")
            else:
                print(f"\n   ⚠️  API returns 200 but content is EMPTY!")
                print(f"   Full response:")
                print(f"   {data}")
                
                # Check finish_reason
                if 'finish_reason' in data['choices'][0]:
                    finish = data['choices'][0]['finish_reason']
                    print(f"\n   finish_reason: {finish}")
                    if finish == 'length':
                        print(f"   → ISSUE: max_tokens too low! Try increasing to 500+")
        else:
            print(f"   ✗ No choices in response")
            print(f"   Response: {data}")
    else:
        print(f"   ✗ Error response:")
        print(f"   {response.text}")
        
except ImportError:
    print(f"   ✗ requests package not installed")
except Exception as e:
    print(f"   ✗ Error: {type(e).__name__}: {e}")

print("\n" + "="*80)
print("Test Complete")
print("="*80)

print("\nDiagnosis:")
print("-" * 80)
print("If Sarvam content is empty:")
print("  1. Try increasing max_tokens to 500-2000")
print("  2. Disable reasoning: reasoning_effort=None")
print("  3. Check API quota at dashboard.sarvam.ai")
print("  4. Verify API key has no typos")
print("\nFor now, the fallback to Gemini will handle it automatically!")
