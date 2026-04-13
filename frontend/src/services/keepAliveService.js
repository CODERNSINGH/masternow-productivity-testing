// Keep-Alive Service to prevent Render server from spinning down
// Calls the API every 14 minutes to keep the server active

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds
let keepAliveIntervalId = null;

export const startKeepAlive = () => {
    // Initial call immediately
    pingServer();

    // Set up interval to ping every 14 minutes
    keepAliveIntervalId = setInterval(() => {
        pingServer();
    }, KEEP_ALIVE_INTERVAL);

    console.log('Keep-alive service started - pinging server every 14 minutes');
};

export const stopKeepAlive = () => {
    if (keepAliveIntervalId) {
        clearInterval(keepAliveIntervalId);
        keepAliveIntervalId = null;
        console.log('Keep-alive service stopped');
    }
};

const pingServer = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            console.log('[Keep-Alive] Server pinged successfully at', new Date().toLocaleTimeString());
        } else {
            console.warn('[Keep-Alive] Server ping returned status:', response.status);
        }
    } catch (error) {
        console.error('[Keep-Alive] Failed to ping server:', error);
    }
};

export default {
    startKeepAlive,
    stopKeepAlive,
};
