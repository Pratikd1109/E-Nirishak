#!/usr/bin/env python3
"""
Simple test script to query the RAG service directly
"""
import sys
import os

# Add the parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.services.rag_service import get_answer

def test_rag_query():
    print("=" * 80)
    print("Testing RAG Agent")
    print("=" * 80)
    
    # Test question about Legal Metrology
    question = "What are the key provisions of the Legal Metrology Act related to instrument verification?"
    
    print(f"\nQuestion: {question}\n")
    print("Querying RAG agent...")
    print("-" * 80)
    
    try:
        answer, sources = get_answer(question)
        
        print("\n✓ SUCCESS - RAG Agent Response:\n")
        print(answer)
        print("\n" + "=" * 80)
        print(f"Sources ({len(sources)} documents retrieved):")
        print("=" * 80)
        for i, source in enumerate(sources, 1):
            print(f"\n[{i}] {source}")
        
        return True
        
    except Exception as e:
        print(f"\n✗ ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_rag_query()
    sys.exit(0 if success else 1)
