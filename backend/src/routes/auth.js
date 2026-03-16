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

        // Determine frontend URL - support both local and production
        let frontendURL = process.env.FRONTEND_URL || 'https://masternow.in';
        
        // If there's a state parameter with frontend URL (optional), use that
        if (req.query.state) {
            try {
                const state = JSON.parse(req.query.state);
                if (state.frontendUrl) {
                    frontendURL = state.frontendUrl;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        // Redirect to frontend with token in URL (or set as cookie)
        res.redirect(`${frontendURL}/auth/callback?token=${token}`);
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
