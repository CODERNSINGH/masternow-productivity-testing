import express from 'express';
import passport, { generateToken } from '../passportConfig.js';

const router = express.Router();

// Initialize Google OAuth login
router.get(
    '/google',
    (req, res, next) => {
        // We will pass the state parameter to passport so it is sent to Google.
        // Google will return this exact state parameter to the callback URL.
        const stateStr = req.query.frontendUrl ? JSON.stringify({ frontendUrl: req.query.frontendUrl }) : undefined;
        // encode it in base64 to ensure it survives the redirect unscathed
        const stateBase64 = stateStr ? Buffer.from(stateStr).toString('base64') : undefined;

        passport.authenticate('google', {
            scope: [
                'profile',
                'email',
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/youtube.readonly'
            ],
            accessType: 'offline', // Request refresh token
            prompt: 'consent', // Force to get refresh token
            state: stateBase64
        })(req, res, next);
    }
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
        
        // Recover state
        if (req.query.state) {
            try {
                const decodedStateStr = Buffer.from(req.query.state, 'base64').toString('ascii');
                const stateObj = JSON.parse(decodedStateStr);
                if (stateObj.frontendUrl) {
                    frontendURL = stateObj.frontendUrl;
                }
            } catch (e) {
                console.error("Failed to parse state", e);
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
