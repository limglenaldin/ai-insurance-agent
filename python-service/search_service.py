#!/usr/bin/env python3
"""
FastAPI Search Service for Insurance Document Vector Search
Provides semantic search capabilities for the Next.js application using MongoDB Atlas
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from dotenv import load_dotenv
import pymongo

# Load environment variables
load_dotenv()

# Configuration from environment variables
MONGODB_URI = os.getenv("MONGODB_URI")  # MongoDB Atlas connection string
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "insurai")  # Database name
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "document_chunks")  # Collection name
MONGODB_INDEX_NAME = os.getenv("MONGODB_INDEX_NAME", "vector_index")  # Vector search index name
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
    description="Vector search service for insurance documents using LlamaIndex + MongoDB Atlas",
    version="2.0.0"
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
    """Load the vector index from MongoDB Atlas"""
    global search_index, embed_model

    if not MONGODB_URI:
        raise ValueError("MONGODB_URI environment variable is required")

    print("🔄 Loading embedding model...")
    embed_model = HuggingFaceEmbedding(
        model_name=EMBED_MODEL,
        trust_remote_code=True
    )

    print("🔄 Connecting to MongoDB Atlas...")
    mongo_client = pymongo.MongoClient(MONGODB_URI)

    # Create MongoDB Atlas vector store
    vector_store = MongoDBAtlasVectorSearch(
        mongodb_client=mongo_client,
        db_name=MONGODB_DATABASE,
        collection_name=MONGODB_COLLECTION,
        vector_index_name=MONGODB_INDEX_NAME,
    )

    # Create storage context with MongoDB vector store
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # Load the index from MongoDB
    print(f"🔄 Loading vector index from MongoDB ({MONGODB_DATABASE}.{MONGODB_COLLECTION})...")
    search_index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store,
        embed_model=embed_model
    )

    print("✅ Search index loaded successfully from MongoDB Atlas")

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
        "vector_store": "MongoDB Atlas",
        "database": MONGODB_DATABASE,
        "collection": MONGODB_COLLECTION
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
            similarity_top_k=request.top_k * 3  # Get more results to filter (increased to 3x)
        )
        
        nodes = retriever.retrieve(enhanced_query)

        # Convert nodes to response format with filtering
        chunks = []
        vehicle_type = request.profile.get("vehicleType") if request.profile else None

        for node in nodes:
            doc_info = extract_document_info(node)
            file_name = node.metadata.get('file_name', '').lower()

            # Filter based on vehicle type
            if vehicle_type == "car":
                # Skip motorcycle documents
                if "motolite" in file_name or "motopro" in file_name or "motor" in doc_info["doc_title"].lower():
                    print(f"  ⏭️ Skipping motorcycle document: {doc_info['doc_title']}")
                    continue
            elif vehicle_type == "motorcycle":
                # Skip car documents
                if "autocillin" in file_name or "mobil" in doc_info["doc_title"].lower():
                    print(f"  ⏭️ Skipping car document: {doc_info['doc_title']}")
                    continue

            chunk = DocumentChunk(
                content=node.text[:1000],  # Limit content length
                doc_title=doc_info["doc_title"],
                section=doc_info["section"],
                source=doc_info["source"],
                score=node.score if hasattr(node, 'score') else 0.0
            )
            chunks.append(chunk)

            # Stop once we have enough relevant chunks
            if len(chunks) >= request.top_k:
                break
        
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
    mongodb_connected = False
    try:
        if MONGODB_URI:
            client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            client.server_info()  # Will raise exception if cannot connect
            mongodb_connected = True
    except Exception:
        pass

    return {
        "status": "healthy" if search_index is not None and mongodb_connected else "unhealthy",
        "index_loaded": search_index is not None,
        "mongodb_connected": mongodb_connected,
        "embedding_model": EMBED_MODEL,
        "database": MONGODB_DATABASE,
        "collection": MONGODB_COLLECTION
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