# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY search_service.py .
COPY pdf_processor.py .
COPY docker-entrypoint.sh .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8001
ENV DOCS_PATH=/app/docs

# MongoDB Atlas configuration (override via docker-compose or runtime)
ENV MONGODB_DATABASE=insurai
ENV MONGODB_COLLECTION=document_chunks
ENV MONGODB_INDEX_NAME=vector_index

# Expose port
EXPOSE 8001

# Health check (allows time for MongoDB connection and model loading)
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Use entrypoint script to check MongoDB connection and start service
ENTRYPOINT ["./docker-entrypoint.sh"]
