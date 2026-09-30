# Maap Niriksak (E-Maap-Nirikshak)

## Overview
A unified online verification and digital certification platform for legal metrology instruments — built for the **Ministry of Consumer Affairs, Food & Public Distribution** as part of **Smart India Hackathon 2026** (Problem ID: 26036).

**Team:** Vajra Dominators  
**Tagline:** Register. Verify. Certify. Track. Trust.

---

## Problem
Legal Metrology instruments (weighing/measuring devices used in trade) must be periodically verified by government officers under the Legal Metrology Act, 2009. The current process is fully manual — paper applications, physical scheduling, paper certificates — causing delays, zero cross-jurisdiction visibility, and no way to verify certificate authenticity.

## Solution
A secure web + mobile platform giving every instrument a **persistent Digital Instrument Passport** with QR-authenticated tamper-proof certificates, connecting 5 stakeholder roles through guided digital workflows.

---

## Tech Stack

### Frontend (Web Portal)
- React 19 + Vite + Tailwind CSS v4
- React Router DOM v7, Zustand (state), React Hook Form + Zod (validation)
- Recharts (analytics), QRCode.react, Lucide React (icons)

### RAG Backend (AI Agent)
- Python + FastAPI + Uvicorn
- LangChain (LCEL pipeline), LangChain-Google-GenAI, LangChain-Pinecone
- Gemini 2.5 Flash (LLM), Gemini Embedding-2 (3072-dim embeddings)
- Pinecone (vector database, serverless)
- PyPDF + LangChain Community (document loading)
- Tenacity (production retry/backoff)
- Pydantic Settings (config management)

---

## Repository Structure

```
SIH26036/
├── .env                          # API keys (GEMINI_API_KEY, PINECONE_API_KEY)
├── E-Maap-Nirikshak/            # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/
│   │   └── data/
│   ├── Data-docs/               # Legal PDF documents
│   │   ├── Jan Vishwas Act 2026.pdf
│   │   ├── Jan Vishwas (Amendment) Act 2023.pdf
│   │   ├── Notification for LM Act.pdf
│   │   └── [4 scanned PDFs - need OCR]
│   └── package.json
└── rag-backend/                 # FastAPI RAG agent
    ├── main.py                  # FastAPI app entrypoint
    ├── ingest_existing.py       # Bulk PDF ingestion script
    ├── diagnose_api.py          # API diagnostics utility
    ├── requirements.txt
    └── app/
        ├── api/
        │   └── routes.py        # /api/query, /api/ingest endpoints
        ├── services/
        │   └── rag_service.py   # Core RAG pipeline (LCEL)
        └── core/
            └── config.py        # Pydantic Settings (.env loader)
```

---

## Milestones

### Milestone 1 — Foundation & RAG Agent ✅
- [x] Clone and run E-Maap-Nirikshak React frontend
- [x] Set up Python FastAPI RAG backend
- [x] Ingest legal PDFs into Pinecone vector database
- [x] RAG query API live and tested

### Milestone 2 — Frontend-Backend Integration 🔲
- [ ] Connect React chat UI to RAG API
- [ ] Field officer legal assistant chatbot component
- [ ] Handle OCR for scanned PDFs (4 remaining)

### Milestone 3 — Full Platform Polish 🔲
- [ ] GPS-verified inspection workflow
- [ ] QR certificate generation + public verify portal
- [ ] Admin dashboard with AI risk scoring
- [ ] Mobile app (Flutter) integration alignment

---

## Running the Project

### Frontend
```bash
cd E-Maap-Nirikshak
npm install
npm run dev
# → http://localhost:5173
```

### RAG Backend
```bash
cd rag-backend
# (activate .venv first)
pip install -r requirements.txt

# Ingest documents (first time only)
python ingest_existing.py

# Start API server
uvicorn main:app --reload --port 8000
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

---

## Key Decisions
- **Hybrid scheduling:** System recommends, admin confirms — automation for speed, human oversight for accountability
- **RAG over hardcoded rules:** Legal Metrology rules ingested as embeddings, not manually encoded
- **Tenacity retry:** Production-grade exponential backoff for Gemini API rate limits and SSL errors
- **Digital Instrument Passport:** One persistent ID per instrument, all history linked
