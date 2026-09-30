# Roadmap — Maap Niriksak (SIH 2026)

## Milestone 1 — Foundation & RAG Agent ✅ COMPLETE

### Phase 1 · Project Setup & Frontend Running ✅
- Clone E-Maap-Nirikshak React repo
- Install dependencies, fix Vite file watcher (EBUSY crdownload issue)
- Dev server running at http://localhost:5173

### Phase 2 · RAG Backend Architecture ✅
- FastAPI backend scaffolded (`main.py`, `routes.py`, `rag_service.py`, `config.py`)
- Pydantic Settings with path-independent `.env` loading
- CORS configured for React dev server

### Phase 3 · Document Ingestion Pipeline ✅
- 8 PDFs discovered in `Data-docs/`
- Fixed LangChain 1.x import structure (LCEL over deprecated `langchain.chains`)
- Fixed Gemini embedding model (`gemini-embedding-2`, 3072-dim)
- Fixed Pinecone index dimension (768 → 3072, new index `emaap-nirikshak-v2`)
- Production tenacity retry for 429 rate limits (40s–120s backoff)
- 738 chunks ingested: 4 text PDFs ✅, 4 scanned PDFs ⚠️ (need OCR)

### Phase 4 · Query Pipeline & API ✅
- LCEL RAG chain: retriever → prompt → gemini-2.5-flash → StrOutputParser
- SSL/network error retry on both retrieval and generation
- Swagger UI working at http://localhost:8000/docs
- PowerShell + curl tested successfully

---

## Milestone 2 — Frontend Integration 🔲

### Phase 5 · RAG Chat UI in React 🔲
- [ ] Legal Assistant chatbot component in the React app
- [ ] Hook up `POST /api/query` from frontend
- [ ] Show source citations in the chat UI
- [ ] Loading states and error handling

### Phase 6 · OCR for Scanned PDFs 🔲
- [ ] Install `pytesseract` + `pdf2image`
- [ ] Ingest 4 remaining scanned PDFs (Standard Rules, National Std Rules)
- [ ] Re-ingest with OCR pipeline → significantly more legal rule chunks

### Phase 7 · Auto-ingest on File Drop 🔲
- [ ] Watch `Data-docs/` for new PDFs
- [ ] Auto-trigger `/api/ingest` on new file detection

---

## Milestone 3 — Platform Polish & Demo Prep 🔲

### Phase 8 · Core Workflow Completion 🔲
- [ ] GPS-verified inspection workflow (frontend)
- [ ] QR certificate generation + public verify portal
- [ ] Admin dashboard with allocation suggestion engine

### Phase 9 · AI Risk Scoring 🔲
- [ ] Rule-based risk scoring (repeat failures, expired clustering)
- [ ] RAG-powered auto-validation: does checklist match Rules for instrument type?

### Phase 10 · Demo Hardening 🔲
- [ ] End-to-end demo path working: Register → Apply → Allocate → Inspect → Certify → QR Verify
- [ ] Mobile app (Flutter) alignment on Instrument ID + GPS fields
- [ ] Presentation rehearsal
