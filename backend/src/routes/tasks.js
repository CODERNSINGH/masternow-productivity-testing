import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// GET all tasks for user
router.get('/', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { userId: req.user.id },
            orderBy: { order: 'asc' }
        });
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// POST new task
router.post('/', async (req, res) => {
    try {
        const { title, description, status, dueDate, link, order } = req.body;

        // Find highest order if order is not provided
        let currentOrder = order;
        if (currentOrder === undefined) {
            const lastTask = await prisma.task.findFirst({
                where: { userId: req.user.id, status: status || 'todo' },
                orderBy: { order: 'desc' }
            });
            currentOrder = lastTask ? lastTask.order + 1000 : 1000;
        }

        const task = await prisma.task.create({
            data: {
                userId: req.user.id,
                title,
                description,
                status: status || 'todo',
                dueDate: dueDate ? new Date(dueDate) : null,
                link,
                order: currentOrder
            }
        });
        res.status(201).json(task);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Failed to create task" });
    }
});

// PUT update a task
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, dueDate, link, order, isCompleted } = req.body;

        const task = await prisma.task.findUnique({ where: { id } });
        if (!task || task.userId !== req.user.id) {
            return res.status(404).json({ error: "Task not found" });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                status,
                dueDate: dueDate ? new Date(dueDate) : null,
                link,
                order,
                isCompleted
            }
        });
        res.json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task || task.userId !== req.user.id) {
            return res.status(404).json({ error: "Task not found" });
        }

        await prisma.task.delete({ where: { id } });
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

export default router;
