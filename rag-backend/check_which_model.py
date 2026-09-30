#!/usr/bin/env python3
"""
Simple script to query the API and show which model answered
"""
import sys
import requests
import json

print("="*80)
print("Which Model Is Answering? - Quick Check")
print("="*80)

# Test question
question = "What is the Jan Vishwas Act?"

print(f"\nSending question: '{question}'")
print("-"*80)

try:
    # Query the API
    response = requests.post(
        "http://localhost:8000/api/query",
        json={"question": question},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        answer = data.get("answer", "")
        sources = data.get("sources", [])
        
        print(f"\n✓ Got response!")
        print(f"\nAnswer length: {len(answer)} characters")
        print(f"Sources: {len(sources)} documents")
        
        print(f"\nAnswer preview:")
        print(f"{answer[:300]}...")
        
        print("\n" + "="*80)
        print("NOW CHECK YOUR SERVER CONSOLE!")
        print("="*80)
        print("\nLook for one of these in the server logs:\n")
        
        print("✓ If you see:")
        print("  'INFO - ✓ Sarvam returned answer (XXX chars)'")
        print("  'INFO - Answer generated using: sarvam-105b'")
        print("  → Sarvam AI is working! 🎉\n")
        
        print("⚠️  If you see:")
        print("  'WARNING - ⚠️  Sarvam returned empty/short answer'")
        print("  'INFO - Falling back to Gemini...'")
        print("  'INFO - Answer generated using: gemini-2.5-flash'")
        print("  → Sarvam returned empty, Gemini took over")
        print("  → Run: python quick_sarvam_test.py (to debug why)\n")
        
    else:
        print(f"\n✗ Error: Status {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("\n✗ Cannot connect to server!")
    print("\nMake sure FastAPI is running:")
    print("  cd E:\\SIH'26\\SIH26036\\rag-backend")
    print("  python -m uvicorn main:app --reload --port 8000")
    
except Exception as e:
    print(f"\n✗ Error: {type(e).__name__}: {e}")

print("\n" + "="*80)
