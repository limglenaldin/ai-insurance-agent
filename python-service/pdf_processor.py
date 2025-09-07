#!/usr/bin/env python3
"""
PDF Processing Script for Insurance Documents
Extracts text from PDFs and creates FAISS vector database
"""

import os
from pathlib import Path
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext
from llama_index.core.node_parser import SentenceSplitter
from llama_index.vector_stores.faiss import FaissVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import faiss

# Configuration
DOCS_PATH = Path("../public/docs")  # Path to PDF documents
VECTOR_DB_PATH = "./vector_db"      # Where to save FAISS database
EMBED_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"  # Multilingual model

def setup_embedding_model():
    """Setup multilingual embedding model for Indonesian text"""
    print("🔄 Loading embedding model...")
    embed_model = HuggingFaceEmbedding(
        model_name=EMBED_MODEL,
        trust_remote_code=True
    )
    print("✅ Embedding model loaded")
    return embed_model

def load_documents():
    """Load PDF documents from the docs directory"""
    print(f"🔄 Loading documents from {DOCS_PATH}...")
    
    if not DOCS_PATH.exists():
        print(f"❌ Documents path does not exist: {DOCS_PATH}")
        return None
    
    # Load all PDF files (SimpleDirectoryReader handles PDFs automatically)
    documents = SimpleDirectoryReader(
        input_dir=str(DOCS_PATH),
        recursive=False,
        required_exts=[".pdf"]  # Only load PDF files
    ).load_data()
    
    print(f"✅ Loaded {len(documents)} documents")
    
    # Print document info
    for i, doc in enumerate(documents):
        print(f"  📄 Document {i+1}: {doc.metadata.get('file_name', 'Unknown')}")
        print(f"     Text length: {len(doc.text)} characters")
    
    return documents

def create_vector_index(documents, embed_model):
    """Create simple vector index from documents"""
    print("🔄 Creating vector index...")
    
    # Setup text splitter for better chunking
    text_splitter = SentenceSplitter(
        chunk_size=512,    # Smaller chunks for better retrieval
        chunk_overlap=50   # Some overlap to maintain context
    )
    
    # Use default simple vector store (more reliable than FAISS for now)
    storage_context = StorageContext.from_defaults()
    
    # Build the index
    index = VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        embed_model=embed_model,
        node_parser=text_splitter,
        show_progress=True
    )
    
    print("✅ Vector index created")
    return index

def save_vector_database(index):
    """Save the vector database to disk"""
    print(f"🔄 Saving vector database to {VECTOR_DB_PATH}...")
    
    # Create directory if it doesn't exist
    Path(VECTOR_DB_PATH).mkdir(exist_ok=True)
    
    # Save the index (this includes the vector store)
    index.storage_context.persist(persist_dir=VECTOR_DB_PATH)
    
    print("✅ Vector database saved")

def main():
    """Main processing function"""
    print("🚀 Starting PDF processing...")
    
    try:
        # Step 1: Setup embedding model
        embed_model = setup_embedding_model()
        
        # Step 2: Load documents
        documents = load_documents()
        if not documents:
            return
        
        # Step 3: Create vector index
        index = create_vector_index(documents, embed_model)
        
        # Step 4: Save to disk
        save_vector_database(index)
        
        print("🎉 PDF processing completed successfully!")
        print(f"📁 Vector database saved to: {VECTOR_DB_PATH}")
        
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        raise

if __name__ == "__main__":
    main()