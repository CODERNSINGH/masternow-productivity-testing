import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db.js';
import passport from './passportConfig.js';
import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import youtubeRoutes from './routes/youtube.js';
import driveRoutes from './routes/drive.js';
import calendarRoutes from './routes/calendar.js';
import coursesRoutes from './routes/courses.js';
import streakRoutes from './routes/streak.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use('/auth', authRoutes);

app.use('/api/tasks', tasksRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/streak', streakRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
