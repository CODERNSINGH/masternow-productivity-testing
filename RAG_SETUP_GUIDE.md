# RAG System Setup Guide

## Architecture Overview

Your RAG (Retrieval Augmented Generation) system is now complete. Here's what was built:

### Components:

1. **Frontend (PersonalisedAI.jsx)**
   - Modern chat UI with file upload capability
   - Support for PDF and Word documents (up to 10MB)
   - Real-time feedback on document processing
   - Voice recording support
   - Message display with metadata about used documents

2. **Backend Services**
   - **fileParser.js** - Extract text from PDF/Word files
   - **ragHelper.js** - Smart chunking, retrieval, and prompt engineering
   - **groqHelper.js** - Integration with Groq LLM API
   - **Chat.js Route** - Complete API endpoints for RAG system
   - **Prisma Schema** - Database models for documents, chunks, and chat history

3. **Database Models**
   - `Document` - Stores uploaded files metadata
   - `DocumentChunk` - Text chunks for retrieval (with embeddings placeholder)
   - `Chat` - Chat session management
   - `Message` - Individual chat messages with history

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `pdf-parse` - PDF text extraction
- `mammoth` - Word document extraction
- All existing dependencies (Express, Prisma, Groq SDK, etc.)

### Step 2: Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_rag_system
```

This creates the new tables: `Document`, `DocumentChunk`, `Chat`, `Message`

### Step 3: Start Your Backend

```bash
npm run dev
```

The backend should start on `http://localhost:5001`

### Step 4: Test the System

#### Using Frontend:
1. Go to PersonalisedAI page
2. Click the paperclip icon and upload a PDF or Word document
3. Wait for processing to complete (shows checkmark)
4. Type your question
5. Get RAG-powered response from Groq

#### Using API Directly:

**Upload a Document:**
```bash
curl -X POST http://localhost:5001/api/chat/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

**Send a Chat Message:**
```bash
curl -X POST http://localhost:5001/api/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What is this document about?",
    "documentIds": ["doc-id-here"]
  }'
```

**Get Uploaded Documents:**
```bash
curl http://localhost:5001/api/chat/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Chat History:**
```bash
curl http://localhost:5001/api/chat/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## How It Works

### 1. Document Upload Flow
```
User uploads PDF/Word
  ↓
Backend extracts text
  ↓
Text split into chunks (500 chars, 100 char overlap)
  ↓
Chunks stored in database
  ↓
Status set to "ready"
```

### 2. Chat/Query Flow
```
User types question
  ↓
Backend retrieves all user's documents
  ↓
Simple similarity matching finds relevant chunks
  ↓
Top 5 chunks selected as context
  ↓
Prompt constructed: [System] + [Document Context] + [User Query]
  ↓
Sent to Groq API (mixtral-8x7b-32768 or other model)
  ↓
Response returned to frontend
  ↓
Message saved to chat history with metadata
```

## API Endpoints

### POST `/api/chat/upload`
Upload and process a document for RAG
- **Body**: FormData with "file" field
- **Returns**: Document object with chunk count
- **Status codes**: 400 (invalid file), 500 (processing error)

### GET `/api/chat/documents`
Get all user's uploaded documents
- **Returns**: Array of documents with status and chunk counts
- **Status codes**: 500 (database error)

### DELETE `/api/chat/documents/:id`
Delete a document and all its chunks
- **Returns**: Success message
- **Status codes**: 403 (not authorized), 500 (error)

### POST `/api/chat/message`
Send a message and get RAG response
- **Body**: `{ content: string, documentIds?: string[] }`
- **Returns**: `{ success: boolean, response: string, usedDocuments: string[], usedChunks: number }`
- **Status codes**: 400 (empty message), 500 (Groq API error)

### GET `/api/chat/history`
Get recent chat history
- **Returns**: Array of chats with messages
- **Status codes**: 500 (database error)

## Configuration

### Environment Variables (Already in .env)
```
GROQ_API_KEY=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
```

### File Limits
- Max file size: 10MB
- Allowed formats: PDF, Word (.doc, .docx)
- Chunk size: 500 characters with 100 character overlap
- Max chunks per query: 5
- Max documents per user: Unlimited

### Groq Model
Currently using: `mixtral-8x7b-32768`
- Temperature: 0.7
- Max tokens: 1024
- Top P: 0.9

## Features Implemented

✅ PDF text extraction
✅ Word document parsing
✅ Smart text chunking with overlap
✅ Similarity-based chunk retrieval
✅ Integration with Groq LLM
✅ Chat history persistence
✅ Document management (upload/delete)
✅ Real-time processing feedback
✅ Error handling and validation
✅ User authentication integration
✅ Beautiful modern UI

## Future Enhancements

1. **Vector Embeddings**
   - Add real embedding vectors using `@xenova/transformers` or HuggingFace API
   - Replace keyword-based search with semantic search

2. **Multi-Language Support**
   - Add language detection
   - Support for non-English documents

3. **Advanced Features**
   - Document summarization
   - Question generation from documents
   - Export chat as PDF
   - Share document knowledge with team

4. **Performance**
   - Caching for frequently accessed chunks
   - Background processing for large files
   - Async chunk generation

5. **UI Enhancements**
   - Document preview
   - Chunk highlighting
   - Citation display
   - Search within documents

## Troubleshooting

### "Document processing failed"
- Check file is valid PDF/Word
- Ensure file size < 10MB
- Check server logs for extraction errors

### "No response from Groq"
- Verify GROQ_API_KEY is correct
- Check Groq API service status
- Check internet connection

### "Database error"
- Run `npx prisma migrate dev` again
- Check PostgreSQL is running
- Verify DATABASE_URL in .env

### "Authentication failed"
- Ensure JWT token is valid
- Check Authorization header format: "Bearer TOKEN"
- Login again if token expired

## File Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── Chat.js              ← RAG chat endpoints
│   │   └── ... (other routes)
│   ├── utils/
│   │   ├── fileParser.js        ← PDF/Word extraction
│   │   ├── ragHelper.js         ← Chunking & retrieval
│   │   └── groqHelper.js        ← Groq API integration
│   ├── index.js                 ← Express app
│   └── db.js                    ← Prisma client
├── prisma/
│   └── schema.prisma            ← Database schema (updated)
├── package.json                 ← Dependencies (updated)
└── .env                         ← Environment variables

frontend/
└── src/
    └── pages/
        └── PersonalisedAI.jsx   ← Chat UI (updated)
```

## Next Steps

1. ✅ Deploy backend to Render/Railway
2. ✅ Test with sample documents
3. ✅ Gather user feedback
4. Optional: Implement vector embeddings
5. Optional: Add more document formats (Excel, PPT)
6. Optional: Implement streaming responses

## Support

If you encounter issues:
1. Check server logs: `npm run dev`
2. Verify .env variables
3. Run `npx prisma migrate reset` to rebuild database (WARNING: deletes all data)
4. Check that all utils files are in `/backend/src/utils/`

---

Built with Node.js, Groq LLM, and Prisma ✨
