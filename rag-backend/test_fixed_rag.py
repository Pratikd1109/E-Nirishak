#!/usr/bin/env python3
"""
Test the fixed RAG agent with Gemini LLM
"""
import sys
from pathlib import Path
import json

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

print("="*80)
print("Testing Fixed RAG Agent (with Gemini LLM)")
print("="*80)

try:
    from app.services.rag_service import get_answer
    
    # Test query
    question = "What is the Jan Vishwas Act and what are its key provisions?"
    
    print(f"\nQuestion: {question}")
    print("\nQuerying RAG agent...")
    print("-"*80)
    
    answer, sources = get_answer(question)
    
    print("\n✓ SUCCESS!")
    print("\n" + "="*80)
    print("ANSWER:")
    print("="*80)
    print(answer)
    
    print("\n" + "="*80)
    print(f"SOURCES ({len(sources)} documents retrieved):")
    print("="*80)
    for i, source in enumerate(sources, 1):
        print(f"\n[{i}] {source[:250]}...")
    
    # Check if answer is not empty
    if answer and len(answer.strip()) > 0:
        print("\n" + "="*80)
        print("✓ TEST PASSED - RAG Agent is working correctly!")
        print("="*80)
        sys.exit(0)
    else:
        print("\n" + "="*80)
        print("✗ TEST FAILED - Answer is empty")
        print("="*80)
        sys.exit(1)
        
except Exception as e:
    print(f"\n✗ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    print("\n" + "="*80)
    print("✗ TEST FAILED")
    print("="*80)
    sys.exit(1)
