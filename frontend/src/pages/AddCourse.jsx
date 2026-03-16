import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Youtube, Calendar, Calculator, Sparkles, Loader2, Trash2, CheckCircle } from 'lucide-react';

const AddCourse = () => {
    const navigate = useNavigate();
    const [platform, setPlatform] = useState('youtube');
    const [playlistLink, setPlaylistLink] = useState('');
    const [startDate, setStartDate] = useState('');
    const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default (0=Sun, 6=Sat)
    const [lecturesPerWorkDay, setLecturesPerWorkDay] = useState(2);
    const [lecturesPerWeekend, setLecturesPerWeekend] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [calculation, setCalculation] = useState(null);
    const [error, setError] = useState(null);

    const [allCourses, setAllCourses] = useState([]);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/courses`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setAllCourses(data);
            }
        } catch (err) {
            console.error("Failed to fetch courses", err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course and all its progress?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCourses();
            } else {
                alert("Failed to delete course");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Calculate completion status manually if not explicit on the Course model
    // A course is completed if all its lecture items are completed
    const activeCourses = allCourses.filter(c => {
        if (!c.lectureItems || c.lectureItems.length === 0) return true;
        return c.lectureItems.some(l => !l.isCompleted);
    });

    const completedCourses = allCourses.filter(c => {
        if (!c.lectureItems || c.lectureItems.length === 0) return false;
        return c.lectureItems.every(l => l.isCompleted);
    });

    const daysOfWeek = [
        { id: 1, label: 'Mon' },
        { id: 2, label: 'Tue' },
        { id: 3, label: 'Wed' },
        { id: 4, label: 'Thu' },
        { id: 5, label: 'Fri' },
        { id: 6, label: 'Sat' },
        { id: 0, label: 'Sun' },
    ];

    const handleWorkingDayToggle = (id) => {
        setWorkingDays(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/youtube/fetch-playlist`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playlistUrl: playlistLink })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to fetch playlist");
            }

            const data = await res.json();
            const totalVideos = data.totalVideos;

            if (totalVideos === 0) throw new Error("Playlist is empty or unavailable");

            const videosPerWeek = (workingDays.length * lecturesPerWorkDay) + ((7 - workingDays.length) * lecturesPerWeekend);

            if (videosPerWeek <= 0) {
                throw new Error("You must schedule at least 1 video per week.");
            }

            const weeksNeeded = Math.ceil(totalVideos / videosPerWeek);
            const totalDays = weeksNeeded * 7;

            // Calculate actual end date from start date
            const start = startDate ? new Date(startDate) : new Date();
            const end = new Date(start.getTime() + (totalDays * 24 * 60 * 60 * 1000));

            setCalculation({
                playlistTitle: data.title,
                totalVideos: totalVideos,
                estimatedDays: totalDays,
                completionDate: end.toLocaleDateString(),
                videosInfo: data.videos
            });

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmCourse = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/youtube/save-course`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platform,
                    playlistUrl: playlistLink,
                    startDate: startDate || new Date().toISOString(),
                    workingDays,
                    lecturesPerWorkDay,
                    lecturesPerWeekend,
                    videos: calculation.videosInfo
                })
            });

            if (!res.ok) throw new Error("Failed to save course");

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout maxW="max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Plan New Course</h1>
            <p className="mb-8 opacity-60">Turn a massive playlist into daily, actionable steps.</p>

            <div className="p-8 rounded-sm border shadow-sm" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>
                {error && (
                    <div className="mb-6 p-4 rounded-sm border border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-sm font-semibold">
                        Error: {error}
                    </div>
                )}

                <form onSubmit={handleCalculate} className="space-y-8">
                    {/* Platform Selection */}
                    <div>
                        <label className="block text-sm font-semibold mb-3">1. Select Platform</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                className={`flex items-center gap-2 px-6 py-3 rounded-sm border transition-all ${platform === 'youtube' ? 'border-black dark:border-white bg-black/5 dark:bg-white/10' : 'border-transparent bg-gray-100 dark:bg-gray-800 opacity-60'}`}
                                onClick={() => setPlatform('youtube')}
                            >
                                <Youtube className="text-red-500" /> YouTube
                            </button>
                            <div className="flex items-center gap-2 px-6 py-3 rounded-sm border border-dashed border-gray-200 dark:border-gray-800 opacity-40 cursor-not-allowed">
                                More coming soon
                            </div>
                        </div>
                    </div>

                    {/* Playlist Link */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">2. Playlist Link</label>
                        <input
                            type="url"
                            placeholder="https://www.youtube.com/playlist?list=..."
                            value={playlistLink}
                            onChange={e => setPlaylistLink(e.target.value)}
                            className="w-full p-3 rounded-sm bg-transparent border outline-none focus:ring-2 ring-black dark:ring-white transition-all text-sm"
                            style={{ borderColor: 'var(--border-color)' }}
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Scheduling Limits */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">3. Workload Limits</label>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 border rounded-sm" style={{ borderColor: 'var(--border-color)' }}>
                                    <span className="text-sm">Lectures on Working Days</span>
                                    <input type="number" min="0" max="10" value={lecturesPerWorkDay} onChange={e => setLecturesPerWorkDay(Number(e.target.value))} className="w-16 p-1 text-center border rounded-sm bg-transparent" />
                                </div>
                                <div className="flex justify-between items-center p-3 border rounded-sm" style={{ borderColor: 'var(--border-color)' }}>
                                    <span className="text-sm">Lectures on Weekends</span>
                                    <input type="number" min="0" max="10" value={lecturesPerWeekend} onChange={e => setLecturesPerWeekend(Number(e.target.value))} className="w-16 p-1 text-center border rounded-sm bg-transparent" />
                                </div>
                            </div>
                        </div>

                        {/* Working Days & Start Date */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">4. Schedule Setup</label>
                            <div className="mb-4">
                                <div className="flex items-center justify-between border rounded-sm overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                                    {daysOfWeek.map(day => (
                                        <button
                                            key={day.id}
                                            type="button"
                                            onClick={() => handleWorkingDayToggle(day.id)}
                                            className={`flex-1 py-3 text-xs font-semibold transition-colors ${workingDays.includes(day.id) ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs mt-2 opacity-50">Selected days are your 'Working Days'</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1 opacity-70">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full p-2.5 rounded-sm bg-transparent border outline-none focus:ring-1 ring-black dark:ring-white text-sm"
                                    style={{ borderColor: 'var(--border-color)' }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <div className="pt-4 flex justify-end">
                        <button disabled={isLoading} type="submit" className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-sm font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
                            {isLoading ? 'Calculating...' : 'Calculate Schedule'}
                        </button>
                    </div>
                </form>

                {/* Results Area */}
                {calculation && !isLoading && (
                    <div className="mt-8 p-6 rounded-sm border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 transition-all">
                        <h3 className="text-lg font-bold mb-1 flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Sparkles size={20} /> Schedule Generated
                        </h3>
                        <p className="text-sm font-medium opacity-70 mb-5">{calculation.playlistTitle}</p>

                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <div>
                                <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Total Videos</p>
                                <p className="text-2xl font-mono font-bold">{calculation.totalVideos}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Duration</p>
                                <p className="text-2xl font-mono font-bold">{calculation.estimatedDays} Days</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Target Completion</p>
                                <p className="text-lg font-mono font-bold pt-1">{calculation.completionDate}</p>
                            </div>
                        </div>
                        <button onClick={handleConfirmCourse} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-sm transition-colors text-sm">
                            Confirm & Add to Daily Chain
                        </button>
                    </div>
                )}
            </div>

            {/* Courses Lists */}
            <div className="mt-12 space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        Running Courses <span className="text-xs bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-full">{activeCourses.length}</span>
                    </h2>
                    {activeCourses.length === 0 ? (
                        <p className="text-sm opacity-60 p-4 border border-dashed rounded-sm border-gray-300 dark:border-gray-700">No active courses. Plan one above.</p>
                    ) : (
                        <div className="grid gap-4">
                            {activeCourses.map(course => (
                                <div key={course.id} className="flex justify-between items-center p-4 rounded-sm border shadow-sm" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>
                                    <div>
                                        <h3 className="font-semibold">{course.platform === 'youtube' ? 'YouTube Playlist Course' : 'Custom Course'}</h3>
                                        <p className="text-xs opacity-60">{new Date(course.startDate).toLocaleDateString()} - {course.lectureItems?.length} lectures</p>
                                    </div>
                                    <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        Completed Courses <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-full">{completedCourses.length}</span>
                    </h2>
                    {completedCourses.length === 0 ? (
                        <p className="text-sm opacity-60 p-4 border border-dashed rounded-sm border-gray-300 dark:border-gray-700">No completed courses yet. Keep grinding!</p>
                    ) : (
                        <div className="grid gap-4">
                            {completedCourses.map(course => (
                                <div key={course.id} className="flex justify-between items-center bg-green-50/50 dark:bg-green-950/10 p-4 rounded-sm border border-green-100 dark:border-green-900 shadow-sm opacity-80">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500" size={20} />
                                        <div>
                                            <h3 className="font-semibold text-green-800 dark:text-green-400">{course.platform === 'youtube' ? 'YouTube Playlist Course' : 'Custom Course'}</h3>
                                            <p className="text-xs opacity-60">{course.lectureItems?.length} lectures completed</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </Layout>
    );
};

export default AddCourse;
