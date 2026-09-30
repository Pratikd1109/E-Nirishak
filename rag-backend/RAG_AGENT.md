# RAG Agent — Complete Documentation
**Project:** Maap Niriksak (E-Maap-Nirikshak)  
**Module:** `rag-backend/`

---

## What Is This?

The RAG (Retrieval-Augmented Generation) agent is a production-standard AI backend that turns the **Legal Metrology Act, 2009** and related PDF documents into a **live, queryable knowledge base**. Instead of hardcoding legal rules into the app, officers and admins can ask plain-English questions like:

> *"What is the re-verification period for a weighbridge?"*  
> *"What are the penalties for using an unverified instrument?"*

and get cited, accurate answers grounded directly in the legal text.

---

## Architecture

```
User Question
     │
     ▼
FastAPI /api/query
     │
     ▼
[Query Embedding]                    [Pinecone Vector DB]
GoogleGenerativeAIEmbeddings    ───► Cosine similarity search
(gemini-embedding-2, 3072-dim)       → Top-5 relevant chunks
     │                                        │
     │◄───────────────────────────────────────┘
     ▼
[Prompt Construction]
ChatPromptTemplate
  - System: "You are an expert on Legal Metrology..."
  - Context: Retrieved chunks with source + page metadata
  - Human: User's question
     │
     ▼
[LLM Generation]
ChatGoogleGenerativeAI
(gemini-2.5-flash)
     │
     ▼
[Response]
{ answer: "...", sources: ["[file | p.X] excerpt..."] }
```

---

## File-by-File Breakdown

### `app/core/config.py`
Centralized configuration using **Pydantic Settings** — loads `.env` automatically via absolute path resolution so it works regardless of which directory you run from.

```python
_ENV_PATH = Path(__file__).resolve().parents[3] / ".env"

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "emaap-nirikshak-v2"
    model_config = {"env_file": str(_ENV_PATH), "case_sensitive": False}
```

**Why this matters:** Using `case_sensitive: False` means `GEMINI_API_KEY` and `gemini_api_key` both work in the `.env` file.

---

### `app/services/rag_service.py` — Core RAG Pipeline

#### Model Setup
```python
# LLM: Google Gemini 2.5 Flash for answer generation
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",       # Fast, reliable model for Q&A
    temperature=0.2,                 # Low temp = factual, consistent answers
)

# Embeddings: Gemini embedding-2 for vector search
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",  # 3072-dim, highest quality available
)
```

**Note:** Originally configured with Sarvam-105B, but switched to Gemini due to empty response issues. Gemini provides excellent performance for legal document Q&A.

#### Pinecone Vector Store
```python
def get_vectorstore():
    # Lazy singleton Pinecone client
    # Auto-creates index if not exists (dimension=3072, cosine similarity)
    # Returns PineconeVectorStore ready for retrieval
```

**Index:** `emaap-nirikshak-v2` | **Dimension:** 3072 | **Metric:** Cosine | **Cloud:** AWS us-east-1

#### Document Ingestion Pipeline
```
PDF File
  → PyPDFLoader (extracts text per page)
  → RecursiveCharacterTextSplitter
      chunk_size=1000 chars
      chunk_overlap=200 chars       ← ensures context isn't lost at boundaries
      add_start_index=True          ← for precise source attribution
  → Batch into groups of 50
  → _upsert_batch() with Tenacity retry
      ↑ exponential backoff: 40s→120s, max 5 attempts on 429
  → 5s sleep between batches        ← stays under 100 req/min free tier
```

#### Query Pipeline (LCEL — LangChain Expression Language)
```python
# 1. Embed query + retrieve top-5 chunks (with SSL/network retry)
retrieved_docs = _retrieve_docs(retriever, question)

# 2. Format chunks with source metadata
context = _format_docs(retrieved_docs)
# → "[Source: file.pdf, Page: 3]\nChunk text..."

# 3. Build prompt + run LLM (with retry)
rag_chain = prompt | llm | StrOutputParser()
answer = _generate_answer(rag_chain, context, question)

# 4. Return answer + source citations
return answer, sources
```

**Why LCEL instead of `langchain.chains`?** LangChain 1.x made `langchain.chains` an empty namespace. LCEL (`|` pipe operator) is the modern, composable, production-recommended approach.

#### Retry Strategy (Tenacity)
| Scenario | Retry config |
|---|---|
| **Document upsert (429 rate limit)** | 40s–120s exponential backoff, 5 attempts |
| **Query retrieval (SSL/network)** | 3s–30s exponential backoff, 4 attempts |
| **LLM generation (SSL/network)** | 3s–30s exponential backoff, 4 attempts |

Caught keywords: `resource_exhausted`, `429`, `quota`, `ssl`, `eof`, `connection`, `remote end closed`, `broken pipe`, `timeout`

---

### `app/api/routes.py` — API Endpoints

#### `POST /api/query`
```json
Request:  { "question": "What is the verification period for weighing scales?" }

Response: {
  "answer": "According to the Legal Metrology (General) Rules...",
  "sources": [
    "[National_Std_Rules.pdf | p.12] Every weighbridge shall be verified..."
  ]
}
```

#### `POST /api/ingest`
Upload a new PDF file to be embedded and added to the vector store. Supports dynamic document addition without restarting the server.

```bash
curl -X POST http://localhost:8000/api/ingest \
  -F "file=@new_document.pdf"
```

---

### `main.py` — FastAPI Application
- CORS configured for `http://localhost:5173` (React Vite dev server)
- Auto-generated Swagger UI at `/docs`
- Auto-generated ReDoc at `/redoc`

---

### `ingest_existing.py` — Bulk Ingestion Script
Run once to process all PDFs in `Data-docs/`:
```bash
$env:PYTHONUTF8=1; python ingest_existing.py
```

Features:
- UTF-8 forced output (Windows cp1252 safe)
- 45s delay between documents (rate limit management)
- Clear `[OK]` / `[SKIP]` / `[FAIL]` reporting
- Reports OCR-needed PDFs separately

---

## Environment Variables (`.env`)

```env
GEMINI_API_KEY="your-key-here"       # From Google AI Studio
PINECONE_API_KEY="your-key-here"     # From pinecone.io
```

**Note:** The Gemini key format `AQ.xxx` is a newer Google AI Studio key format. Standard keys start with `AIza`. Both work with the `google-generativeai` package.

---

## Available Models (Confirmed for this API key)

### Embedding Models
| Model | Dimension | Status |
|---|---|---|
| `models/gemini-embedding-2` | 3072 | ✅ **Used (best)** |
| `models/gemini-embedding-2-preview` | 3072 | ✅ Available |
| `models/gemini-embedding-001` | 768 | ✅ Available |
| `models/text-embedding-004` | 768 | ❌ Not available on this key |
| `models/embedding-001` | 768 | ❌ Deprecated |

### LLM Models (Available)
`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-3.x-*` series

---

## Document Ingestion Status

| PDF File | Chunks | Status |
|---|---|---|
| Jan Vishwas Act 2026 (JV Act for LM Act) | 3 | ✅ Ingested |
| Jan Vishwas Act 2026 (general) | 543 | ✅ Ingested |
| Jan Vishwas (Amendment) Act 2023 | 189 | ✅ Ingested |
| Notification for LM ACt enforcement | 3 | ✅ Ingested |
| 3(i) Standard Rules | 0 | ⚠️ Scanned PDF (needs OCR) |
| 3_0_0 Rules | 0 | ⚠️ Scanned PDF (needs OCR) |
| National Standards Rules 2019 | 0 | ⚠️ Scanned PDF (needs OCR) |
| Standard Rules Compressed | 0 | ⚠️ Scanned PDF (needs OCR) |

**Total vectors in Pinecone:** 738 chunks  
**Index:** `emaap-nirikshak-v2`

---

## Handling Scanned PDFs (Next Step)

The 4 scanned PDFs have no text layer. To add OCR support:

```bash
# Install OCR dependencies
pip install pytesseract pdf2image pillow
# Also install Tesseract binary: https://github.com/UB-Mannheim/tesseract/wiki

# Then replace PyPDFLoader with:
from langchain_community.document_loaders import UnstructuredPDFLoader
loader = UnstructuredPDFLoader(file_path, strategy="ocr_only")
```

---

## API Rate Limits (Free Tier)

| Limit | Value |
|---|---|
| `gemini-embedding-2` requests/min | 100 |
| Retry delay on 429 | ~36–40s |
| Inter-batch sleep | 5s |
| Inter-document sleep (ingest) | 45s |

For production: upgrade to a paid tier to remove these constraints.

---

## Running the Backend

```bash
# 1. Navigate to backend
cd rag-backend

# 2. Activate venv (if applicable)
.venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. (First time) Ingest PDFs
$env:PYTHONUTF8=1; python ingest_existing.py

# 5. Start server (hot reload)
$env:PYTHONUTF8=1; uvicorn main:app --reload --port 8000
```

**Endpoints:**
- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/
- Query: `POST http://localhost:8000/api/query`
- Ingest: `POST http://localhost:8000/api/ingest`

---

## Testing the Agent

**PowerShell:**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/query" `
  -ContentType "application/json" `
  -Body '{"question": "What are the provisions of the Jan Vishwas Act?"}'
```

**curl:**
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the re-verification period for a weighbridge?"}'
```

**Swagger UI:** Open http://localhost:8000/docs → `POST /api/query` → Try it out → Execute

---

## Engineering Principles Applied

| Principle | Implementation |
|---|---|
| **Separation of Concerns** | `config.py` (env), `rag_service.py` (logic), `routes.py` (HTTP), `main.py` (app) |
| **Production Retry** | Tenacity with exponential backoff — no manual `time.sleep` polling |
| **Lazy Initialization** | Pinecone client/index created on first use, not at module load |
| **LCEL over legacy chains** | Uses `prompt \| llm \| StrOutputParser()` — LangChain 1.x idiomatic |
| **Source Attribution** | Every answer includes page-level source citations |
| **CORS** | Configured for Vite dev server, easily extendable for production domains |
| **Pydantic validation** | All request/response models typed with Pydantic v2 |
| **Path-independent config** | `Path(__file__).resolve()` — works from any working directory |
| **Batched upserts** | 50 chunks/batch avoids Pinecone and Gemini payload limits |
| **Rate limit awareness** | Inter-doc and inter-batch delays respect free-tier quotas |
