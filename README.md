# InsurAI

**Your Insurance AI Assistant Agent**

InsurAI is an AI-powered assistant that helps users **understand insurance products in plain language**.  
Built with Next.js, shadcn/ui, and Meta Llama, it provides **grounded Q&A with citations from official RIPLAY documents**, policy comparison, and personalized recommendations — all designed with a **privacy-first approach**.

---

## 🚀 Features (MVP)

- **Grounded Q&A with Citations**  
  Ask any question about an insurance product.  
  Answers always cite RIPLAY documents.  
  If no relevant information is found → returns _“Not found in the documents…”_.

- **Profile-Based Personalization**  
  Mini profile form (vehicle type, city, year, flood risk, usage).  
  Stored locally in the browser (localStorage).  
  Used to provide more relevant answers and add-on suggestions.

- **Policy Product Comparison**  
  Select two products (e.g. Comprehensive vs TLO) and generate a comparison table.  
  Key differences shown with citations (Coverage, Exclusions, Add-ons, Notes).

- **Local-Only Chat History**  
  Conversations are saved only in the user’s browser via localStorage.  
  Clear chat anytime with a single click.

- **Landing Page with CTA**  
  Simple intro section with app name, description, and “Try the Demo” button.

- **Ethics & Transparency**
  - Always grounded on official documents (RIPLAY).
  - Always display citations and disclaimers.
  - No sensitive data stored server-side.

---

## 📦 Tech Stack

- **Frontend:** Next.js (TypeScript), Tailwind, shadcn/ui
- **Backend (API Routes):** Next.js API layer
- **AI:** Meta Llama (via API)
- **Data Source:** Static JSON files (`/data/products.json`, `/data/productDocuments.json`, RIPLAY excerpts)
- **Storage:** LocalStorage (profile + chat history only)

---

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js 18+
- Package manager: npm, yarn, or pnpm
- Meta Llama API key

### 2. Clone the Repo

```bash
git clone https://github.com/your-username/ai-insurance-pa.git
cd ai-insurance-pa
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Environment Variables

Create .env.local in the root directory:

```bash
LLAMA_API_KEY=your-meta-llama-api-key
LLAMA_API_URL=https://api.llama.meta/...
```

### 5. Run the Development Server

```bash
npm run dev
```

### 6. Open the App

Visit http://localhost:3000 and You should see the landing page with the CTA → start chat demo.

---

## 📌 Limitations (MVP)

- Static documents only (RIPLAY).
- No real vector DB (simple keyword/tag filtering).
- No login/authentication (profile & chat stored locally).

---

## ⚖️ Disclaimer

This app is for educational and demo purposes only.
It is not a substitute for official policy documents or professional legal/financial advice.
Always confirm details with the official insurance provider or certified agent.
