#!/usr/bin/env python3
"""
Diagnostic script to check if RAG setup is working
"""
import sys
import os

print("=" * 80)
print("RAG Agent Setup Diagnostic")
print("=" * 80)

# Check Python version
print(f"\n1. Python Version: {sys.version}")

# Check environment variables
print("\n2. Checking Environment Variables:")
try:
    from dotenv import load_dotenv
    from pathlib import Path
    
    env_path = Path(__file__).resolve().parents[1] / ".env"
    print(f"   .env path: {env_path}")
    print(f"   .env exists: {env_path.exists()}")
    
    if env_path.exists():
        load_dotenv(env_path)
        keys = ["GEMINI_API_KEY", "PINECONE_API_KEY", "SARVAM_API_KEY"]
        for key in keys:
            value = os.getenv(key, "")
            print(f"   {key}: {'✓ Set' if value else '✗ Missing'}")
except Exception as e:
    print(f"   Error: {e}")

# Check required packages
print("\n3. Checking Required Packages:")
required_packages = [
    "fastapi",
    "uvicorn",
    "langchain",
    "langchain_google_genai",
    "langchain_sarvam",
    "langchain_pinecone",
    "pinecone",
]

for package in required_packages:
    try:
        __import__(package.replace("-", "_"))
        print(f"   {package}: ✓ Installed")
    except ImportError:
        print(f"   {package}: ✗ Missing")

# Check Pinecone connection
print("\n4. Testing Pinecone Connection:")
try:
    from pinecone import Pinecone
    api_key = os.getenv("PINECONE_API_KEY")
    if api_key:
        pc = Pinecone(api_key=api_key)
        indexes = pc.list_indexes()
        print(f"   Connection: ✓ Success")
        print(f"   Indexes found: {[idx['name'] for idx in indexes]}")
    else:
        print("   Connection: ✗ No API key")
except Exception as e:
    print(f"   Connection: ✗ Error - {e}")

# Check if index exists
print("\n5. Checking Vector Store Index:")
try:
    from app.core.config import settings
    print(f"   Expected index: {settings.PINECONE_INDEX_NAME}")
    
    if api_key:
        pc = Pinecone(api_key=api_key)
        existing = [idx["name"] for idx in pc.list_indexes()]
        if settings.PINECONE_INDEX_NAME in existing:
            index = pc.Index(settings.PINECONE_INDEX_NAME)
            stats = index.describe_index_stats()
            print(f"   Index status: ✓ Exists")
            print(f"   Total vectors: {stats.get('total_vector_count', 0)}")
        else:
            print(f"   Index status: ✗ Not found")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 80)
print("Diagnostic Complete")
print("=" * 80)
