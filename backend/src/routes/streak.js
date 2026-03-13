import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Simple GraphQL query builder for LeetCode
const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';

const getLeetCodeData = async (username) => {
    const query = `
    query userProfileCalendar($username: String!, $year: Int) {
      matchedUser(username: $username) {
        userCalendar(year: $year) {
          activeYears
          streak
          totalActiveDays
          dccBadges {
            timestamp
            badge {
              name
              icon
            }
          }
          submissionCalendar
        }
      }
    }
  `;
    const variables = { username };
    try {
        const res = await fetch(LEETCODE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com',
            },
            body: JSON.stringify({ query, variables })
        });
        if (!res.ok) throw new Error("Failed to fetch LeetCode data");
        const data = await res.json();
        return data.data?.matchedUser?.userCalendar?.submissionCalendar;
    } catch (e) {
        console.error("LeetCode fetch error:", e);
        return null;
    }
};

const getGitHubData = async (username) => {
    try {
        const res = await fetch(`https://api.github.com/users/${username}/events/public`);
        if (!res.ok) throw new Error("Failed to fetch Github Data");
        const data = await res.json();
        // Return pushing events in recent time
        const pushEvents = data.filter(event => event.type === 'PushEvent');
        return pushEvents;
    } catch (e) {
        console.error("GitHub fetch error:", e);
        return null;
    }
}

// Function to check if there is activity today based on Unix timestamps mapping from platforms
const hasActivityToday = (lcCalendarStr, ghEvents) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let active = false;

    // Check LeetCode
    if (lcCalendarStr) {
        try {
            const calendar = JSON.parse(lcCalendarStr);
            // LeetCode submissionCalendar is a map of unix epoch timestamp -> count
            for (const [timestampStr, count] of Object.entries(calendar)) {
                if (count > 0) {
                    const dateStr = new Date(parseInt(timestampStr) * 1000).toISOString().split('T')[0];
                    if (dateStr === todayStr) {
                        active = true;
                        break;
                    }
                }
            }
        } catch (e) { }
    }

    // Check GitHub
    if (!active && ghEvents && ghEvents.length > 0) {
        for (const event of ghEvents) {
            const dateStr = new Date(event.created_at).toISOString().split('T')[0];
            if (dateStr === todayStr) {
                active = true;
                break;
            }
        }
    }

    return active;
};

// Update and get user streak data
router.get('/', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let isStreakUpdated = false;
        let isActiveToday = false;
        let lcCalendar = null;
        let ghEvents = null;

        // Fetch external data if handles exist
        if (user.leetcodeHandle) {
            lcCalendar = await getLeetCodeData(user.leetcodeHandle);
        }
        if (user.githubHandle) {
            ghEvents = await getGitHubData(user.githubHandle);
        }

        isActiveToday = hasActivityToday(lcCalendar, ghEvents);

        // Calculate Streak logic
        let newStreak = user.currentStreak || 0;
        let lastActive = user.lastActiveDate;
        const todayStr = new Date().toISOString().split('T')[0];
        const lastActiveStr = lastActive ? new Date(lastActive).toISOString().split('T')[0] : null;

        if (isActiveToday) {
            if (lastActiveStr !== todayStr) {
                // If the last activity was exactly yesterday, increment. Otherwise, reset to 1
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastActiveStr === yesterdayStr) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }
                lastActive = new Date();
                isStreakUpdated = true;
            }
        } else {
            // Check if it's broken (last active was before yesterday)
            if (lastActiveStr) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                const lastActiveDateObj = new Date(lastActiveStr);
                const yesterdayDateObj = new Date(yesterdayStr);

                if (lastActiveDateObj < yesterdayDateObj) {
                    newStreak = 0;
                    isStreakUpdated = true;
                }
            }
        }

        if (isStreakUpdated) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    currentStreak: newStreak,
                    lastActiveDate: lastActive
                }
            });
        }

        res.json({
            streakCount: newStreak,
            isActiveToday: isActiveToday,
            leetcodeHandle: user.leetcodeHandle,
            githubHandle: user.githubHandle,
            codeforcesHandle: user.codeforcesHandle,
            gfgHandle: user.gfgHandle,
            codechefHandle: user.codechefHandle,
            hackerrankHandle: user.hackerrankHandle,
            lastActiveDate: lastActive
        });

    } catch (error) {
        console.error('Streak update error:', error);
        res.status(500).json({ error: 'Failed to fetch streak data' });
    }
});

// Update handles
router.post('/handles', requireAuth, async (req, res) => {
    try {
        const { leetcodeHandle, githubHandle, codeforcesHandle, gfgHandle, codechefHandle, hackerrankHandle } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                leetcodeHandle: leetcodeHandle !== undefined ? leetcodeHandle : undefined,
                githubHandle: githubHandle !== undefined ? githubHandle : undefined,
                codeforcesHandle: codeforcesHandle !== undefined ? codeforcesHandle : undefined,
                gfgHandle: gfgHandle !== undefined ? gfgHandle : undefined,
                codechefHandle: codechefHandle !== undefined ? codechefHandle : undefined,
                hackerrankHandle: hackerrankHandle !== undefined ? hackerrankHandle : undefined
            }
        });

        res.json({ message: 'Handles successfully updated', user: updatedUser });
    } catch (error) {
        console.error('Handle update error:', error);
        res.status(500).json({ error: 'Failed to update handles' });
    }
});

export default router;
