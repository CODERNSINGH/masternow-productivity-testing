import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './db.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'MOCK_ID',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'MOCK_SECRET',
            callbackURL: 'http://localhost:5001/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find or create user
                let user = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails?.[0]?.value || '',
                            avatarUrl: profile.photos?.[0]?.value || '',
                            googleAccessToken: accessToken,
                            googleRefreshToken: refreshToken || null,
                        },
                    });
                } else {
                    // Update tokens for existing user
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            googleAccessToken: accessToken,
                            ...(refreshToken && { googleRefreshToken: refreshToken })
                        }
                    });
                }

                // Pass both user object and Google tokens if needed for Googleapis
                return done(null, { user, accessToken, refreshToken });
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// We won't use passport sessions, we will use JWT
export const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '7d',
    });
};

export default passport;
