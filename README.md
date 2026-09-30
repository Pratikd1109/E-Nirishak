---
title: E-Maap Nirikshak
emoji: ⚖️
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# E-Maap Nirikshak — National Legal Metrology Verification Portal & AI Assistant

[![Smart India Hackathon](https://img.shields.io/badge/SIH-2024%2F2026-blue.svg)](https://sih.gov.in)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)](https://react.dev)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4.svg)](https://deepmind.google/technologies/gemini/)
[![Pinecone](https://img.shields.io/badge/VectorDB-Pinecone-000000.svg)](https://www.pinecone.io/)

> **Ministry of Consumer Affairs, Food & Public Distribution, Government of India**  
> Problem Statement: Digital transformation of Legal Metrology verification, inspection, certification, and multilingual public compliance assistance.

---

## 🌟 Key Features

1. **Role-Based Portals**:
   - **Instrument Owner**: Register weighing & measuring instruments, schedule verification, download digital certificates, expiry alerts.
   - **Legal Metrology Officer (LMO)**: Conduct on-site field inspections, digital stamping, verification checklist, issue certificates.
   - **Govt. Approved Test Centre (GATC)**: Verification batch processing, test reports, accuracy compliance testing.
   - **Administrator**: State-wide jurisdiction management, enforcement analytics, certificate registry, compliance reporting.
   - **Public Verification**: QR-code / ID-based instant authenticity check of certificates for consumers.

2. **Niriksak AI (Multilingual RAG & Multimodal Vision Chatbot)**:
   - **Multimodal Document & Label Inspection**: Upload photos of weighing scales, verification stamps, or packaged commodity labels. Niriksak AI analyzes mandatory declarations, net quantity, MRP, and validity under the **Legal Metrology Act, 2009** and **Packaged Commodities Rules, 2011**.
   - **22 Scheduled Indian Languages**: Full native script support and bidirectional dashboard synchronization (English, Hindi, Marathi, Bengali, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Urdu, and more).
   - **Ultra-Premium Glassmorphism UI**: Live status badge, copy citations, interactive quick chips, and smooth lightboxes.

3. **Hybrid RAG Backend**:
   - Ingests legal metrology acts, rules, and gazette notifications into **Pinecone Serverless Vector Store** using high-dimensional embeddings.
   - Dual-model query pipeline: **Sarvam AI (Sarvam-105B)** for specialized Indian languages + **Google Gemini 2.5 Flash** for rapid multimodal inference.

---

## 🚀 Deployment Options

### Option 1: Hugging Face Spaces (All-in-One Full-Stack)
1. Create a new Space on [Hugging Face Spaces](https://huggingface.co/new-space).
2. Choose **Docker** as the Space SDK.
3. Push this repository to your Space:
   ```bash
   git remote add space https://huggingface.co/spaces/<your-username>/e-maap-nirikshak
   git push space main
   ```
4. In your Space **Settings → Variables and Secrets**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `PINECONE_API_KEY`: Your Pinecone API key
   - `SARVAM_API_KEY`: Your Sarvam AI API key

---

### Option 2: Vercel (Frontend) + Render / Hugging Face (Backend)
1. **Frontend (Vercel)**:
   - Import `E-Maap-Nirikshak` directory on [Vercel](https://vercel.com).
   - Set Environment Variable: `VITE_GEMINI_API_KEY`.
   - Build Command: `npm run build` | Output Directory: `dist`.
   - Instant 0-second cold starts with global edge CDN.
2. **Backend (Render / HF)**:
   - Deploy `rag-backend` as a Python Web Service (`uvicorn main:app --host 0.0.0.0 --port $PORT`).

---

## 🛠️ Local Development

### 1. Frontend
```bash
cd E-Maap-Nirikshak
npm install
npm run dev
# Running at http://localhost:5173
```

### 2. RAG Backend
```bash
cd rag-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Running at http://localhost:8000
```
