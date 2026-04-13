# Quick Start - RAG System Deployment Checklist

## ✅ What's Been Built

### Backend (Node.js + )
- [x] Prisma schema updated with RAG models (Document, DocumentChunk, Chat, Message)
- [x] File parser utilities (PDF + Word extraction)
- [x] RAG helper functions (chunking, retrieval, prompting)
- [x]  API integration
- [x] Complete Chat.js route with endpoints
- [x] Authentication middleware integrated
- [x] Error handling throughout

### Frontend (React)
- [x] PersonalisedAI page completely updated
- [x] File upload with drag-and-drop ready
- [x] Document status tracking
- [x] Real-time chat with RAG responses
- [x] Error alerts
- [x] Voice recording support
- [x] Beautiful modern UI ✨

### Database
- [x] Prisma schema with proper relationships
- [x] Indexes for performance
- [x] Cascade deletes configured

## 🚀 Deployment Steps

### Step 1: Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name add_rag_system
npm run dev
```

### Step 2: Test Locally
- Go to http://localhost:5001/api/health
- Should see: `{"status":"ok","time":"..."}`

### Step 3: Deploy to Render (or your server)

**Important**: Make sure environment variables are set:
```
DATABASE_URL=your_postgres_url
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
JWT_SECRET=your_secret
GOOGLE_CALLBACK_URL=your_render_url/auth/google/callback
FRONTEND_URL=https://masternow.in
_API_KEY=
```

### Step 4: Frontend Update (Already Done)
- All API URLs hardcoded to `https://masternow-productivity-testing.onrender.com`
- PersonalisedAI page ready to use
- No additional setup needed

## 📊 System Architecture

```
┌─── Frontend (React) ───┐
│  PersonalisedAI.jsx   │
│  - Upload files       │
│  - Chat interface     │
│  - Voice support      │
└──────────│────────────┘
           │
           ↓ HTTP API
┌─── Backend (Node.js + Express) ───┐
│  /api/chat/upload                  │
│  /api/chat/message                 │
│  /api/chat/documents               │
│  /api/chat/history                │
└──────────│─────────────────────────┘
           │
           ├─→ File Parser (PDF/Word) ─→ Text Extraction
           ├─→ RAG Helper (Chunking)   ─→ Text Chunks
           ├─→  API               ─→ LLM Responses
           └─→ PostgreSQL             ─→ Data Storage
```

## 💾 Database Schema

```sql
-- Documents uploaded by user
Document {
  id: uuid
  userId: uuid
  fileName: string
  fileType: "pdf" | "word"
  originalText: text
  status: "processing" | "ready" | "failed"
  chunks: DocumentChunk[]
  createdAt: datetime
}

-- Text chunks for retrieval
DocumentChunk {
  id: uuid
  documentId: uuid → Document
  content: text
  chunkIndex: int
  embedding: float[] (for future ML)
  createdAt: datetime
}

-- Chat sessions
Chat {
  id: uuid
  userId: uuid
  messages: Message[]
  createdAt: datetime
}

-- Individual messages
Message {
  id: uuid
  chatId: uuid → Chat
  role: "user" | "assistant"
  content: text
  files: string[]
  createdAt: datetime
}
```

## 🔄 Query Flow (User Perspective)

```
1. User logs in (via Google Auth)
   ↓
2. User opens PersonalisedAI page
   ↓
3. User uploads PDF/Word file
   ├─ File validated (size, type)
   ├─ Text extracted
   ├─ Split into ~500 char chunks
   ├─ Stored in database
   └─ Status changes to "ready"
   ↓
4. User types question
   ↓
5. Backend retrieves all documents
   ↓
6. Finds most relevant chunks (top 5)
   ↓
7. Constructs prompt:
      [System: You are helpful AI with document context]
      [Document Context: Chunks 1-5]
      [User Question: What is...]
   ↓
8. Calls  API
   ↓
9. Returns response with metadata
   ↓
10. Frontend displays with cite

d documents
```

## 📋 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat/upload` | Upload a document |
| GET | `/api/chat/documents` | List user's documents |
| DELETE | `/api/chat/documents/:id` | Delete a document |
| POST | `/api/chat/message` | Send query, get RAG response |
| GET | `/api/chat/history` | Get chat history |

## ⚙️ Configuration Reference

**File Limits**
- Max file size: 10MB
- Formats: PDF, .doc, .docx
- Chunk size: 500 characters
- Chunk overlap: 100 characters
- Retrieval size: Top 5 chunks

** Settings**
- Model: mixtral-8x7b-32768
- Temperature: 0.7
- Max tokens: 1024
- Top P: 0.9

**RAG Strategy**
- Retrieval: Keyword-based similarity (easy upgrade to semantic later)
- Embedding: Simple term overlap
- Context: Top matching chunks provided to LLM

## 🎯 What Works Now

✅ Upload PDF files
✅ Upload Word documents
✅ Ask questions about documents
✅ Get answers powered by 
✅ View chat history
✅ Delete documents
✅ Voice recording (UI ready, backend processes text)
✅ Error handling & validation
✅ DB persistence
✅ User authentication

## 🔮 Optional Future Enhancements

1. **Vector Search** (⭐ Recommended)
   - Replace keyword search with semantic vectors
   - Use `@xenova/transformers` library
   - Much better relevance

2. **Streaming Responses**
   - Real-time token streaming from Groq
   - Better UX for long responses

3. **Document Preview**
   - Show which document responds to query
   - Highlight relevant sections

4. **Citation System**
   - Show exact chunks used
   - Link to source documents

5. **Batch Processing**
   - Process multiple files
   - Background queue jobs

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Document processing failed" | Check file is valid PDF/Word, < 10MB |
| "No  response" | Verify _API_KEY, check API status |
| "Authentication error" | Login again, check JWT token |
| "Database error" | Run `npx prisma migrate dev` |
| "File upload stuck" | Check file size, browser logs |

## 📞 Need Help?

1. Check logs: Terminal where backend runs
2. Check .env: Ensure all variables exist
3. Reset DB: `npx prisma migrate reset --force` (⚠️ deletes data)
4. Check endpoints: Use curl/Postman to test

## 🎉 You're All Set!

The RAG system is fully functional:
- ✅ Pure JavaScript/Node.js (no Python)
- ✅  LLM integration
- ✅ Document upload & processing
- ✅ Smart retrieval & context
- ✅ Beautiful UI
- ✅ Production-ready error handling

**Next**: Deploy to Render, test with your documents!

---

Last Updated: April 2026
Status: Production Ready ✨
