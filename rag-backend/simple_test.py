#!/usr/bin/env python3
"""
Simple direct test of RAG components with file output
"""
import sys
import os
from pathlib import Path

# Redirect output to file
output_file = Path(__file__).parent / "test_output.txt"
sys.stdout = open(output_file, 'w', encoding='utf-8')
sys.stderr = sys.stdout

try:
    print("Starting RAG Test...")
    print("="*80)
    
    # Test 1: Check imports
    print("\n1. Testing imports...")
    from dotenv import load_dotenv
    print("   ✓ dotenv imported")
    
    from app.core.config import settings
    print("   ✓ config imported")
    
    print(f"\n2. Configuration:")
    print(f"   GEMINI_API_KEY: {settings.GEMINI_API_KEY[:20]}..." if settings.GEMINI_API_KEY else "   GEMINI_API_KEY: NOT SET")
    print(f"   PINECONE_API_KEY: {settings.PINECONE_API_KEY[:20]}..." if settings.PINECONE_API_KEY else "   PINECONE_API_KEY: NOT SET")
    print(f"   SARVAM_API_KEY: {settings.SARVAM_API_KEY[:20]}..." if settings.SARVAM_API_KEY else "   SARVAM_API_KEY: NOT SET")
    print(f"   Index: {settings.PINECONE_INDEX_NAME}")
    
    # Test 2: Check Pinecone
    print(f"\n3. Testing Pinecone connection...")
    from pinecone import Pinecone
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    indexes = pc.list_indexes()
    print(f"   ✓ Connected to Pinecone")
    print(f"   Available indexes: {[idx['name'] for idx in indexes]}")
    
    # Test 3: Simple RAG query
    print(f"\n4. Testing RAG query...")
    print(f"   Question: 'What is the Jan Vishwas Act?'")
    
    from app.services.rag_service import get_answer
    answer, sources = get_answer("What is the Jan Vishwas Act?")
    
    print(f"\n   ✓ SUCCESS!")
    print(f"\n   Answer:")
    print(f"   {answer}")
    print(f"\n   Sources ({len(sources)}):")
    for i, src in enumerate(sources[:3], 1):
        print(f"   [{i}] {src[:150]}...")
    
    print("\n" + "="*80)
    print("TEST PASSED - RAG Agent is working!")
    print("="*80)
    
except Exception as e:
    print(f"\n✗ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    print("\nTEST FAILED")

finally:
    sys.stdout.close()
