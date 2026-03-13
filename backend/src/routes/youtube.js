import express from 'express';
import { google } from 'googleapis';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// Define OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5001/auth/google/callback'
);

// Fetch YouTube Playlist Details
router.post('/fetch-playlist', async (req, res) => {
    try {
        const { playlistUrl } = req.body;

        if (!playlistUrl) {
            return res.status(400).json({ error: "Playlist URL is required" });
        }

        // Extract playlist ID from URL (e.g., ?list=PLXXXXXX)
        const urlParams = new URLSearchParams(new URL(playlistUrl).search);
        const playlistId = urlParams.get('list');

        if (!playlistId) {
            return res.status(400).json({ error: "Invalid YouTube playlist URL" });
        }

        // Set credentials using user's stored tokens
        oauth2Client.setCredentials({
            access_token: req.user.googleAccessToken,
            refresh_token: req.user.googleRefreshToken
        });

        // Use Youtube Data API v3
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        // 1. Fetch Playlist Info (Title, etc)
        const playlistResponse = await youtube.playlists.list({
            part: 'snippet',
            id: playlistId
        });

        if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        const playlistSnippet = playlistResponse.data.items[0].snippet;

        // 2. Fetch Playlist Items (Videos)
        let videos = [];
        let nextPageToken = null;

        // Loop through pagination to get all videos
        do {
            const itemsResponse = await youtube.playlistItems.list({
                part: 'snippet,contentDetails',
                playlistId: playlistId,
                maxResults: 50,
                pageToken: nextPageToken
            });

            const activeVideos = itemsResponse.data.items.filter(item =>
                item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video'
            );

            videos = videos.concat(activeVideos.map(item => ({
                videoId: item.contentDetails.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
            })));

            nextPageToken = itemsResponse.data.nextPageToken;
        } while (nextPageToken);

        res.json({
            title: playlistSnippet.title,
            channelTitle: playlistSnippet.channelTitle,
            totalVideos: videos.length,
            videos: videos
        });

    } catch (error) {
        console.error("Error fetching YouTube playlist:", error?.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch YouTube playlist" });
    }
});

// Save Course and Distribute Lecture Items
router.post('/save-course', async (req, res) => {
    try {
        const { platform, playlistUrl, startDate, workingDays, lecturesPerWorkDay, lecturesPerWeekend, videos } = req.body;

        // Create Course
        const course = await prisma.course.create({
            data: {
                userId: req.user.id,
                platform: platform || 'youtube',
                playlistUrl,
                startDate: new Date(startDate),
                workingDays
            }
        });

        // Distribute Videos
        let currentDate = new Date(startDate);
        let videosAddedToday = 0;
        let videoIndex = 0;

        const lectureItems = [];

        while (videoIndex < videos.length) {
            const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
            const isWorkingDay = workingDays.includes(dayOfWeek);
            const limitForToday = isWorkingDay ? lecturesPerWorkDay : lecturesPerWeekend;

            if (limitForToday === 0 || videosAddedToday >= limitForToday) {
                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
                videosAddedToday = 0;
                continue;
            }

            const video = videos[videoIndex];
            lectureItems.push({
                courseId: course.id,
                assignedDate: new Date(currentDate),
                videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                title: video.title,
                description: video.description
            });

            videosAddedToday++;
            videoIndex++;
        }

        // Bulk insert lecture items
        await prisma.lectureItem.createMany({
            data: lectureItems
        });

        res.status(201).json({ message: "Course saved successfully", totalItems: lectureItems.length });
    } catch (error) {
        console.error("Error saving course:", error);
        res.status(500).json({ error: "Failed to save course" });
    }
});

export default router;
