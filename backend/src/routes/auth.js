import express from 'express';
import passport, { generateToken } from '../passportConfig.js';

const router = express.Router();

// Initialize Google OAuth login
router.get(
    '/google',
    passport.authenticate('google', {
        scope: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/youtube.readonly'
        ],
        accessType: 'offline', // Request refresh token
        prompt: 'consent' // Force to get refresh token
    })
);

// Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token for our backend API
        const token = generateToken(req.user.user);

        // Redirect to frontend with token in URL (or set as cookie)
        // Assuming frontend runs on exactly localhost:5174 for development
        res.redirect(`http://localhost:5174/auth/callback?token=${token}`);
    }
);

// Get current user profile (protected route)
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

import { requireAuth } from '../middleware/authMiddleware.js';

router.get('/me', requireAuth, (req, res) => {
    res.json(req.user);
});

export default router;
