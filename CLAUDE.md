# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InsurAI is an AI-powered insurance assistant built with Next.js and React. The application helps users understand insurance products through grounded Q&A with citations, profile-based personalization, and policy comparison features. It uses a privacy-first approach with local storage for user data and implements a full RAG (Retrieval-Augmented Generation) architecture with real document processing.

## Development Commands

### Frontend (Next.js)
```bash
# Install dependencies
npm install

# Run development server with Turbopack (port 3000)
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Python Search Service
```bash
# Navigate to Python service directory
cd python-service

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies (if requirements.txt doesn't exist)
pip install fastapi uvicorn llama-index-core llama-index-embeddings-huggingface llama-index-vector-stores-faiss

# Process PDF documents to create vector database (one-time setup)
python pdf_processor.py

# Start the Python search service (port 8001)
python search_service.py
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push database schema changes
npx prisma db push

# Open Prisma Studio for database inspection
npx prisma studio
```

### Full Development Setup
Both services must run simultaneously:
```bash
# Terminal 1: Next.js frontend
npm run dev

# Terminal 2: Python search service
cd python-service && source venv/bin/activate && python search_service.py
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

- `GROQ_API_KEY`: Your Groq API key for Llama model access
- `GROQ_API_BASE`: Groq API base URL (https://api.groq.com/openai/v1)
- `GROQ_MODEL`: Model to use (llama-3.3-70b-versatile)
- `DATABASE_URL`: PostgreSQL connection string

## Architecture

**Multi-Service RAG Architecture:**

The application uses a microservices architecture where Next.js acts as an encapsulation layer for a Python-based document processing service:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Python Service │    │  Vector Database│
│   (Frontend)    │◄──►│   (FastAPI)     │◄──►│   (LlamaIndex)  │
│   Port 3000     │    │   Port 8001     │    │   ./vector_db   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Key Components:**

1. **Frontend Layer (Next.js)**: 
   - React components and pages
   - API route handlers that proxy to Python service
   - Profile storage in localStorage
   - Chat history management

2. **Document Processing Service (Python)**:
   - FastAPI service for semantic search
   - LlamaIndex for PDF processing and RAG
   - Vector database with 92 document chunks
   - Profile-based query enhancement

3. **Database Layer**:
   - PostgreSQL with Prisma ORM (products, tenants, documents metadata)
   - Vector database (document embeddings and search)
   - LocalStorage (user profile and chat history only)

**Tech Stack:**

- Frontend: Next.js 15 (App Router), React 19, TypeScript
- UI: shadcn/ui components, Tailwind CSS 4, Radix UI primitives
- Backend: FastAPI Python service + Next.js API routes
- AI: Groq SDK for Meta Llama 3.3 70B model
- Search: LlamaIndex + multilingual embeddings (sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- Database: PostgreSQL (Prisma ORM) + Vector storage
- Storage: LocalStorage (profile and chat history)

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers (proxy layer)
│   │   ├── chat/route.ts        # Main chat endpoint with Maya persona
│   │   ├── compare/route.ts     # Product comparison endpoint  
│   │   └── products/route.ts    # Product data endpoint
│   ├── chat/page.tsx            # Chat interface with Maya
│   ├── compare/page.tsx         # Product comparison page
│   └── globals.css              # Tailwind + shadcn theme variables
├── components/                   # React components
│   ├── ui/                      # shadcn/ui component library
│   ├── header.tsx              # Main navigation header
│   ├── sidebar.tsx             # Chat/compare page sidebar
│   └── profile-modal.tsx       # User profile form modal
├── lib/                         # Utility functions and shared code
│   ├── types.ts                # TypeScript interfaces (centralized)
│   ├── constants.ts            # App constants and quick templates  
│   ├── utils.ts                # Tailwind class merging utilities
│   └── db.ts                   # Database helper functions
├── python-service/              # FastAPI microservice
│   ├── search_service.py       # Main FastAPI application
│   ├── pdf_processor.py        # Document processing script
│   ├── vector_db/              # Generated vector database (exclude from git)
│   └── venv/                   # Python virtual environment (exclude from git)
├── prisma/                      # Database schema and migrations
│   └── schema.prisma           # Database schema definition
├── data/                        # Static data files
└── public/                      # Static assets and documents
```

## Key Features Implementation

**Maya AI Persona & Conversation Memory:**
- Implemented in `/app/api/chat/route.ts`
- Maintains conversation context and memory across messages
- Profile-based query enhancement for personalized responses
- Anti-hallucination validation with Indonesian language support

**RAG Document Processing:**
- Python service processes 8 official PDF documents into 92 searchable chunks
- Semantic search with multilingual embeddings
- Citation extraction and validation
- Profile-based query filtering (e.g., Jakarta + flood risk → enhanced "banjir flood" terms)

**Privacy-First Design:**
- User profiles stored only in localStorage
- Chat history stored only in localStorage  
- No sensitive data stored server-side
- Clear data functionality available

**Real-Time Communication:**
- Next.js API routes act as proxy/encapsulation layer
- Python service handles all document processing and vector search
- Streaming responses with proper error handling

## Type System

All TypeScript interfaces are centralized in `lib/types.ts` following separation of concerns:

- `UserProfile`: User data structure for personalization
- `ChatMessage`: Chat interface with citations support  
- `Product`: Database entity matching Prisma schema
- `DocumentSnippet`: Vector search result format
- `Citation`: Document reference structure

## Important Development Notes

- **Document Processing**: Run `python-service/pdf_processor.py` once to generate the vector database
- **Service Dependencies**: Both Next.js (3000) and Python service (8001) must run simultaneously
- **Profile Enhancement**: The system enhances queries based on user profile (vehicle type, location, flood risk)
- **Citation Validation**: All AI responses are validated against source documents with automatic citation extraction
- **Maya Persona**: The AI assistant has a specific Indonesian-friendly persona with conversation memory
- **Theme System**: Uses shadcn/ui theme variables in `globals.css` - avoid hardcoded colors in components
- **Vector Database**: `python-service/vector_db/` should be excluded from git (large generated files)

## API Endpoints

- `POST /api/chat`: Main chat interface with Maya AI persona
- `POST /api/compare`: Product comparison with AI analysis  
- `GET /api/products`: Retrieve insurance product data
- `GET http://localhost:8001/health`: Python service health check
- `POST http://localhost:8001/search`: Direct vector search endpoint

## Troubleshooting

**Python Service Issues:**
- Ensure virtual environment is activated: `source venv/bin/activate`
- Check vector database exists: `ls python-service/vector_db/`
- Verify all Python dependencies installed
- Check port 8001 is not in use

**Frontend Issues:**  
- Verify environment variables in `.env.local`
- Check Python service is running on port 8001
- Clear localStorage if profile/chat issues occur

**Database Issues:**
- Run `npx prisma generate` after schema changes
- Use `npx prisma studio` to inspect database state