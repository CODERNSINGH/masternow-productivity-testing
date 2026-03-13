import express from 'express';
import { google } from 'googleapis';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5001/auth/google/callback'
);

// Add event to Google Calendar
router.post('/add-event', async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;

        if (!title || !dueDate) {
            return res.status(400).json({ error: "Title and due date are required for a calendar event" });
        }

        oauth2Client.setCredentials({
            access_token: req.user.googleAccessToken,
            refresh_token: req.user.googleRefreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Event spanning the whole day of dueDate, or 1 hour block if specific time.
        // For Kanban, we usually just want an all-day event for the Due Date.
        const eventDate = new Date(dueDate);
        const nextDay = new Date(eventDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const event = {
            summary: `Masternow Task: ${title}`,
            description: description || "Task from Masternow Kanban Board",
            start: {
                date: eventDate.toISOString().split('T')[0],
                timeZone: 'UTC',
            },
            end: {
                date: nextDay.toISOString().split('T')[0],
                timeZone: 'UTC',
            },
            colorId: '9', // Blueberry color
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        res.status(201).json({
            message: "Event added to Google Calendar",
            eventId: response.data.id,
            link: response.data.htmlLink
        });
    } catch (error) {
        console.error("Error adding to Calendar:", error?.response?.data || error.message);
        res.status(500).json({ error: "Failed to add event to Google Calendar" });
    }
});

export default router;
