import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Flame, PlayCircle, Plus, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
const Dashboard = () => {
    const [courseDays, setCourseDays] = useState([]);
    const [openDays, setOpenDays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCourseTitle, setActiveCourseTitle] = useState('Your Journey');
    const [courseId, setCourseId] = useState(null);
    const [addMenuOpenForDay, setAddMenuOpenForDay] = useState(null);
    const [uploadingDay, setUploadingDay] = useState(null);
    const [linkInputDay, setLinkInputDay] = useState(null);
    const [linkInputUrl, setLinkInputUrl] = useState('');
    const [streakCount, setStreakCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const fetchCoursesToReload = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) setIsLoggedIn(true);
            if (!token) return;
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/courses`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    const recentCourse = data[0];
                    setCourseId(recentCourse.id);
                    setActiveCourseTitle(data.length > 1 ? 'Your Active Courses' : (recentCourse.platform === 'youtube' ? 'YouTube Course' : 'Your Journey'));
                    
                    const daysMap = {};
                    
                    // Iterate through all courses to merge their lectures by date
                    data.forEach(course => {
                        course.lectureItems.forEach((lecture) => {
                            const dateObj = new Date(lecture.assignedDate);
                            const dateStr = dateObj.toLocaleDateString();
                            if (!daysMap[dateStr]) {
                                daysMap[dateStr] = {
                                    id: dateStr, title: dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
                                    isCompleted: true, dateVal: dateObj.getTime(), lectures: []
                                };
                            }
                            let videoId = 'default';
                            try { videoId = new URL(lecture.videoUrl).searchParams.get('v') || 'default'; } catch (e) { }

                            daysMap[dateStr].lectures.push({
                                id: lecture.id, title: lecture.title || 'Lecture', duration: lecture.videoUrl ? 'Video' : 'Note',
                                completed: lecture.isCompleted,
                                notes: lecture.driveNoteLink && !lecture.videoUrl ? '📝 Shared via Drive' : lecture.description?.substring(0, 100) + '...',
                                thumbnail: lecture.driveNoteLink && !lecture.videoUrl ? 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=400&h=225&fit=crop' : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                                driveNoteLink: lecture.driveNoteLink,
                                videoUrl: lecture.videoUrl
                            });

                            if (!lecture.isCompleted) daysMap[dateStr].isCompleted = false;
                        });
                    });

                    const formattedDays = Object.values(daysMap).sort((a, b) => a.dateVal - b.dateVal);
                    formattedDays.forEach((day, idx) => {
                        day.dayNumber = idx + 1;
                        if (idx === 0) day.isUnlocked = true;
                        else day.isUnlocked = formattedDays[idx - 1].isCompleted;
                    });
                    setCourseDays(formattedDays);

                    setOpenDays(prev => {
                        if (prev.length === 0) {
                            const firstActiveDay = formattedDays.find(d => !d.isCompleted && d.isUnlocked) || formattedDays[formattedDays.length - 1];
                            return firstActiveDay ? [firstActiveDay.id] : [];
                        }
                        return prev;
                    });
                }
            }
        } catch (err) { }
    };

    const fetchStreak = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/streak`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setStreakCount(data.streakCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch streak:", err);
        }
    };

    React.useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([fetchCoursesToReload(), fetchStreak()]);
            setIsLoading(false);
        };
        init();
    }, []);

    const handleToggleComplete = async (lectureId, currentCompletedStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !currentCompletedStatus;

            // Optimistic update
            setCourseDays(prevDays => {
                let nextDayToUnlock = null;
                const newDays = prevDays.map((day, idx) => {
                    const updatedLectures = day.lectures.map(lec =>
                        lec.id === lectureId ? { ...lec, completed: newStatus } : lec
                    );
                    const allCompleted = updatedLectures.length > 0 && updatedLectures.every(l => l.completed);

                    // If this day just got completed and there is a next day
                    if (allCompleted && !day.isCompleted && newStatus === true) {
                        if (idx + 1 < prevDays.length) nextDayToUnlock = prevDays[idx + 1].id;
                    }

                    return { ...day, lectures: updatedLectures, isCompleted: allCompleted };
                });

                // Update isUnlocked based on sequential logic
                newDays.forEach((day, idx) => {
                    if (idx === 0) day.isUnlocked = true;
                    else day.isUnlocked = newDays[idx - 1].isCompleted;
                });

                if (nextDayToUnlock) {
                    setOpenDays(prev => prev.includes(nextDayToUnlock) ? prev : [...prev, nextDayToUnlock]);
                }

                return newDays;
            });

            // API Call
            await fetch(`https://masternow-productivity-testing.onrender.com/api/courses/lecture/${lectureId}/complete`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: newStatus })
            });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const toggleDay = (dayId) => {
        setOpenDays(prev =>
            prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
        );
    };

    const handleUploadAdHocFile = async (e, day) => {
        const file = e.target.files[0];
        if (!file || !courseId) return;

        try {
            setUploadingDay(day.id);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            // 1. Upload to drive
            const uploadRes = await fetch(`https://masternow-productivity-testing.onrender.com/api/drive/upload-file`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!uploadRes.ok) throw new Error("Upload Failed");
            const uploadData = await uploadRes.json();

            // 2. Create ad-hoc lecture
            await fetch(`https://masternow-productivity-testing.onrender.com/api/courses/lecture`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    assignedDate: day.dateVal,
                    title: file.name,
                    driveNoteLink: uploadData.webViewLink
                })
            });

            await fetchCoursesToReload();
            alert("File synced to Drive and added to schedule!");
            setAddMenuOpenForDay(null);
        } catch (err) {
            console.error(err);
            alert("Failed to upload file");
        } finally {
            setUploadingDay(null);
        }
    };

    const submitAdHocLink = async (day) => {
        if (!linkInputUrl.trim() || !courseId) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://masternow-productivity-testing.onrender.com/api/courses/lecture`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    assignedDate: day.dateVal,
                    title: "Added Video Link",
                    videoUrl: linkInputUrl
                })
            });
            await fetchCoursesToReload();
            setLinkInputUrl('');
            setLinkInputDay(null);
            setAddMenuOpenForDay(null);
        } catch (err) {
            console.error(err);
            alert("Failed to add link");
        }
    };

    return (
        <Layout maxW="max-w-4xl">
            {/* Header Area Centered */}
            <div className="flex flex-col items-center justify-center text-center mb-16 mt-8">
                <div className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-sm font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 mb-6 shadow-sm">
                    <Flame size={20} />
                    {streakCount} Day Streak
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-3">{activeCourseTitle}</h1>
                <p className="text-lg font-medium" style={{ opacity: 0.6 }}>Follow the path node by node.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center flex-col items-center py-20 opacity-50">
                    <div className="w-8 h-8 rounded-full border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent animate-spin mb-4"></div>
                    Loading your journey...
                </div>
            ) : !isLoggedIn ? (
                <div className="flex justify-center flex-col items-center py-20 opacity-90 rounded-sm border shadow-sm" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold mb-2">Welcome to Masternow</h2>
                    <p className="mb-6 text-sm opacity-70">Please log in to view your courses and daily tasks.</p>
                    <a href={`${import.meta.env.VITE_API_BASE_URL || 'https://masternow-productivity-testing.onrender.com'}/auth/google?frontendUrl=${window.location.origin}`} className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-bold text-sm rounded-md shadow-lg hover:-translate-y-0.5 transition-transform flex items-center gap-2">
                        Log in with Google
                    </a>
                </div>
            ) : courseDays.length === 0 ? (
                <div className="flex justify-center flex-col items-center py-20 opacity-60 rounded-sm border" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>
                    <p className="mb-4">You have no active courses scheduled.</p>
                    <Link to="/add-course" className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-sm rounded-sm hover:scale-105 transition-transform">
                        Add a Course
                    </Link>
                </div>
            ) : (
                <>
                    {/* Centered Thread UI */}
                    <div className="relative w-full flex flex-col items-center pb-20">

                        {/* The Vertical Thread Line */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200 dark:bg-gray-800 z-0"></div>

                        {courseDays.map((day, index) => {
                            const isOpen = openDays.includes(day.id);

                            return (
                                <div key={day.id} className="relative w-full flex flex-col items-center mb-12 z-10">

                                    {/* Node (Day Indicator) */}
                                    <button
                                        onClick={() => day.isUnlocked && toggleDay(day.id)}
                                        disabled={!day.isUnlocked}
                                        className={`flex flex-col items-center justify-center p-2 transition-transform cursor-pointer disabled:cursor-not-allowed z-20 hover:scale-105
                                   ${!day.isUnlocked ? 'opacity-50' : ''}`}
                                        style={{ backgroundColor: 'var(--component-bg)' }}
                                    >
                                        <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-md border-4 border-white dark:border-[#191919]
                                   ${day.isCompleted ? 'bg-black text-white dark:bg-white dark:text-black' :
                                                day.isUnlocked ? 'bg-gray-100 text-gray-900 shadow-lg ring-4 ring-black/10 dark:ring-white/10' :
                                                    'bg-gray-200 text-gray-500 border-dashed'}`}
                                            // Handle dynamically changing dark mode bg for unlocked states that aren't completed using style
                                            style={(!day.isCompleted && day.isUnlocked) || (!day.isCompleted && !day.isUnlocked) ? { backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' } : {}}
                                        >
                                            <span className="text-xs font-bold tracking-widest uppercase opacity-70 mb-0.5">Day</span>
                                            <span className="text-xl font-black leading-none">{day.dayNumber}</span>
                                        </div>
                                        <h3 className="mt-3 font-bold text-center px-4 py-1 rounded-sm bg-black/5 dark:bg-white/5 text-sm backdrop-blur-sm text-gray-900 dark:text-gray-100">
                                            {day.title}
                                        </h3>
                                    </button>

                                    {/* Content (Lectures) that expands immediately below the node, centered */}
                                    {isOpen && (
                                        <div className="w-full mt-6 rounded-sm border shadow-xl p-2 relative z-10 mx-auto animate-in fade-in slide-in-from-top-4" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)', maxWidth: '42rem' }}>
                                            {day.lectures.map((lecture, i) => (
                                                <div key={lecture.id} className={`flex flex-col p-4 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 group transition-colors ${i !== day.lectures.length - 1 ? 'border-b' : ''}`} style={{ borderColor: 'var(--border-color)' }}>

                                                    <div className="flex gap-4 w-full">
                                                        {/* Checkbox */}
                                                        <div className="pt-1 shrink-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={lecture.completed}
                                                                onChange={() => handleToggleComplete(lecture.id, lecture.completed)}
                                                                className="w-5 h-5 rounded-sm border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                                                            />
                                                        </div>

                                                        {/* Thumbnail */}
                                                        <div className="w-32 h-20 rounded-sm overflow-hidden shrink-0 relative shadow-sm border" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>
                                                            <img src={lecture.thumbnail} alt={lecture.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
                                                                {lecture.duration}
                                                            </div>
                                                        </div>


                                                                                                                <div className="flex-1 min-w-0">
                                                                                                                    <div className="flex justify-between items-start gap-2">
                                                                                                                        <span className={`font-semibold text-base leading-tight block truncate text-gray-900 dark:text-gray-100 ${lecture.completed ? 'opacity-40 line-through' : ''}`}>
                                                                                                                            {lecture.title}
                                                                                                                        </span>
                                                                                                                        {lecture.driveNoteLink && !lecture.videoUrl ? (
                                                                                                                            <a href={lecture.driveNoteLink} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-blue-500 text-white px-3 py-1.5 rounded-sm hover:scale-105 transition-transform shadow-sm">
                                                                                                                                <ExternalLink size={14} /> Open Note
                                                                                                                            </a>
                                                                                                                        ) : (
                                                                                                                            <Link to={`/lecture/${lecture.id}`} className="shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-sm hover:scale-105 transition-transform shadow-sm">
                                                                                                                                <PlayCircle size={14} /> Play
                                                                                                                            </Link>
                                                                                                                        )}
                                                                                                                    </div>

                                                                                                                    {/* Sample Notes Section */}
                                                            <div className="mt-2 text-sm p-2 rounded-sm border line-clamp-2" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                                                                {lecture.notes ? (
                                                                    <div className="flex items-center gap-2"><FileText size={14} className="opacity-70" /><strong className="font-medium" style={{ color: 'var(--text-color)' }}>Notes snippet:</strong> {lecture.notes}</div>
                                                                ) : (
                                                                    <span className="opacity-50 italic">No notes created yet. Watch the tutorial to add notes.</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* ADD CONTENT UI */}
                                            {addMenuOpenForDay === day.id ? (
                                                <div className="flex gap-2 w-full justify-center px-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                                    <label className={`cursor-pointer px-3 py-1.5 text-xs font-bold bg-black text-white dark:bg-white dark:text-black rounded hover:opacity-80 transition-opacity ${uploadingDay === day.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        {uploadingDay === day.id ? 'Saving to Drive...' : 'Upload File to Drive'}
                                                        <input type="file" className="hidden" disabled={uploadingDay === day.id} onChange={(e) => handleUploadAdHocFile(e, day)} />
                                                    </label>

                                                    {linkInputDay === day.id ? (
                                                        <div className="flex gap-2">
                                                            <input type="text" placeholder="Paste Video Link" className="px-2 py-1 text-xs border rounded text-black bg-white" value={linkInputUrl} onChange={e => setLinkInputUrl(e.target.value)} />
                                                            <button onClick={() => submitAdHocLink(day)} className="px-3 py-1.5 text-xs font-bold bg-green-500 text-white rounded hover:opacity-80">Save</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setLinkInputDay(day.id)} className="px-3 py-1.5 text-xs font-bold border border-black dark:border-white rounded text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                                            Add Video Link
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-3 border-t flex justify-center" style={{ borderColor: 'var(--border-color)' }}>
                                                    <button onClick={() => setAddMenuOpenForDay(day.id)} className="flex items-center gap-2 text-sm font-bold tracking-wide" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                                                        <Plus size={16} /> ADD CONTENT
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* End of Thread cap */}
                        <div className="w-3 h-3 rounded-full relative z-10 border-2" style={{ backgroundColor: 'var(--border-color)', borderColor: 'var(--component-bg)' }}></div>
                    </div>
                </>
            )}

            {/* Lecture Modal Overlay Removed: Opens in new tab instead */}
        </Layout>
    );
};

export default Dashboard;
