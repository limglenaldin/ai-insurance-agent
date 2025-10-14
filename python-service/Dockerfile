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

# Create directories for vector database and documents
RUN mkdir -p ./vector_db

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8001
ENV VECTOR_DB_PATH=/app/vector_db
ENV DOCS_PATH=/app/docs

# Expose port
EXPOSE 8001

# Health check (longer start period for vector database initialization)
HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Use entrypoint script to initialize vector database if needed
# The script will automatically create the vector database on first run
ENTRYPOINT ["./docker-entrypoint.sh"]
