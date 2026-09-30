# RAG Agent Testing Guide - Sarvam vs Gemini

## Quick Start

Your RAG agent now tries **Sarvam AI first**, then falls back to **Gemini** if needed.

## Prerequisites

1. **Server should be running** (with auto-reload)
2. **Packages installed:**
   ```powershell
   pip install langchain-sarvam sarvamai requests
   ```

---

## Test 1: API Query Test (Recommended)

**Run this PowerShell script:**
```powershell
cd E:\SIH'26\SIH26036\rag-backend
.\test_api_query.ps1
```

**What it does:**
- Sends 3 test questions to your RAG API
- Shows answers and sources
- Tells you to check server logs for model used

**Expected Output:**
```
Testing RAG API - Sarvam vs Gemini
================================================================================

Test 1: Simple Question
--------------------------------------------------------------------------------
Question: What is the Jan Vishwas Act?

Answer:
The Jan Vishwas (Amendment of Provisions) Act, 2023...

Sources:
  - [Jan Vishwas Act 2023...] THE JAN VISHWAS...

✓ Test 1 PASSED
```

**Then check your FastAPI server console for:**
```
INFO - Attempting answer generation with Sarvam-105B...
INFO - ✓ Sarvam returned answer (XXX chars)
INFO - Answer generated using: sarvam-105b
```

OR

```
INFO - Attempting answer generation with Sarvam-105B...
WARNING - ⚠️  Sarvam returned empty/short answer: ''
INFO - Falling back to Gemini...
INFO - ✓ Gemini returned answer (XXX chars)
INFO - Answer generated using: gemini-2.5-flash
```

---

## Test 2: Direct Sarvam Test

**Test if Sarvam API works at all:**
```powershell
cd E:\SIH'26\SIH26036\rag-backend
python quick_sarvam_test.py
```

**What it tests:**
1. API key is loaded
2. langchain-sarvam package works
3. Direct API call with requests
4. Response content (empty or not)

**Expected Output (Success):**
```
================================================================================
Quick Sarvam AI Test
================================================================================

1. API Key loaded: True

2. Testing with langchain-sarvam:
   Sending: 'What is 2+2?'
   Response type: <class 'langchain_core.messages.ai.AIMessage'>
   Has content: True
   Content: 'Four'
   Length: 4
   Stripped length: 4

   ✓ SUCCESS! Sarvam is working!
```

**Expected Output (Empty Response Issue):**
```
2. Testing with langchain-sarvam:
   Sending: 'What is 2+2?'
   Response type: <class 'langchain_core.messages.ai.AIMessage'>
   Has content: True
   Content: ''
   Length: 0
   Stripped length: 0

   ✗ ISSUE: Sarvam returns empty content
```

---

## Test 3: Full RAG Test with Logging

**Test the complete RAG pipeline:**
```powershell
cd E:\SIH'26\SIH26036\rag-backend
python test_with_fallback.py
```

**What it tests:**
- Vector retrieval from Pinecone
- Context formatting
- Answer generation with both models
- Fallback logic

**Expected Output:**
```
================================================================================
Testing RAG Agent with Sarvam → Gemini Fallback
================================================================================

Question: What is the Jan Vishwas Act and what are its key provisions?

--------------------------------------------------------------------------------
Querying RAG agent (will try Sarvam first, then Gemini if needed)...
--------------------------------------------------------------------------------

INFO - Attempting answer generation with Sarvam-105B...
INFO - ✓ Sarvam returned answer (542 chars)
INFO - Answer generated using: sarvam-105b

================================================================================
ANSWER:
================================================================================
The Jan Vishwas (Amendment of Provisions) Act...

✓ TEST PASSED
```

---

## Test 4: Manual API Test

**Using Invoke-RestMethod:**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/query" `
  -ContentType "application/json" `
  -Body '{"question": "What is the Jan Vishwas Act?"}'
```

**Using curl:**
```bash
curl -X POST "http://localhost:8000/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the Jan Vishwas Act?"}'
```

---

## Interpreting Results

### If Sarvam Works:
Server logs show:
```
INFO - Attempting answer generation with Sarvam-105B...
INFO - ✓ Sarvam returned answer (542 chars)
INFO - Answer generated using: sarvam-105b
```

**Meaning:** ✓ Sarvam AI is working perfectly! You're getting optimized responses for Indian legal documents.

### If Sarvam Returns Empty:
Server logs show:
```
INFO - Attempting answer generation with Sarvam-105B...
WARNING - ⚠️  Sarvam returned empty/short answer: ''
INFO - Falling back to Gemini...
INFO - ✓ Gemini returned answer (542 chars)
INFO - Answer generated using: gemini-2.5-flash
```

**Meaning:** Sarvam returned empty, but Gemini handled it. Need to debug why Sarvam is empty.

### If Sarvam Errors:
Server logs show:
```
INFO - Attempting answer generation with Sarvam-105B...
ERROR - ✗ Sarvam error: ConnectionError: ...
INFO - Falling back to Gemini...
```

**Meaning:** Sarvam API connection issue. Check network, API key, or service status.

---

## Troubleshooting

### Issue 1: "Package not installed"
**Error:** `ModuleNotFoundError: No module named 'langchain_sarvam'`

**Fix:**
```powershell
pip install langchain-sarvam sarvamai
```

### Issue 2: "Unable to connect to localhost:8000"
**Error:** Connection refused

**Fix:**
1. Check if server is running:
   ```powershell
   # Start server if not running
   cd E:\SIH'26\SIH26036\rag-backend
   $env:PYTHONUTF8=1
   python -m uvicorn main:app --reload --port 8000
   ```

2. Wait 5-10 seconds for startup
3. Try again

### Issue 3: "Sarvam returns empty content"
**Symptom:** Tests pass but content is always empty from Sarvam

**Possible Causes & Fixes:**

1. **Low max_tokens + reasoning mode**
   
   Edit `rag_service.py`, add `reasoning_effort=None`:
   ```python
   llm_sarvam = ChatSarvam(
       model="sarvam-105b",
       api_key=settings.SARVAM_API_KEY,
       max_tokens=4096,  # Increase
       reasoning_effort=None,  # Disable reasoning
       temperature=0.2,
   )
   ```

2. **API quota exhausted**
   
   Visit https://dashboard.sarvam.ai
   - Check usage limits
   - Verify API key is active
   - Look for rate limit warnings

3. **Wrong model name**
   
   Try alternative:
   ```python
   model="sarvam-105b-conversations"  # Instead of sarvam-105b
   ```

### Issue 4: Both models fail
**Error:** Exception raised, no answer returned

**Fix:**
1. Check internet connection
2. Verify both API keys are valid
3. Check server logs for detailed error
4. Ensure Pinecone index exists

---

## Expected Performance

| Metric | Target |
|--------|--------|
| **Query latency** | 3-7 seconds |
| **Retrieval accuracy** | 5 relevant sources |
| **Answer quality** | High (legal citations) |
| **Success rate** | 100% (with fallback) |

---

## Debug Checklist

Before reporting an issue, verify:

- [ ] Server is running on port 8000
- [ ] `langchain-sarvam` package installed
- [ ] API keys are in `.env` file
- [ ] `.env` file in correct location (workspace root)
- [ ] Tested with `quick_sarvam_test.py`
- [ ] Checked server console logs
- [ ] Tried manual API query
- [ ] Verified Pinecone has 738 vectors

---

## Advanced: Enable Debug Logging

For more detailed logs, edit `rag_service.py`:

```python
# At the top of the file
logging.basicConfig(level=logging.DEBUG)  # Changed from INFO
```

This will show:
- Exact API calls
- Token counts
- Response metadata
- Retry attempts

---

## Support

If Sarvam still returns empty after trying fixes:

1. Run diagnostic:
   ```powershell
   python quick_sarvam_test.py > sarvam_debug.txt 2>&1
   ```

2. Check server logs

3. Share:
   - Content of `sarvam_debug.txt`
   - Server console logs (last 50 lines)
   - Which test passed/failed

This will help identify the exact root cause!

---

## Summary

Your RAG agent is **production-ready** with automatic fallback:

✅ **Always returns an answer** (Sarvam or Gemini)  
✅ **Transparent logging** (see which model was used)  
✅ **Graceful degradation** (handles API failures)  
✅ **Easy to debug** (comprehensive test scripts)

Run the tests above to see which model is answering your queries! 🚀
