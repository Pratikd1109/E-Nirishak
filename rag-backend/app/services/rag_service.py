import os
import time
import logging
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_sarvam import ChatSarvam
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception,
    retry_if_exception_type,
    RetryError,
)
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model initialization
# ---------------------------------------------------------------------------
# Strategy: Try Sarvam AI first (optimized for Indian languages),
# fall back to Gemini if Sarvam returns empty responses
import warnings
from langchain_sarvam import ChatSarvam

# Primary LLM: Sarvam-105B (Indian language optimized)
llm_sarvam = ChatSarvam(
    model="sarvam-105b",
    api_key=settings.SARVAM_API_KEY,
    max_tokens=2048,  # Generous token limit to avoid truncation
    temperature=0.2,  # Low temperature for factual answers
)

# Fallback LLM: Google Gemini 2.5 Flash
llm_gemini = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.2,
)

# Active LLM (will be set based on testing)
llm = llm_sarvam  # Try Sarvam first

# Embeddings: Keep Gemini embedding-2 (3072-dim) since Sarvam has no
# embedding model yet. Embeddings are only used at query time (cheap).
# All 738 chunks already ingested with this model — no re-ingestion needed.
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    google_api_key=settings.GEMINI_API_KEY,
)

# ---------------------------------------------------------------------------
# Pinecone initialization
# ---------------------------------------------------------------------------
_pc = None


def _get_pinecone_client():
    global _pc
    if _pc is None:
        if not settings.PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY is not set in the environment.")
        _pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    return _pc


def get_vectorstore():
    pc = _get_pinecone_client()
    index_name = settings.PINECONE_INDEX_NAME

    existing_indexes = [idx["name"] for idx in pc.list_indexes()]
    if index_name not in existing_indexes:
        pc.create_index(
            name=index_name,
            dimension=3072,  # gemini-embedding-2 output dimension
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    index = pc.Index(index_name)
    return PineconeVectorStore(index=index, embedding=embeddings)


# ---------------------------------------------------------------------------
# Document ingestion (with rate-limit retry)
# ---------------------------------------------------------------------------
_BATCH_SIZE = 50       # chunks per upsert call
_INTER_BATCH_DELAY = 5  # seconds between batches to stay under 100 req/min


def _is_rate_limit_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return "resource_exhausted" in msg or "429" in msg or "quota" in msg


@retry(
    retry=retry_if_exception(_is_rate_limit_error),
    wait=wait_exponential(multiplier=1, min=40, max=120),
    stop=stop_after_attempt(5),
    reraise=True,
)
def _upsert_batch(vectorstore: PineconeVectorStore, batch: list) -> None:
    """Upsert a single batch with automatic retry on 429."""
    vectorstore.add_documents(documents=batch)


def process_and_ingest_document(file_path: str) -> int:
    """Load a PDF, chunk it, embed + store in Pinecone with rate-limit handling."""
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    splits = splitter.split_documents(docs)

    if not splits:
        return 0

    vectorstore = get_vectorstore()

    # Upsert in small batches to respect rate limits
    total = 0
    for i in range(0, len(splits), _BATCH_SIZE):
        batch = splits[i : i + _BATCH_SIZE]
        logger.info(f"  Upserting batch {i // _BATCH_SIZE + 1} ({len(batch)} chunks)...")
        _upsert_batch(vectorstore, batch)
        total += len(batch)
        if i + _BATCH_SIZE < len(splits):
            time.sleep(_INTER_BATCH_DELAY)

    return total


# ---------------------------------------------------------------------------
# RAG query pipeline (LCEL - no deprecated langchain.chains)
# ---------------------------------------------------------------------------
_RAG_SYSTEM_PROMPT = """\
You are an expert assistant for the E-Maap-Nirikshak engineering standards project.
Use ONLY the following retrieved context to answer the user question.
If the answer is not in the context, say "I don't have enough information in the \
provided documents to answer that question."
Be concise, accurate, and cite the source document when possible.

Context:
{context}
"""


def _format_docs(docs) -> str:
    return "\n\n---\n\n".join(
        f"[Source: {doc.metadata.get('source', 'unknown')}, "
        f"Page: {doc.metadata.get('page', '?')}]\n{doc.page_content}"
        for doc in docs
    )


def _is_transient_error(exc: Exception) -> bool:
    """Catches SSL drops, rate limits, and temporary network errors."""
    msg = str(exc).lower()
    return any(keyword in msg for keyword in [
        "resource_exhausted", "429", "quota",
        "ssl", "eof", "connection", "remote end closed",
        "broken pipe", "timeout",
    ])


@retry(
    retry=retry_if_exception(_is_transient_error),
    wait=wait_exponential(multiplier=1, min=3, max=30),
    stop=stop_after_attempt(4),
    reraise=True,
)
def _retrieve_docs(retriever, question: str):
    """Embed the query and retrieve relevant chunks, with retry on transient errors."""
    return retriever.invoke(question)


@retry(
    retry=retry_if_exception(_is_transient_error),
    wait=wait_exponential(multiplier=1, min=3, max=30),
    stop=stop_after_attempt(4),
    reraise=True,
)
def _generate_answer(chain, context: str, question: str) -> str:
    """Run the LLM chain with retry on transient errors."""
    return chain.invoke({"context": context, "question": question})


def _generate_answer_with_fallback(sarvam_chain, gemini_chain, context: str, question: str) -> tuple[str, str]:
    """
    Try Sarvam first, fall back to Gemini if empty response.
    Returns: (answer, model_used)
    """
    # Try Sarvam first
    try:
        logger.info("Attempting answer generation with Sarvam-105B...")
        answer = _generate_answer(sarvam_chain, context, question)
        
        # Check if answer is empty or too short
        if answer and len(answer.strip()) > 10:  # At least 10 chars
            logger.info(f"✓ Sarvam returned answer ({len(answer)} chars)")
            return answer, "sarvam-105b"
        else:
            logger.warning(f"⚠️  Sarvam returned empty/short answer: '{answer}'")
            logger.info("Falling back to Gemini...")
            
    except Exception as e:
        logger.error(f"✗ Sarvam error: {type(e).__name__}: {e}")
        logger.info("Falling back to Gemini...")
    
    # Fallback to Gemini
    try:
        answer = _generate_answer(gemini_chain, context, question)
        logger.info(f"✓ Gemini returned answer ({len(answer)} chars)")
        return answer, "gemini-2.5-flash"
    except Exception as e:
        logger.error(f"✗ Gemini also failed: {type(e).__name__}: {e}")
        raise


def get_answer(question: str):
    """Run the RAG pipeline and return (answer, list_of_source_excerpts)."""
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", _RAG_SYSTEM_PROMPT),
            ("human", "{question}"),
        ]
    )

    # Retrieve docs with retry for SSL/network errors
    retrieved_docs = _retrieve_docs(retriever, question)

    # Create chains for both models
    sarvam_chain = prompt | llm_sarvam | StrOutputParser()
    gemini_chain = prompt | llm_gemini | StrOutputParser()

    # Generate answer with fallback
    formatted_context = _format_docs(retrieved_docs)
    answer, model_used = _generate_answer_with_fallback(
        sarvam_chain, gemini_chain, formatted_context, question
    )
    
    logger.info(f"Answer generated using: {model_used}")

    sources = [
        f"[{doc.metadata.get('source', 'unknown')} | p.{doc.metadata.get('page', '?')}] "
        f"{doc.page_content[:200]}..."
        for doc in retrieved_docs
    ]
    return answer, sources

