#!/bin/bash
set -e

echo "🔍 Checking MongoDB Atlas connection..."

# Check if MONGODB_URI is set
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI environment variable is not set"
    echo "Please configure MongoDB Atlas connection string"
    exit 1
fi

# Test MongoDB connection using Python
echo "🔄 Testing MongoDB Atlas connectivity..."
python -c "
import pymongo
import sys
import os

try:
    client = pymongo.MongoClient(os.getenv('MONGODB_URI'), serverSelectionTimeoutMS=10000)
    client.server_info()
    print('✅ MongoDB Atlas connection successful!')

    # Check if collection exists and has documents
    db = client[os.getenv('MONGODB_DATABASE', 'insurai')]
    collection = db[os.getenv('MONGODB_COLLECTION', 'document_chunks')]
    count = collection.count_documents({})

    if count > 0:
        print(f'✅ Found {count} document chunks in MongoDB')
    else:
        print('⚠️  Warning: No document chunks found in MongoDB')
        print('You may need to run pdf_processor.py to upload documents')

    sys.exit(0)
except Exception as e:
    print(f'❌ MongoDB connection failed: {str(e)}')
    print('Please check:')
    print('  1. MONGODB_URI is correct')
    print('  2. MongoDB Atlas cluster is running')
    print('  3. Network access is configured for your IP')
    print('  4. Database user has proper permissions')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to MongoDB Atlas"
    exit 1
fi

echo "🚀 Starting search service..."
# Start the search service
exec python search_service.py
