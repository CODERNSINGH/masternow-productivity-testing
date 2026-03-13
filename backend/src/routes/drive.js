import express from 'express';
import { google } from 'googleapis';
import multer from 'multer';
import stream from 'stream';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5001/auth/google/callback'
);

router.post('/upload-note', async (req, res) => {
    try {
        const { title, content, lectureItemId } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        oauth2Client.setCredentials({
            access_token: req.user.googleAccessToken,
            refresh_token: req.user.googleRefreshToken
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Step 1: Check if "Masternow Notes" folder exists
        let folderId = null;
        const folderResponse = await drive.files.list({
            q: "name='Masternow Notes' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: "files(id, name)"
        });

        if (folderResponse.data.files && folderResponse.data.files.length > 0) {
            folderId = folderResponse.data.files[0].id;
        } else {
            // Step 2: Create the folder if it doesn't exist
            const folderMetadata = {
                name: 'Masternow Notes',
                mimeType: 'application/vnd.google-apps.folder'
            };
            const folder = await drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });
            folderId = folder.data.id;
        }

        // Step 3: Create the Google Doc
        const fileMetadata = {
            name: title,
            mimeType: 'application/vnd.google-apps.document',
            parents: [folderId]
        };

        const media = {
            mimeType: 'text/markdown',
            body: content
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        // Step 4: Optionally update the specific lectureItem with drive link
        if (lectureItemId) {
            await prisma.lectureItem.update({
                where: { id: lectureItemId },
                data: { driveNoteLink: file.data.webViewLink }
            });
        }

        res.status(200).json({
            message: "Note saved to Google Drive",
            fileId: file.data.id,
            webViewLink: file.data.webViewLink
        });

    } catch (error) {
        console.error("Error saving note to Drive:", error?.response?.data || error.message);
        res.status(500).json({ error: "Failed to save note to Google Drive" });
    }
});

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-file', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const { lectureItemId } = req.body;

        if (!file) return res.status(400).json({ error: "No file provided" });

        oauth2Client.setCredentials({ access_token: req.user.googleAccessToken, refresh_token: req.user.googleRefreshToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        let folderId = null;
        const folderResponse = await drive.files.list({ q: "name='Masternow Notes' and mimeType='application/vnd.google-apps.folder' and trashed=false", fields: "files(id, name)" });

        if (folderResponse.data.files && folderResponse.data.files.length > 0) {
            folderId = folderResponse.data.files[0].id;
        } else {
            const folder = await drive.files.create({ resource: { name: 'Masternow Notes', mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
            folderId = folder.data.id;
        }

        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);

        const driveFile = await drive.files.create({
            resource: { name: file.originalname, parents: [folderId] },
            media: { mimeType: file.mimetype, body: bufferStream },
            fields: 'id, webViewLink'
        });

        if (lectureItemId) {
            await prisma.lectureItem.update({
                where: { id: lectureItemId },
                data: { driveNoteLink: driveFile.data.webViewLink }
            });
        }
        res.status(200).json({ message: "File uploaded successfully", fileId: driveFile.data.id, webViewLink: driveFile.data.webViewLink });
    } catch (err) {
        console.error("Error uploading file:", err);
        res.status(500).json({ error: "Failed to upload file to Google Drive" });
    }
});

export default router;
