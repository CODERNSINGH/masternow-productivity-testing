import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Flame, Code2, Terminal, Network, Shield, Loader, CheckCircle2 } from 'lucide-react';

const StreakMaker = () => {
    const [handles, setHandles] = useState({
        leetcode: '',
        github: '',
        codeforces: '',
        gfg: '',
        codechef: '',
        hackerrank: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [streakData, setStreakData] = useState({ streakCount: 0, isActiveToday: false });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/streak`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStreakData({
                        streakCount: data.streakCount || 0,
                        isActiveToday: data.isActiveToday || false
                    });
                    setHandles({
                        leetcode: data.leetcodeHandle || '',
                        github: data.githubHandle || '',
                        codeforces: data.codeforcesHandle || '', // Will be added to backend
                        gfg: data.gfgHandle || '',
                        codechef: data.codechefHandle || '',
                        hackerrank: data.hackerrankHandle || ''
                    });
                }
            } catch (err) {
                console.error("Failed to fetch streak data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSaveConnections = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                leetcodeHandle: handles.leetcode || undefined,
                githubHandle: handles.github || undefined,
                codeforcesHandle: handles.codeforces || undefined,
                gfgHandle: handles.gfg || undefined,
                codechefHandle: handles.codechef || undefined,
                hackerrankHandle: handles.hackerrank || undefined,
            };

            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/streak/handles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Handles connected successfully!' });

                // Refetch streak data after update to reflect new connections
                const newRes = await fetch(`https://masternow-productivity-testing.onrender.com/api/streak`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (newRes.ok) {
                    const newData = await newRes.json();
                    setStreakData({
                        streakCount: newData.streakCount || 0,
                        isActiveToday: newData.isActiveToday || false
                    });
                }
            } else {
                setMessage({ type: 'error', text: 'Failed to update handles.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred during save.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (platform, value) => {
        setHandles(prev => ({ ...prev, [platform]: value }));
    };

    const platforms = [
        { id: 'leetcode', name: 'LeetCode', icon: <Code2 size={20} className="text-yellow-600 dark:text-yellow-500" /> },
        { id: 'github', name: 'GitHub', icon: <Network size={20} className="text-gray-900 dark:text-white" /> },
        { id: 'codeforces', name: 'Codeforces', icon: <Terminal size={20} className="text-blue-600 dark:text-blue-500" /> },
        { id: 'gfg', name: 'GeeksForGeeks', icon: <Shield size={20} className="text-green-600 dark:text-green-500" /> },
        { id: 'codechef', name: 'CodeChef', icon: <Code2 size={20} className="text-orange-800 dark:text-orange-500" /> },
        { id: 'hackerrank', name: 'HackerRank', icon: <Terminal size={20} className="text-green-500" /> }
    ];

    return (
        <Layout maxW="max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Streak Maker</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl">
                        Connect your coding platforms. Solve at least one problem across any platform daily to maintain your master streak.
                    </p>
                </div>

                <div className={`flex flex-col items-center justify-center p-4 rounded-lg border-2" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }} shadow-sm min-w-[150px]`}>
                    <Flame size={32} className={`mb-2 ${streakData.isActiveToday ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-gray-400 dark:text-gray-600'}`} />
                    <div className="text-3xl font-black mb-1">{streakData.streakCount}</div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60">Day Streak</div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20 opacity-50">
                    <Loader className="animate-spin mr-3" /> Loading connections...
                </div>
            ) : (
                <div className="rounded-xl border shadow-sm p-6 md:p-8" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>

                    {message && (
                        <div className={`px-4 py-3 rounded-md mb-6 flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900/50' : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : null}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSaveConnections}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {platforms.map(platform => (
                                <div key={platform.id} className="flex flex-col">
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-2 ml-1 opacity-80">
                                        {platform.icon}
                                        {platform.name}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={handles[platform.id]}
                                            onChange={(e) => handleInputChange(platform.id, e.target.value)}
                                            placeholder={`${platform.name} username...`}
                                            className="w-full border text-sm rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent block px-4 py-3 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium"
                                            style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                                        />
                                        {handles[platform.id] && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-green-100 dark:bg-green-900/60 p-1">
                                                <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t flex justify-end" style={{ borderColor: 'var(--border-color)' }}>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider text-sm rounded-lg hover:scale-[1.02] transition-transform shadow-md flex items-center justify-center min-w-[160px] ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? <><Loader size={16} className="animate-spin mr-2" /> Saving...</> : 'Save Connections'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </Layout>
    );
};

export default StreakMaker;
