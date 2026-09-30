#!/usr/bin/env python3
"""
Test LLM models to see which one is working
"""
import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings

print("="*80)
print("Testing LLM Models")
print("="*80)

# Test 1: Sarvam LLM
print("\n1. Testing Sarvam-105B...")
try:
    from langchain_sarvam import ChatSarvam
    llm_sarvam = ChatSarvam(
        model="sarvam-105b",
        api_key=settings.SARVAM_API_KEY,
    )
    
    response = llm_sarvam.invoke("What is 2+2? Answer in one short sentence.")
    print(f"   ✓ Sarvam Response: {response.content}")
    
except Exception as e:
    print(f"   ✗ Sarvam Error: {type(e).__name__}: {e}")

# Test 2: Google Gemini LLM
print("\n2. Testing Google Gemini-2.5-Flash...")
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    llm_gemini = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
    )
    
    response = llm_gemini.invoke("What is 2+2? Answer in one short sentence.")
    print(f"   ✓ Gemini Response: {response.content}")
    
except Exception as e:
    print(f"   ✗ Gemini Error: {type(e).__name__}: {e}")

# Test 3: RAG query with context
print("\n3. Testing RAG query with mock context...")
try:
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    
    # Try with Gemini since it's more reliable
    from langchain_google_genai import ChatGoogleGenerativeAI
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Answer based on the context: {context}"),
        ("human", "{question}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    result = chain.invoke({
        "context": "The Jan Vishwas Act, 2023 is an amendment act that decriminalizes certain offenses.",
        "question": "What is the Jan Vishwas Act?"
    })
    
    print(f"   ✓ RAG Chain Response: {result}")
    
except Exception as e:
    print(f"   ✗ RAG Chain Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*80)
print("Test Complete")
print("="*80)
