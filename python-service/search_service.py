#!/usr/bin/env python3
"""
FastAPI Search Service for Insurance Document Vector Search
Provides semantic search capabilities for the Next.js application
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_index.core import StorageContext, load_index_from_storage
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration from environment variables
VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "./vector_db")
EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8001"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
DOCS_BASE_URL = os.getenv("DOCS_BASE_URL", "http://localhost:3000/docs")

# Pydantic models for API
class SearchRequest(BaseModel):
    query: str
    profile: Optional[Dict[str, Any]] = None
    top_k: int = 5

class DocumentChunk(BaseModel):
    content: str
    doc_title: str
    section: str
    source: str
    score: float

class SearchResponse(BaseModel):
    chunks: List[DocumentChunk]
    total_results: int

# FastAPI app setup
app = FastAPI(
    title="Insurance Document Search Service",
    description="Vector search service for insurance documents using LlamaIndex + FAISS",
    version="1.0.0"
)

# CORS middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Configurable origins from environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for loaded index
search_index = None
embed_model = None

def load_search_index():
    """Load the pre-built vector index from disk"""
    global search_index, embed_model
    
    print("🔄 Loading embedding model...")
    embed_model = HuggingFaceEmbedding(
        model_name=EMBED_MODEL,
        trust_remote_code=True
    )
    
    print("🔄 Loading vector index...")
    if not Path(VECTOR_DB_PATH).exists():
        raise Exception(f"Vector database not found at {VECTOR_DB_PATH}")
    
    # Load using simple approach
    storage_context = StorageContext.from_defaults(persist_dir=VECTOR_DB_PATH)
    search_index = load_index_from_storage(
        storage_context,
        embed_model=embed_model
    )
    
    print("✅ Search index loaded successfully")

def filter_by_profile(query: str, profile: Dict[str, Any] = None) -> str:
    """Enhance query based on user profile for better results"""
    if not profile:
        return query
    
    # Add profile context to query for better filtering
    enhanced_query = query
    
    # Vehicle type filtering
    vehicle_type = profile.get("vehicleType")
    if vehicle_type == "car":
        enhanced_query += " mobil autocillin"
    elif vehicle_type == "motorcycle":
        enhanced_query += " motor motopro"
    
    # Location-based enhancement
    city = profile.get("city")
    if city == "jakarta" and profile.get("floodRisk"):
        enhanced_query += " banjir flood"
    
    # Usage type enhancement
    usage_type = profile.get("usageType")
    if usage_type == "daily":
        enhanced_query += " harian sehari-hari"
    
    return enhanced_query

def extract_document_info(node) -> Dict[str, str]:
    """Extract document information from a node"""
    file_name = node.metadata.get('file_name', 'Unknown')
    
    # Determine document title and section based on filename
    if 'RIPLAY' in file_name:
        doc_title = f"RIPLAY {file_name.replace('RIPLAY-', '').replace('.pdf', '').replace('-', ' ')}"
        section = "Informasi Produk"
    elif 'Brosur' in file_name:
        doc_title = f"Brosur {file_name.replace('Brosur-', '').replace('.pdf', '').replace('-', ' ')}"
        section = "Brosur Produk"
    else:
        doc_title = file_name.replace('.pdf', '').replace('-', ' ')
        section = "Dokumen"
    
    # Determine section based on content
    content_lower = node.text.lower()
    if 'manfaat' in content_lower and 'tambahan' in content_lower:
        section = "Manfaat Tambahan"
    elif 'manfaat' in content_lower:
        section = "Manfaat Produk"
    elif 'premi' in content_lower or 'tarif' in content_lower:
        section = "Premi dan Tarif"
    elif 'klaim' in content_lower:
        section = "Prosedur Klaim"
    elif 'syarat' in content_lower or 'ketentuan' in content_lower:
        section = "Syarat dan Ketentuan"
    
    return {
        "doc_title": doc_title,
        "section": section,
        "source": f"{DOCS_BASE_URL}/{file_name}"
    }

@app.on_event("startup")
async def startup_event():
    """Initialize the search index on startup"""
    try:
        load_search_index()
    except Exception as e:
        print(f"❌ Failed to load search index: {e}")
        raise

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Insurance Document Search Service is running",
        "status": "healthy",
        "vector_db_path": VECTOR_DB_PATH
    }

@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    """Search for relevant document chunks based on query and profile"""
    try:
        if not search_index:
            raise HTTPException(status_code=500, detail="Search index not loaded")
        
        # Enhance query with profile information
        enhanced_query = filter_by_profile(request.query, request.profile)
        
        print(f"🔍 Searching for: '{request.query}' (enhanced: '{enhanced_query}')")
        
        # Set the global embedding model
        from llama_index.core import Settings
        Settings.embed_model = embed_model
        
        # Perform vector search  
        retriever = search_index.as_retriever(
            similarity_top_k=request.top_k * 2  # Get more results to filter
        )
        
        nodes = retriever.retrieve(enhanced_query)
        
        # Convert nodes to response format
        chunks = []
        for node in nodes:
            doc_info = extract_document_info(node)
            
            chunk = DocumentChunk(
                content=node.text[:1000],  # Limit content length
                doc_title=doc_info["doc_title"],
                section=doc_info["section"],
                source=doc_info["source"],
                score=node.score if hasattr(node, 'score') else 0.0
            )
            chunks.append(chunk)
        
        # Limit to requested number
        chunks = chunks[:request.top_k]
        
        print(f"✅ Found {len(chunks)} relevant chunks")
        
        return SearchResponse(
            chunks=chunks,
            total_results=len(nodes)
        )
        
    except Exception as e:
        print(f"❌ Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "index_loaded": search_index is not None,
        "vector_db_exists": Path(VECTOR_DB_PATH).exists(),
        "embedding_model": EMBED_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Insurance Document Search Service...")
    uvicorn.run(
        "search_service:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info"
    )