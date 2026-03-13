import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Failed to authenticate token' });

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        req.user = user;
        next();
    });
};
