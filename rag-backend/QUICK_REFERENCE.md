# Quick Reference - RAG Agent Testing

## 🚀 Fastest Test (10 seconds)

```powershell
cd E:\SIH'26\SIH26036\rag-backend
python check_which_model.py
```

Then check your **server console** for:
- `"Sarvam returned answer"` = ✅ Sarvam working
- `"Falling back to Gemini"` = ⚠️ Sarvam empty, Gemini working

---

## 📝 All Test Commands

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `.\test_api_query.ps1` | Test 3 queries via API | Quick functionality check |
| `python check_which_model.py` | Show which model answered | See Sarvam vs Gemini |
| `python quick_sarvam_test.py` | Test Sarvam connectivity | Debug empty responses |
| `python test_with_fallback.py` | Full RAG pipeline test | Complete system check |

---

## 🔍 Reading Server Logs

### Sarvam Working ✅
```
INFO - Attempting answer generation with Sarvam-105B...
INFO - ✓ Sarvam returned answer (542 chars)
INFO - Answer generated using: sarvam-105b
```
**Meaning:** Sarvam AI is working! Getting optimized responses.

### Sarvam Empty, Gemini Fallback ⚠️
```
INFO - Attempting answer generation with Sarvam-105B...
WARNING - ⚠️  Sarvam returned empty/short answer: ''
INFO - Falling back to Gemini...
INFO - ✓ Gemini returned answer (542 chars)
INFO - Answer generated using: gemini-2.5-flash
```
**Meaning:** Sarvam returned empty, but you still got an answer from Gemini.

**Next Step:** Run `python quick_sarvam_test.py` to debug why.

---

## 🛠️ Quick Fixes

### Fix 1: Sarvam Returns Empty (Most Common)

**Edit:** `app/services/rag_service.py`

**Change:**
```python
llm_sarvam = ChatSarvam(
    model="sarvam-105b",
    api_key=settings.SARVAM_API_KEY,
    max_tokens=2048,  # Current
    temperature=0.2,
)
```

**To:**
```python
llm_sarvam = ChatSarvam(
    model="sarvam-105b",
    api_key=settings.SARVAM_API_KEY,
    max_tokens=4096,          # Increased
    reasoning_effort=None,    # Disable reasoning
    temperature=0.2,
)
```

**Why:** Reasoning mode consumes tokens, leaving none for answer.

---

### Fix 2: Server Not Running

```powershell
cd E:\SIH'26\SIH26036\rag-backend
$env:PYTHONUTF8=1
python -m uvicorn main:app --reload --port 8000
```

---

### Fix 3: Package Missing

```powershell
pip install langchain-sarvam sarvamai requests
```

---

## 📊 Expected Results

**API Query Response:**
```json
{
  "answer": "The Jan Vishwas Act is...",
  "sources": ["[file.pdf | p.1] ...", ...]
}
```

**Server Logs:**
- Model attempt logged
- Success/fallback logged  
- Final model used logged

---

## 🎯 Success Criteria

✅ **API returns answer** (not empty)  
✅ **Sources included** (5 documents)  
✅ **Server logs show model** (Sarvam or Gemini)  
✅ **No errors** (or handled gracefully)

---

## 📖 Full Documentation

See `TESTING_GUIDE.md` for complete testing instructions.

---

## 🆘 Need Help?

**Run diagnostics:**
```powershell
python quick_sarvam_test.py > debug.txt 2>&1
type debug.txt
```

**Share:**
- Output of above command
- Server console logs (last 20 lines)
- Which test passed/failed
