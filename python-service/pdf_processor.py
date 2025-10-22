#!/usr/bin/env python3
"""
PDF Processing Script for Insurance Documents
Extracts text from PDFs and creates MongoDB Atlas vector database
"""

import os
import re
from pathlib import Path
from llama_index.core import VectorStoreIndex, StorageContext, Document
from llama_index.core.node_parser import SentenceSplitter
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from dotenv import load_dotenv
import pymongo
import pdfplumber

# Load environment variables
load_dotenv()

# Configuration from environment variables
DOCS_PATH = Path(os.getenv("DOCS_PATH", "../public/docs"))  # Path to PDF documents
MONGODB_URI = os.getenv("MONGODB_URI")  # MongoDB Atlas connection string
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "insurai")  # Database name
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "document_chunks")  # Collection name
MONGODB_INDEX_NAME = os.getenv("MONGODB_INDEX_NAME", "vector_index")  # Vector search index name
EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")  # Multilingual model
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "512"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))

def clean_text(text: str) -> str:
    """
    Clean extracted PDF text by normalizing whitespace and removing artifacts.
    """
    # Normalize line breaks
    cleaned = re.sub(r'\r\n', '\n', text)

    # Remove excessive whitespace while preserving paragraph structure
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)

    # Normalize multiple newlines to max 2 (paragraph break)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

    # Remove spaces before punctuation
    cleaned = re.sub(r'\s+([.,;:!?)])', r'\1', cleaned)

    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in cleaned.split('\n')]
    cleaned = '\n'.join(lines)

    # Trim leading/trailing whitespace
    cleaned = cleaned.strip()

    return cleaned

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
    """Load PDF documents from the docs directory using pdfplumber for better extraction"""
    print(f"🔄 Loading documents from {DOCS_PATH}...")

    if not DOCS_PATH.exists():
        print(f"❌ Documents path does not exist: {DOCS_PATH}")
        return None

    # Get all PDF files
    pdf_files = list(DOCS_PATH.glob("*.pdf"))
    if not pdf_files:
        print(f"❌ No PDF files found in {DOCS_PATH}")
        return None

    print(f"Found {len(pdf_files)} PDF files")

    documents = []

    for pdf_path in pdf_files:
        print(f"  📄 Processing: {pdf_path.name}")

        try:
            # Use pdfplumber for better text extraction
            with pdfplumber.open(pdf_path) as pdf:
                full_text = ""
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract text with layout preservation
                    page_text = page.extract_text(layout=False, x_tolerance=2, y_tolerance=2)
                    if page_text:
                        full_text += page_text + "\n\n"

                if not full_text.strip():
                    print(f"     ⚠️ No text extracted from {pdf_path.name}")
                    continue

                # Clean the extracted text
                cleaned_text = clean_text(full_text)

                # Create document with metadata
                doc = Document(
                    text=cleaned_text,
                    metadata={
                        "file_name": pdf_path.name,
                        "file_path": str(pdf_path),
                        "pages": len(pdf.pages)
                    }
                )
                documents.append(doc)

                print(f"     ✅ Extracted {len(cleaned_text)} chars from {len(pdf.pages)} pages")
                print(f"     Sample: {cleaned_text[:80]}...")

        except Exception as e:
            print(f"     ❌ Error processing {pdf_path.name}: {e}")
            continue

    print(f"✅ Successfully loaded {len(documents)} documents")
    return documents

def create_vector_index(documents, embed_model):
    """Create MongoDB Atlas vector index from documents"""
    print("🔄 Creating MongoDB Atlas vector index...")

    if not MONGODB_URI:
        raise ValueError("MONGODB_URI environment variable is required")

    # Setup text splitter for better chunking
    text_splitter = SentenceSplitter(
        chunk_size=CHUNK_SIZE,    # Configurable chunk size
        chunk_overlap=CHUNK_OVERLAP   # Configurable overlap to maintain context
    )

    # Connect to MongoDB
    print(f"🔄 Connecting to MongoDB Atlas...")
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

    # Build the index
    print(f"🔄 Building index and storing in MongoDB ({MONGODB_DATABASE}.{MONGODB_COLLECTION})...")
    index = VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        embed_model=embed_model,
        node_parser=text_splitter,
        show_progress=True
    )

    print("✅ Vector index created and stored in MongoDB Atlas")
    return index

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

        # Step 3: Create vector index and store in MongoDB
        index = create_vector_index(documents, embed_model)

        print("🎉 PDF processing completed successfully!")
        print(f"📁 Vector database stored in MongoDB: {MONGODB_DATABASE}.{MONGODB_COLLECTION}")
        print(f"📊 Total documents processed: {len(documents)}")

    except Exception as e:
        print(f"❌ Error during processing: {e}")
        raise

if __name__ == "__main__":
    main()