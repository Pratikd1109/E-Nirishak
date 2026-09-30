#!/usr/bin/env python3
"""
Test the RAG agent with Sarvam/Gemini fallback
"""
import sys
import logging
from pathlib import Path

# Setup logging to see which model is used
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s - %(message)s'
)

# Add to path
sys.path.insert(0, str(Path(__file__).parent))

print("="*80)
print("Testing RAG Agent with Sarvam → Gemini Fallback")
print("="*80)

try:
    from app.services.rag_service import get_answer
    
    # Test question
    question = "What is the Jan Vishwas Act and what are its key provisions?"
    
    print(f"\nQuestion: {question}")
    print("\n" + "-"*80)
    print("Querying RAG agent (will try Sarvam first, then Gemini if needed)...")
    print("-"*80 + "\n")
    
    answer, sources = get_answer(question)
    
    print("\n" + "="*80)
    print("ANSWER:")
    print("="*80)
    print(answer)
    
    print("\n" + "="*80)
    print(f"SOURCES ({len(sources)} documents):")
    print("="*80)
    for i, source in enumerate(sources, 1):
        print(f"\n[{i}] {source[:200]}...")
    
    # Check result
    if answer and len(answer.strip()) > 0:
        print("\n" + "="*80)
        print("✓ TEST PASSED")
        print("="*80)
        print("\nCheck the logs above to see which model was used:")
        print("  - 'Sarvam returned answer' = Sarvam AI worked!")
        print("  - 'Falling back to Gemini' = Sarvam returned empty, used Gemini")
        sys.exit(0)
    else:
        print("\n" + "="*80)
        print("✗ TEST FAILED - Both models returned empty")
        print("="*80)
        sys.exit(1)
        
except Exception as e:
    print(f"\n✗ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
