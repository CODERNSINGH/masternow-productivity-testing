import express from 'express';
import multer from 'multer';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { extractText } from '../utils/fileParser.js';
import { chunkText, retrieveRelevantChunks, prepareContext, createRAGPrompt } from '../utils/ragHelper.js';
import { callGroqWithRAG } from '../utils/groqHelper.js';

const router = express.Router();
router.use(requireAuth);

// Multer setup for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    }
});

/**
 * POST /api/chat/upload - Upload and process a document for RAG
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user.id;

        // Determine file type
        const fileType = mimetype.includes('pdf') ? 'pdf' : 'word';

        // Create document record with processing status
        const document = await prisma.document.create({
            data: {
                userId,
                fileName: originalname,
                fileType,
                status: 'processing',
                originalText: ''
            }
        });

        // Extract text from file
        let extractedText = '';
        try {
            extractedText = await extractText(buffer, fileType);
        } catch (err) {
            await prisma.document.update({
                where: { id: document.id },
                data: { status: 'failed' }
            });
            return res.status(400).json({ error: `Failed to extract text: ${err.message}` });
        }

        // Split into chunks
        const chunks = chunkText(extractedText, 500, 100);

        // Save chunks to database
        const documentChunks = await Promise.all(
            chunks.map((chunk, index) =>
                prisma.documentChunk.create({
                    data: {
                        documentId: document.id,
                        content: chunk,
                        chunkIndex: index,
                        embedding: [] // Placeholder for embeddings if using later
                    }
                })
            )
        );

        // Update document status and store full text
        const updatedDoc = await prisma.document.update({
            where: { id: document.id },
            data: {
                status: 'ready',
                originalText: extractedText
            },
            include: {
                chunks: true
            }
        });

        res.json({
            success: true,
            document: {
                id: updatedDoc.id,
                fileName: updatedDoc.fileName,
                fileType: updatedDoc.fileType,
                chunkCount: documentChunks.length,
                status: updatedDoc.status
            },
            message: `Document processed successfully! Created ${documentChunks.length} chunks.`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: `Upload failed: ${error.message}` });
    }
});

/**
 * GET /api/chat/documents - Get user's uploaded documents
 */
router.get('/documents', async (req, res) => {
    try {
        const userId = req.user.id;
        const documents = await prisma.document.findMany({
            where: { userId },
            include: {
                chunks: {
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            documents: documents.map(doc => ({
                id: doc.id,
                fileName: doc.fileName,
                fileType: doc.fileType,
                status: doc.status,
                chunkCount: doc.chunks.length,
                createdAt: doc.createdAt
            }))
        });
    } catch (error) {
        console.error('Fetch documents error:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

/**
 * DELETE /api/chat/documents/:id - Delete a document
 */
router.delete('/documents/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        // Verify ownership
        const document = await prisma.document.findUnique({
            where: { id: documentId }
        });

        if (!document || document.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Delete document (cascades to chunks)
        await prisma.document.delete({
            where: { id: documentId }
        });

        res.json({ success: true, message: 'Document deleted' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

/**
 * POST /api/chat/message - Send a chat message and get RAG response
 */
router.post('/message', async (req, res) => {
    try {
        const userId = req.user.id;
        const { content, documentIds, useChatHistory = true } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Message content cannot be empty' });
        }

        // Validate and fetch documents
        let documents = [];
        if (documentIds && documentIds.length > 0) {
            documents = await prisma.document.findMany({
                where: {
                    id: { in: documentIds },
                    userId: userId,
                    status: 'ready'
                },
                include: {
                    chunks: {
                        select: { content: true }
                    }
                }
            });
        } else {
            // Fetch all user's ready documents if not specified
            documents = await prisma.document.findMany({
                where: {
                    userId: userId,
                    status: 'ready'
                },
                include: {
                    chunks: {
                        select: { content: true }
                    }
                }
            });
        }

        // Retrieve relevant chunks
        let relevantChunks = [];
        if (documents.length > 0) {
            const allChunks = documents.flatMap(doc => doc.chunks.map(chunk => chunk.content));
            relevantChunks = retrieveRelevantChunks(content, allChunks, 5);
        }

        // Prepare context
        const documentContext = prepareContext(relevantChunks);

        // Create RAG prompt
        const { system: systemPrompt, userMessage } = createRAGPrompt(content, documentContext, true);

        // Call Groq API
        const groqResponse = await callGroqWithRAG(systemPrompt, userMessage);

        // Save to chat history
        // Note: You may want to create/reuse chat sessions. For now, we'll store individual messages
        const message = await prisma.message.create({
            data: {
                chat: {
                    connectOrCreate: {
                        where: { id: `${userId}-${new Date().toDateString()}` }, // Simple session key
                        create: { userId }
                    }
                },
                role: 'user',
                content,
                files: documentIds || []
            }
        });

        await prisma.message.create({
            data: {
                chat: {
                    connect: { id: message.chatId }
                },
                role: 'assistant',
                content: groqResponse,
                files: documentIds || []
            }
        });

        res.json({
            success: true,
            response: groqResponse,
            usedDocuments: documents.map(doc => doc.fileName),
            usedChunks: relevantChunks.length
        });
    } catch (error) {
        console.error('Chat message error:', error);
        res.status(500).json({ error: `Failed to process message: ${error.message}` });
    }
});

/**
 * GET /api/chat/history - Get chat history
 */
router.get('/history', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const chats = await prisma.chat.findMany({
            where: { userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.json({
            chats: chats.map(chat => ({
                id: chat.id,
                messages: chat.messages.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    createdAt: msg.createdAt
                }))
            }))
        });
    } catch (error) {
        console.error('Fetch history error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

export default router;
