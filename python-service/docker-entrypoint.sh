#!/bin/bash
set -e

echo "🔍 Checking vector database status..."

# Check if vector database exists
if [ ! -f "/app/vector_db/docstore.json" ]; then
    echo "⚠️  Vector database not found. Initializing..."
    echo "📄 Processing PDF documents..."

    # Run PDF processor to create vector database
    python pdf_processor.py

    if [ $? -eq 0 ]; then
        echo "✅ Vector database initialized successfully!"
    else
        echo "❌ Failed to initialize vector database"
        exit 1
    fi
else
    echo "✅ Vector database already exists, skipping initialization"
fi

echo "🚀 Starting search service..."
# Start the search service
exec python search_service.py
