from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import os
import shutil
from app.services.rag_service import get_answer, process_and_ingest_document

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: list[str]

@router.post("/query", response_model=QueryResponse)
async def query_agent(request: QueryRequest):
    try:
        answer, sources = get_answer(request.question)
        return QueryResponse(answer=answer, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        chunks = process_and_ingest_document(temp_file_path)
        return {"message": f"Successfully ingested {file.filename}", "chunks": chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
