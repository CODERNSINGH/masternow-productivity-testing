import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Settings as SettingsIcon, Link as LinkIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Settings = () => {
    const [connections, setConnections] = useState({
        google: false,
        drive: false,
        calendar: false
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkConnections = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Example: Fetch user details to see if google access token exists
                const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/streak`, { // Re-using streak route just to get user data if it has tokens
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // In a real implementation we would have a specific /api/settings endpoint
                // We'll simulate checking the tokens for now
                setConnections({
                    google: true, // If they are logged in via Google OAuth
                    drive: true,  // Requires Drive scopes
                    calendar: true // Requires Calendar scopes
                });

            } catch (error) {
                console.error("Failed to fetch connection status", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkConnections();
    }, []);

    const ConnectCard = ({ title, description, iconSrc, isConnected, onConnect }) => (
        <div className="p-6 rounded-lg border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-md flex items-center justify-center ${isConnected ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-500' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    <img src={iconSrc} alt={`${title} logo`} className="w-6 h-6 object-contain" />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1">{title}</h3>
                    <p className="text-sm opacity-60 max-w-sm">{description}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isConnected ? 'text-green-600 dark:text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {isConnected ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {isConnected ? 'Connected' : 'Not Connected'}
                </div>
                {!isConnected && (
                    <button onClick={onConnect} className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-sm text-sm font-semibold hover:opacity-80 transition-opacity ml-auto sm:ml-0">
                        Connect
                    </button>
                )}
                {isConnected && (
                    <button className="px-4 py-2 border border-red-200 text-red-600 dark:border-red-900 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-sm text-sm font-semibold transition-colors ml-auto sm:ml-0">
                        Disconnect
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <Layout maxW="max-w-4xl">
            <div className="mb-10 flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
                    <SettingsIcon size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-1">Platform Settings</h1>
                    <p className="text-sm opacity-60">Manage your integrations and app preferences.</p>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <LinkIcon size={20} className="opacity-70" /> Integrations
                    </h2>
                    <div className="grid gap-4">
                        <ConnectCard
                            title="Google Account"
                            description="Core authentication. Required for signing into Masternow."
                            iconSrc="/assets/google-icon-logo-svgrepo-com.svg"
                            isConnected={connections.google}
                        />
                        <ConnectCard
                            title="Google Drive"
                            description="Sync your markdown notes automatically to a dedicated Drive folder."
                            iconSrc="/assets/google-drive-svgrepo-com.svg"
                            isConnected={connections.drive}
                        />
                        <ConnectCard
                            title="Google Calendar"
                            description="Push your tasks and deadlines to Google Calendar."
                            iconSrc="/assets/google-calendar-svgrepo-com.svg"
                            isConnected={connections.calendar}
                        />
                        <ConnectCard
                            title="YouTube API"
                            description="Provides rich data parsing from Playlists to generate daily tracking."
                            iconSrc="/assets/youtube-icon-svgrepo-com.svg"
                            isConnected={true} // Defaulting to true as it acts server-side
                        />
                    </div>
                </section>

                <section className="pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600 dark:text-red-500">
                        <AlertCircle size={20} /> Danger Zone
                    </h2>
                    <div className="border p-6 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>
                        <div>
                            <h3 className="font-bold text-red-800 dark:text-red-400 mb-1">Delete Account</h3>
                            <p className="text-sm text-red-600 dark:text-red-500/70 max-w-md">
                                Permanently delete your Masternow account, including all courses, tasks, and streaks. This action cannot be reversed.
                            </p>
                        </div>
                        <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-sm text-sm font-bold shadow-sm transition-colors whitespace-nowrap">
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Settings;
