# InsurAI

**Your AI-Powered Insurance Assistant**

InsurAI is an AI-powered insurance assistant that makes insurance simple, transparent, and accessible for everyone. Built with Meta Llama 3.3 70B and advanced RAG architecture, it features **Miria** - a friendly Indonesian AI persona that delivers document-grounded Q&A, personalized recommendations, and product comparisons. The solution acts as a regulation-safe, unbiased digital insurance consultant that reduces company support costs while enhancing customer experience.

> **Meet Miria**: Your friendly Indonesian AI insurance consultant who provides accurate, citation-backed answers with conversation memory and personalized recommendations based on official RIPLAY documents.

---

## 🚀 Features

### 🤖 **Miria AI Assistant**

- **Indonesian-Friendly Persona**: Chat with Miria, your dedicated insurance consultant with consistent informal language style
- **Conversation Memory**: Maintains context across messages and sessions for natural dialogue
- **Personalized Responses**: Tailored advice based on your profile and previous conversations
- **Anti-Hallucination Validation**: All responses require citations from official documents

### 📚 **Grounded Q&A with Citations**

- Ask any question about insurance products with semantic search capabilities
- Answers always grounded in official RIPLAY documents with proper citations
- Production-tested with real insurance PDFs processed into 92 searchable chunks
- Anti-hallucination validation ensures accurate responses

### 👤 **Profile-Based Personalization**

- Profile setup with vehicle type, location, and flood risk preferences
- Stored locally in the browser (localStorage) for privacy-first approach
- Query enhancement: Jakarta users with flood risk get enhanced "banjir flood" terms
- Profile-aware responses and personalized recommendations

### ⚖️ **Policy Product Comparison**

- AI-powered side-by-side comparison between insurance products
- Detailed analysis including features, suitability, and limitations
- Transparent document-grounded comparisons with clickable citations
- Personalized recommendations based on user profile

### 🔒 **Privacy-First Design**

- Zero server-side storage of personal data - all user profiles and chat history stored only in browser localStorage
- GDPR compliance with complete user data control
- Clear chat anytime with a single click
- Profile data never leaves your device

### 🏗️ **Production-Ready Architecture**

- Complete document processing pipeline using LlamaIndex with FAISS vector database
- FastAPI Python microservice for semantic search (port 8001)
- Next.js frontend with API encapsulation layer (port 3000)
- Multilingual embeddings for Indonesian and English content
- PostgreSQL database with Prisma ORM for structured data
- Real-time communication between microservices with proper error handling

---

## 📦 Tech Stack

**Frontend:**

- Next.js 15 with App Router (TypeScript)
- React 19
- Tailwind CSS 4 & shadcn/ui components

**Backend:**

- Next.js API Routes (encapsulation layer)
- FastAPI Python microservice for document search
- Prisma ORM with PostgreSQL
- LlamaIndex for document processing and RAG

**AI & Search:**

- Groq API with Meta Llama 3.3 70B
- LlamaIndex vector storage and retrieval
- Multilingual embeddings (sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- Semantic search with profile-based query enhancement

**Storage:**

- PostgreSQL database (products, documents, tenants)
- FAISS vector database for document embeddings
- LocalStorage (profile + chat history only for privacy-first approach)

---

## 🛠️ Getting Started

### 1. Prerequisites

- **Node.js 18+** for the frontend
- **Python 3.8+** for the document processing service
- **Package manager**: npm, yarn, or pnpm
- **Groq API key** for Meta Llama access ([get one here](https://console.groq.com))
- **PostgreSQL database** (local installation or Supabase/Neon cloud)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/ai-insurance-agent.git
cd ai-insurance-agent
```

### 3. Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Copy environment file and configure
cp .env.example .env.local
```

### 4. Python Service Setup

```bash
# Navigate to Python service
cd python-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install fastapi uvicorn llama-index-core llama-index-embeddings-huggingface llama-index-vector-stores-faiss

# Process PDF documents to create vector database
python pdf_processor.py

# Start the Python search service (port 8001)
python search_service.py
```

### 5. Environment Variables

Create `.env.local` in the root directory:

```bash
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_API_BASE=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile

# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 6. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed
```

### 7. Run Both Services

**Both services must run simultaneously for full functionality:**

```bash
# Terminal 1: Start Next.js frontend (port 3000)
npm run dev

# Terminal 2: Start Python search service (port 8001)
cd python-service && source venv/bin/activate && python search_service.py
```

> ⚠️ **Important**: The Next.js frontend depends on the Python service running on port 8001. Make sure both are running before testing the application.

### 8. Access the Application

- **Frontend:** http://localhost:3000
- **Python API:** http://localhost:8001
- **API Health Check:** http://localhost:8001/health

---

## 🏗️ Architecture

The application uses a **RAG (Retrieval-Augmented Generation)** architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Python Service │    │  Vector Database│
│   (Frontend)    │◄──►│   (FastAPI)     │◄──►│   (LlamaIndex)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                       │                       │
│ • React Components    │ • PDF Processing      │ • 92 Doc Chunks
│ • Chat Interface      │ • Semantic Search     │ • Embeddings
│ • Profile Storage     │ • Query Enhancement   │ • Vector Retrieval
│ • API Encapsulation   │ • Citation Extraction │ • Similarity Search
└─────────────────────  └─────────────────────  └─────────────────
```

### Key Components:

1. **Frontend (Next.js)**: User interface and API route handlers
2. **Python Service**: FastAPI microservice for document processing and search
3. **Vector Database**: LlamaIndex-based storage for semantic document search
4. **Database**: PostgreSQL for products, tenants, and document metadata

## 📊 Real Document Processing

The system has been **production-tested with real insurance PDF documents** processed into **92 searchable chunks**:

- **RIPLAY Documents**: Official product information sheets
- **Brochures**: Marketing materials with comprehensive coverage details
- **Policy Documents**: Legal terms and conditions from actual insurance providers

**Processing Pipeline:**

1. Real PDF text extraction using LlamaIndex
2. Document chunking with 512-character segments for optimal retrieval
3. Multilingual embedding generation for Indonesian and English content
4. Vector storage for lightning-fast semantic search

## 🔍 Advanced Search Features

- **Semantic Search**: Understands context and intent beyond keywords
- **Profile Enhancement**: Location-aware query enhancement (e.g., Jakarta + flood risk → "banjir flood" terms)
- **Citation Tracking**: All responses include precise source document references
- **Multilingual Support**: Processes Indonesian and English content seamlessly
- **Conversation Context**: Maintains search context across chat sessions
- **Real-Time Validation**: Anti-hallucination checks ensure response accuracy

## 🎯 What Makes This Special

### **Real Implementation, Not Demo**

✅ Production-tested with real insurance PDF documents processed into 92 searchable chunks
✅ Production-ready RAG architecture with FastAPI + LlamaIndex + FAISS
✅ Semantic vector search with multilingual embeddings for Indonesian and English
✅ Profile-based query enhancement and personalization (e.g., Jakarta + flood risk → "banjir flood" terms)
✅ Anti-hallucination validation with mandatory citations requiring document grounding
✅ Conversation memory with anti-repetition mechanisms

### **Privacy by Design**

🔒 Zero server-side storage of personal data - GDPR compliant
🔒 All user profiles and chat history stored only in browser localStorage
🔒 No tracking, cookies, or sensitive data collection
🔒 Complete conversation history control with clear functionality

### **B2B-Focused Multi-Service Architecture**

🏗️ Embeddable widget design for seamless website integration
🏗️ API approach for custom integration support
🏗️ FastAPI Python service (port 8001) for document processing
🏗️ Next.js frontend (port 3000) with API encapsulation layer
🏗️ PostgreSQL + FAISS vector database for semantic search
🏗️ Groq API integration for Meta Llama 3.3 70B model access

## 🚀 Live Demo

Visit the application at:

- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:8001/health
- **Features**: Chat with Miria, compare products, manage your profile

---

## 🏢 Business Model & Future Plans

**Revenue Streams:**
- SaaS subscription model with monthly/annual plans for insurance companies
- Partnership commissions from policy sales generated through the platform
- B2B focus with scalable subscription tiers and performance-based revenue sharing

**Future Development:**
- Embeddable widget for seamless website integration
- API approach for custom integration support
- Partnership ecosystem with fintech and insurance marketplaces
- Co-innovation programs with insurance partners
- Social media presence for public education and industry conference participation

## ⚖️ Disclaimer

This application provides AI-powered insurance guidance for educational purposes. It supports but does not replace licensed insurance agents or official policy documents. All AI responses are grounded in official RIPLAY documents with proper citations, but users should always confirm details with official insurance providers or certified agents before making insurance decisions. The system includes clear disclaimers about AI limitations and encourages professional consultation for complex cases.
