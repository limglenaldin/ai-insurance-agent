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

# Install Python dependencies
pip install -r requirements.txt

# Configure MongoDB Atlas connection in .env file
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/

# Process PDF documents to create vector database in MongoDB (one-time setup)
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

### Next.js Frontend (.env.local)
Copy `.env.example` to `.env.local` and configure:

- `GROQ_API_KEY`: Your Groq API key for Llama model access
- `GROQ_API_BASE`: Groq API base URL (https://api.groq.com/openai/v1)
- `GROQ_MODEL`: Model to use (llama-3.3-70b-versatile)
- `DATABASE_URL`: PostgreSQL connection string

### Python Service (python-service/.env)
Copy `python-service/.env.example` to `python-service/.env` and configure:

**MongoDB Atlas Configuration (Required):**
- `MONGODB_URI`: MongoDB Atlas connection string (get from Atlas dashboard)
- `MONGODB_DATABASE`: Database name (default: insurai)
- `MONGODB_COLLECTION`: Collection name (default: document_chunks)
- `MONGODB_INDEX_NAME`: Vector search index name (default: vector_index)

**Other Configuration:**
- `EMBED_MODEL`: Embedding model (default: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8001)
- `ALLOWED_ORIGINS`: CORS allowed origins
- `DOCS_BASE_URL`: Base URL for document links

### MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account** at https://www.mongodb.com/cloud/atlas
2. **Create a Cluster** (Free M0 tier is sufficient for development)
3. **Setup Database Access:**
   - Create a database user with read/write permissions
   - Note the username and password
4. **Setup Network Access:**
   - Add your IP address (or 0.0.0.0/0 for testing)
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
6. **Create Vector Search Index:**
   - Navigate to "Atlas Search" tab
   - Click "Create Search Index"
   - Choose "JSON Editor"
   - Use the following configuration:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 384,
         "similarity": "cosine"
       }
     ]
   }
   ```
   - Name it `vector_index` (or match your `MONGODB_INDEX_NAME`)
   - Select your database (`insurai`) and collection (`document_chunks`)

## Architecture

**Multi-Service RAG Architecture:**

The application uses a microservices architecture where Next.js acts as an encapsulation layer for a Python-based document processing service:

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   Next.js App   │    │  Python Service │    │  MongoDB Atlas   │
│   (Frontend)    │◄──►│   (FastAPI)     │◄──►│ Vector Database  │
│   Port 3000     │    │   Port 8001     │    │  (Cloud-hosted)  │
└─────────────────┘    └─────────────────┘    └──────────────────┘
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
   - MongoDB Atlas Vector Search for document embeddings
   - Profile-based query enhancement

3. **Database Layer**:
   - PostgreSQL with Prisma ORM (products, tenants, documents metadata)
   - MongoDB Atlas Vector Search (document embeddings and semantic search)
   - LocalStorage (user profile and chat history only)

**Tech Stack:**

- Frontend: Next.js 15 (App Router), React 19, TypeScript
- UI: shadcn/ui components, Tailwind CSS 4, Radix UI primitives
- Backend: FastAPI Python service + Next.js API routes
- AI: Groq SDK for Meta Llama 3.3 70B model
- Search: LlamaIndex + MongoDB Atlas Vector Search + multilingual embeddings (sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- Database: PostgreSQL (Prisma ORM) + MongoDB Atlas (Vector Search)
- Storage: LocalStorage (profile and chat history)

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers (proxy layer)
│   │   ├── chat/route.ts        # Main chat endpoint with Miria persona
│   │   ├── compare/route.ts     # Product comparison endpoint  
│   │   └── products/route.ts    # Product data endpoint
│   ├── chat/page.tsx            # Chat interface with Miria
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
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variables template
│   └── venv/                   # Python virtual environment (exclude from git)
├── prisma/                      # Database schema and migrations
│   └── schema.prisma           # Database schema definition
├── data/                        # Static data files
└── public/                      # Static assets and documents
```

## Key Features Implementation

**Miria AI Persona & Conversation Memory:**
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

- **MongoDB Atlas Required**: The application requires MongoDB Atlas for vector search. Set up your cluster and configure the vector search index before running the service.
- **Document Processing**: Run `python-service/pdf_processor.py` once to upload documents to MongoDB Atlas vector database
- **Vector Search Index**: Ensure the MongoDB Atlas vector search index is created with 384 dimensions (matching the embedding model)
- **Service Dependencies**: Both Next.js (3000) and Python service (8001) must run simultaneously
- **Profile Enhancement**: The system enhances queries based on user profile (vehicle type, location, flood risk)
- **Citation Validation**: All AI responses are validated against source documents with automatic citation extraction
- **Miria Persona**: The AI assistant has a specific Indonesian-friendly persona with conversation memory
- **Theme System**: Uses shadcn/ui theme variables in `globals.css` - avoid hardcoded colors in components
- **Production Deployment**: MongoDB Atlas works seamlessly on VPS/cloud environments, unlike FAISS which can have dependency issues

## API Endpoints

- `POST /api/chat`: Main chat interface with Miria AI persona
- `POST /api/compare`: Product comparison with AI analysis  
- `GET /api/products`: Retrieve insurance product data
- `GET http://localhost:8001/health`: Python service health check
- `POST http://localhost:8001/search`: Direct vector search endpoint

## Troubleshooting

**Python Service Issues:**
- Ensure virtual environment is activated: `source venv/bin/activate`
- Verify `MONGODB_URI` is set correctly in `python-service/.env`
- Check MongoDB Atlas cluster is running and accessible
- Test connection: `python -c "import pymongo; pymongo.MongoClient('YOUR_URI').server_info()"`
- Verify all Python dependencies installed: `pip install -r requirements.txt`
- Check port 8001 is not in use
- Review Python service logs for connection errors

**MongoDB Atlas Issues:**
- Verify network access settings allow your IP address
- Confirm database user has read/write permissions
- Check vector search index exists and is named correctly (`vector_index`)
- Verify index configuration has 384 dimensions for the embedding model
- Use MongoDB Atlas UI to inspect the `document_chunks` collection
- Ensure documents were uploaded by running `pdf_processor.py`

**Frontend Issues:**
- Verify environment variables in `.env.local`
- Check Python service is running on port 8001: `curl http://localhost:8001/health`
- Clear localStorage if profile/chat issues occur

**Database Issues:**
- Run `npx prisma generate` after schema changes
- Use `npx prisma studio` to inspect PostgreSQL database state

**VPS Deployment Issues:**
- MongoDB Atlas removes the need for local FAISS dependencies
- Ensure VPS can connect to MongoDB Atlas (check firewall rules)
- Add VPS IP address to MongoDB Atlas network access list
- Use environment variables for all configuration (never hardcode credentials)