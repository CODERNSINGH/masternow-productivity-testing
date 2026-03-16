import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bold, Italic, List, Save, FileUp, X } from 'lucide-react';

const LecturePlayer = ({ lectureId: propLectureId, onClose, courseDays }) => {
    const params = useParams();
    const navigate = useNavigate();
    const id = propLectureId || params.id;
    const isModal = !!propLectureId;

    const [noteContent, setNoteContent] = useState('');
    const [lecture, setLecture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [sameDayLectures, setSameDayLectures] = useState([]);

    useEffect(() => {
        if (!id) return;
        const fetchLectureData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/courses/lecture/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLecture(data);

                    if (!courseDays) {
                        const coursesRes = await fetch(`https://masternow-productivity-testing.onrender.com/api/courses`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (coursesRes.ok) {
                            const courses = await coursesRes.json();
                            const course = courses.find(c => c.id === data.courseId);
                            if (course) {
                                const targetDateStr = new Date(data.assignedDate).toLocaleDateString();
                                const peers = course.lectureItems.filter(l =>
                                    new Date(l.assignedDate).toLocaleDateString() === targetDateStr
                                );
                                setSameDayLectures(peers);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch lecture data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLectureData();

        const savedNote = localStorage.getItem(`lecture-note-${id}`);
        if (savedNote) setNoteContent(savedNote);
        else setNoteContent(''); // Reset on change
    }, [id, courseDays]);

    const handleNoteChange = (e) => {
        setNoteContent(e.target.value);
        localStorage.setItem(`lecture-note-${id}`, e.target.value);
    };

    const insertFormatting = (prefix, suffix = '') => {
        setNoteContent(prev => prev + prefix + suffix);
    };

    const saveToDrive = async () => {
        if (!noteContent.trim()) {
            alert("Note is empty!");
            return;
        }
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/drive/upload-note`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `Masternow Note - Lecture ${id}`,
                    content: noteContent,
                    lectureItemId: id
                })
            });

            if (!res.ok) throw new Error("Failed to upload note");

            const data = await res.json();
            alert("Saved successfully! You can find it in your top level 'Masternow Notes' Drive folder.");
        } catch (err) {
            console.error(err);
            alert("Error saving note: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('lectureItemId', id);

            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/drive/upload-file`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            setLecture(prev => ({ ...prev, driveNoteLink: data.webViewLink }));
            alert("File uploaded and linked to this lecture successfully!");
        } catch (err) {
            console.error(err);
            alert("Error uploading file: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const toggleComplete = async () => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !lecture.isCompleted;
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/courses/lecture/${id}/complete`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isCompleted: newStatus })
            });

            if (res.ok) {
                setLecture(prev => ({ ...prev, isCompleted: newStatus }));
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        else navigate('/dashboard');
    };

    const content = (
        <div className={`flex flex-col ${isModal ? 'h-[90vh] rounded-xl overflow-hidden shadow-2xl border' : 'min-h-screen'}`} style={{ backgroundColor: 'var(--component-bg)', color: 'var(--text-color)', borderColor: isModal ? 'var(--border-color)' : 'transparent' }}>
            <header className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-4">
                    {!isModal && (
                        <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="text-xl font-bold tracking-tight">Focus Player</h1>
                </div>
                {isModal && (
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <X size={20} />
                    </button>
                )}
            </header>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">Loading...</div>
            ) : !lecture ? (
                <div className="flex-1 flex items-center justify-center text-red-500 font-bold">Lecture not found</div>
            ) : (
                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content: Video + Notes */}
                    <div className="flex-1 flex flex-col overflow-y-auto p-6 scroll-smooth">
                        {lecture.videoUrl ? (
                            <div className="w-full aspect-video bg-black rounded-lg mb-6 flex items-center justify-center relative overflow-hidden shadow-xl border" style={{ borderColor: 'var(--border-color)' }}>
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${new URL(lecture.videoUrl).searchParams.get('v')}?autoplay=0&rel=0`}
                                    title={lecture.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="w-full aspect-video bg-black rounded-lg mb-6 flex items-center justify-center text-white/50 relative overflow-hidden">
                                <span className="relative z-10 font-bold tracking-widest text-lg opacity-30">NO VIDEO URL PROVIDED</span>
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-black tracking-tight">{lecture.title || 'Untitled Lecture'}</h2>
                            <button
                                onClick={toggleComplete}
                                className={`px-4 py-2 rounded-sm font-bold text-sm border-2 transition-colors ${lecture.isCompleted ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'border-gray-300 dark:border-gray-600 hover:bg-black/5 dark:hover:bg-white/10'}`}
                            >
                                {lecture.isCompleted ? 'Completed' : 'Mark as Complete'}
                            </button>
                        </div>

                        <p className="text-sm opacity-70 mb-8 border-b pb-8 whitespace-pre-wrap" style={{ borderColor: 'var(--border-color)' }}>
                            {lecture.description || 'No description provided.'}
                        </p>

                        <h3 className="text-xl font-bold mb-4 tracking-tight">Your Notes <span className="text-xs font-normal opacity-50 ml-2">(Markdown Supported)</span></h3>

                        <div className="border rounded-lg overflow-hidden flex flex-col shadow-sm focus-within:ring-2 ring-black dark:ring-white transition-shadow" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                            {/* Toolbar */}
                            <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => insertFormatting('**Bold** ')} className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400" title="Bold"><Bold size={16} /></button>
                                    <button onClick={() => insertFormatting('*Italic* ')} className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400" title="Italic"><Italic size={16} /></button>
                                    <button onClick={() => insertFormatting('- List item\n')} className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400" title="Bullet List"><List size={16} /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-sm border border-gray-300 dark:border-gray-600 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors">
                                        <FileUp size={14} /> {isUploading ? 'Uploading...' : 'Upload File'}
                                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    </label>
                                    {lecture.driveNoteLink && (
                                        <a href={lecture.driveNoteLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View Attached File</a>
                                    )}
                                </div>
                            </div>

                            {/* Editor */}
                            <textarea
                                className="w-full p-6 min-h-[300px] outline-none resize-y bg-transparent font-mono text-sm leading-relaxed"
                                placeholder="Type your notes here... They auto-save locally."
                                value={noteContent}
                                onChange={handleNoteChange}
                            ></textarea>

                            {/* Save Action */}
                            <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-color)' }}>
                                <button
                                    onClick={saveToDrive}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-sm rounded-md hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">
                                    <Save size={16} /> {isSaving ? 'Uploading...' : 'Securely Save to Drive'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <aside className="w-80 h-full border-l flex flex-col pt-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="p-4 border-b font-bold tracking-wide flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                            <span>Course Overview</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {courseDays ? (
                                courseDays.map(day => (
                                    <div key={day.id} className="mb-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Day {day.dayNumber} - {day.title}</h4>
                                        <div className="space-y-1">
                                            {day.lectures.map(l => (
                                                <div key={l.id} className={`p-2 text-xs font-medium rounded-md truncate cursor-pointer transition-colors ${l.id === id ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-black/5 dark:hover:bg-white/10'}`} style={{ color: l.id === id ? 'var(--primary-btn-text)' : 'inherit' }}>
                                                    {l.completed ? '✔ ' : ''}{l.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : sameDayLectures.length > 0 ? (
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Today's Content</h4>
                                    <div className="space-y-1">
                                        {sameDayLectures.map(l => (
                                            <div
                                                key={l.id}
                                                onClick={() => navigate(`/lecture/${l.id}`)}
                                                className={`p-2 text-xs font-medium rounded-md truncate cursor-pointer transition-colors ${l.id === id ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                                                style={{ color: l.id === id ? 'var(--primary-btn-text)' : 'inherit' }}
                                            >
                                                {l.isCompleted ? '✔ ' : ''}{l.title || 'Lecture'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 justify-center items-center text-center rounded-md border shadow-sm opacity-50" style={{ borderColor: 'var(--border-color)' }}>
                                    <p className="text-xs font-bold mb-1">Assigned Date</p>
                                    <p className="text-[10px] font-mono">{new Date(lecture.assignedDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-auto">
                {/* Backdrop Blur */}
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md" onClick={handleClose}></div>

                {/* Modal Container */}
                <div className="relative z-10 w-full max-w-6xl max-h-full animate-in fade-in zoom-in-95 duration-200">
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

export default LecturePlayer;
