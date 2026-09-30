# ── Stage 1: Build the React Frontend ──
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY E-Maap-Nirikshak/package*.json ./
RUN npm install --legacy-peer-deps

COPY E-Maap-Nirikshak/ ./
RUN npm run build

# ── Stage 2: Python FastAPI + RAG Backend ──
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY rag-backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY rag-backend/ ./

# Copy built frontend bundle from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend_dist

# Configure user for Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
RUN chown -R user:user /app
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

# Hugging Face Spaces exposes port 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
