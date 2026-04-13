# Pre-Deployment Verification Checklist

Use this checklist to verify everything is properly configured before deploying.

## Backend Files Created ✅

- [ ] `/backend/src/utils/fileParser.js` - PDF/Word extraction
- [ ] `/backend/src/utils/ragHelper.js` - Chunking & retrieval logic
- [ ] `/backend/src/utils/groqHelper.js` - Groq API integration
- [ ] `/backend/src/routes/Chat.js` - RAG endpoints (updated)

## Backend Files Modified ✅

- [ ] `/backend/package.json` - pdf-parse & mammoth added
- [ ] `/backend/prisma/schema.prisma` - Document, DocumentChunk, Chat, Message models
- [ ] `/backend/src/index.js` - Chat route imported and registered

## Verify Dependencies Installed

```bash
cd backend
npm install
```

Check for:
- [ ] pdf-parse installed
- [ ] mammoth installed
- [ ] multer already present (for file upload)
- [ ] No error messages

**Install Output Should Include:**
```
added 2 packages (pdf-parse, mammoth)
up to date, audited X packages in X seconds
```

## Verify Prisma Migration

Run migration:
```bash
npx prisma migrate dev --name add_rag_system
```

Check for:
- [ ] Migration creates Document table
- [ ] Migration creates DocumentChunk table
- [ ] Migration creates Chat table
- [ ] Migration creates Message table
- [ ] No SQL errors
- [ ] Prisma client regenerated

**Success Message:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

## Frontend Files Modified ✅

- [ ] `/frontend/src/pages/PersonalisedAI.jsx` - Backend integrated

Verify:
- [ ] API calls point to `https://masternow-productivity-testing.onrender.com`
- [ ] File upload handler exists
- [ ] Chat message handler exists
- [ ] Document history fetching implemented

## Environment Variables ✅

Verify `/backend/.env` contains:

```
DATABASE_URL=your_postgres_url          ✅
GOOGLE_CLIENT_ID=...                    ✅
GOOGLE_CLIENT_SECRET=...                ✅
JWT_SECRET=any_long_random_string...    ✅
GOOGLE_CALLBACK_URL=...                 ✅
FRONTEND_URL=https://masternow.in       ✅
GROQ_API_KEY=gsk_zQv...                 ✅
```

All 7 variables must be present!

## Local Testing

### 1. Test Backend Start
```bash
cd backend
npm run dev
```

Check terminal output:
- [ ] "Server running on port 5001"
- [ ] "No errors or warnings"
- [ ] Can access http://localhost:5001/api/health

### 2. Test File Upload
```bash
curl -X POST http://localhost:5001/api/chat/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_document.pdf"
```

Expected response:
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "status": "ready",
    "chunkCount": 5+
  }
}
```

### 3. Test Chat Message
```bash
curl -X POST http://localhost:5001/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test question?"}'
```

Expected response:
```json
{
  "success": true,
  "response": "Groq response text...",
  "usedDocuments": ["filename.pdf"],
  "usedChunks": 5
}
```

## Frontend Integration Testing

Navigate to PersonalisedAI page:

1. [ ] Page loads without errors
2. [ ] Document upload button visible
3. [ ] Can select PDF file
4. [ ] Upload succeeds and shows status
5. [ ] Chat input becomes enabled
6. [ ] Can type question
7. [ ] Can send message
8. [ ] Receives response from Groq
9. [ ] Error messages display properly
10. [ ] Document metadata shown

## Database Verification

```bash
npx prisma studio
```

Check:
- [ ] `Document` table exists with columns: id, userId, fileName, fileType, originalText, status
- [ ] `DocumentChunk` table exists with columns: id, documentId, content, chunkIndex
- [ ] `Chat` table exists with columns: id, userId
- [ ] `Message` table exists with columns: id, chatId, role, content, files
- [ ] Foreign keys are set up correctly
- [ ] Indexes are created

## Production Deployment Checklist

### Before Deploying to Render

- [ ] All environment variables set in Render dashboard
- [ ] Database URL points to production PostgreSQL
- [ ] GROQ_API_KEY is valid
- [ ] FRONTEND_URL points to production domain
- [ ] Backend build command: `npm install && npx prisma migrate deploy && npm start`

### After Deploying

- [ ] Test health endpoint: `/api/health`
- [ ] Test file upload with token
- [ ] Test chat message with real question
- [ ] Monitor logs for errors
- [ ] Test from different browsers

## Troubleshooting Guide

| Problem | Solution |
|---------|----------|
| Module not found | `npm install` in backend |
| Prisma error | `npx prisma migrate dev --name add_rag_system` |
| API returns 401 | Check JWT token and Authorization header |
| Groq API error | Verify GROQ_API_KEY is correct in .env |
| File upload fails | Check file size < 10MB and format is PDF/Word |
| Chunks not created | Run migration, check postgres connection |
| Chat returns empty | Ensure document is status "ready", not "processing" |

## Success Criteria

Your RAG system is working if:

✅ Backend starts without errors
✅ Database migration completes successfully
✅ File uploads create document chunks
✅ Chat queries return Groq responses
✅ Frontend displays responses properly
✅ No console errors in browser
✅ Logs show normal operation
✅ All 7 environment variables are set

## Rollback Plan

If something breaks:

1. Check logs for specific error
2. Verify all environment variables
3. Run `npx prisma migrate reset --force` to reset DB (⚠️ deletes data)
4. Run migration again
5. Restart backend
6. Test locally first before deploying

## Final Verification

Before considering it "done":

```bash
# In backend directory
npm run dev

# In another terminal, test:
curl http://localhost:5001/api/health

# Should return:
# {"status":"ok","time":"2024-04-13T..."}
```

If all boxes are checked ✅, your RAG system is ready for production!

---

**Documentation Files Created:**
- ✅ RAG_BUILD_SUMMARY.md - Complete overview
- ✅ RAG_SETUP_GUIDE.md - Detailed setup instructions
- ✅ RAG_QUICK_START.md - Quick reference
- ✅ RAG_DEPLOYMENT_CHECKLIST.md - This file

**Status**: Ready for Deployment 🚀
