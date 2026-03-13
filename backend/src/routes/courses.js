import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// Get User's Courses and Lecture Items grouped by Days
router.get('/', async (req, res) => {
    try {
        // Fetch courses for the user
        const courses = await prisma.course.findMany({
            where: { userId: req.user.id },
            include: {
                lectureItems: {
                    orderBy: { assignedDate: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

// Get specific lecture item
router.get('/lecture/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lecture = await prisma.lectureItem.findUnique({
            where: { id }
        });

        if (!lecture) {
            return res.status(404).json({ error: "Lecture not found" });
        }

        res.json(lecture);
    } catch (error) {
        console.error("Error fetching lecture:", error);
        res.status(500).json({ error: "Failed to fetch lecture" });
    }
});

// Update lecture completion status
router.patch('/lecture/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { isCompleted } = req.body;

        const updatedLecture = await prisma.lectureItem.update({
            where: { id },
            data: { isCompleted }
        });

        res.json(updatedLecture);
    } catch (error) {
        console.error("Error updating lecture status:", error);
        res.status(500).json({ error: "Failed to update lecture status" });
    }
});

// Create new lecture item (e.g. from Dashboard Add Content)
router.post('/lecture', async (req, res) => {
    try {
        const { courseId, assignedDate, title, driveNoteLink, videoUrl } = req.body;

        const newLecture = await prisma.lectureItem.create({
            data: {
                courseId,
                assignedDate: new Date(assignedDate),
                title,
                driveNoteLink,
                videoUrl,
                isCompleted: false
            }
        });

        res.status(201).json(newLecture);
    } catch (error) {
        console.error("Error creating lecture:", error);
        res.status(500).json({ error: "Failed to create lecture" });
    }
});

// Delete Course
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const course = await prisma.course.findUnique({
            where: { id }
        });

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        if (course.userId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        await prisma.course.delete({
            where: { id }
        });

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ error: "Failed to delete course" });
    }
});

export default router;
