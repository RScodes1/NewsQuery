# News Query Chatbot
  Simple full stack chatbot that answers queries using RAG pipeline

## 1. Project Setup

### a. Prerequisites

-Frontend: React 18.2.0 \
-Backend: Node.js >=18 \
-Vector DB: Qdrant \ 
-Embeddings: Jina Embeddings \
-LLM: OpenAI API Model \

### b. Installation Steps

#### Frontend
```bash
cd frontend
npm install
```
#### Backend
```bash
cd backend
npm install
```

#### Environment Variables BE and FE
```bash
MONGODB_URI=**************************************************************
REDIS_URL=**************************************************************
QDRANT_URL=**************************************************************
QDRANT_API_KEY=**************************************************************
JINA_API_KEY=**************************************************************
OPENAI_API_KEY=*****************************************************
```
```bash
REACT_APP_API_URL=https://newsquery.onrender.com
```

### c. Running Locally
```bash 
- Frontend
cd frontend
npm run start

Runs frontend on http://localhost:3000
```
```bash 
- Backend
cd backend
npm run dev

Runs frontend on http://localhost:4500
```
## 2. Tech Stack

### Frontend, Backend, DB, AI

**AI / RAG**
-Embeddings: Jina Embeddings (free tier)
-Vector Store: Qdrant
-LLM: OpenAI API for final answer generation
-Pipeline: Retrieve → Rank → LLM Answer

**Frontend**
-React
-Scss
-Simple chat UI with typing/dots animation

**Backend**
-Node.js + Express
-RAG pipeline implementation
-Session-based message history
-Article ingestion + embedding job

**Deployment**
-Frontend: Vercel
-Backend:  Render

## 3. Cache 

**Caching & Performance**

-Key: sessionId
-Value: Array of conversation messages
-TTL: 10 minutes of inactivity

```bash
const SESSION_TTL = 10 * 60 * 1000; 

sessionCache.set(sessionId, {
  messages,
  expiresAt: Date.now() + SESSION_TTL
});
```
##  4. Decisions & Assumptions

**Key design decisions**
-RAG answers must only use information from the news corpus
-Top-K retrieval used instead of reranking for simplicity
-Minimalistic frontend since assignment prioritizes backend logic

### Implementation assumptions
-Corpus size: 50 articles
-Embeddings stored once via ingestion script
-One vector collection for all news chunks
-Backend streams responses token-by-token

## 5. AI Tools Usage

### How AI helped 

**Tools Used**
-ChatGPT — for design plan, debugging, and RAG architectural help
-Openai API — for final LLM answering

**How AI Helped**
-Designing clean folder structure
-Debugging retrieval issues
-Integrating streaming responses
-Implementing article chunking and embedding pipeline

## Repo Structure
```bash
/frontend
  /src
    /components
       /ChatWindow
          ChatWindow.jsx
          ChatWindow.scss 
       /ChatInput
          ChatInput.jsx
          ChatInput.scss
       /Message
          Message.jsx
          Message.scss
    /context
       SessionContext.jsx
    /services
      api.js
      socket.js     
    App.js
    App.scss
    index.js
    index.scss
```

```bash
 /backend
     /config
        db.js
        redis.js
        vectorStore.js
     /models
        session.js
    /rag
       embed.js
       llm.js
       ingest.js
       retrieve.js
    /routes
       session.routes.js
   /socket
       chatSocket.js
   /utils
       chunkText.js
       logger.js
       news.json
```
