import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, ShieldCheck, CalendarCheck, Youtube, HardDrive, ArrowRight, Zap, YoutubeIcon, X } from 'lucide-react';

const LandingPage = () => {
    const { theme, toggleTheme } = useTheme();
    const [showTutorial, setShowTutorial] = useState(false);

    const currentLogo = theme === 'dark'
        ? '/assets/Masternow-Light-color.svg'
        : '/assets/Masternow-dark-color.svg';

    const handleDownload = () => {
        const downloadUrl = 'https://pub-7e82d0250577412ea13c7b60d2c3bb04.r2.dev/Masternow-1.0.0-arm64.dmg';
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'Masternow-macOS.dmg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleDownloadWindows = () => {
        const downloadUrl = 'https://pub-7e82d0250577412ea13c7b60d2c3bb04.r2.dev/Masternow%20Setup%201.0.0.exe';
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'Masternow-macOS.dmg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen transition-colors duration-200 bg-black text-white">

            {/* Minimalist Header */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-slate-800">
                <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-screen-2xl mx-auto">
                    <div className="flex items-center gap-2">
                        <img src={currentLogo} alt="Masternow Logo" className="h-7" />
                    </div>
                    <div className="flex items-center gap-6">
                        {/* 
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        */}
                        <Link to="/dashboard" className="px-5 py-2 rounded-md font-bold text-sm transition hover:scale-105 active:scale-95 bg-white text-black">
                            Log In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-40 pb-20 flex flex-col items-center text-center">

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold mb-8 animate-fade-in-up">
                    <ShieldCheck size={16} className="text-green-600" />
                    Secure & Private Google Drive Integration
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight mb-8 -tracking-wide">
                    Plan your learning.<br />
                    <span className="opacity-40">Masternow.</span>
                </h1>

                <div className="max-w-3xl mb-12 space-y-4">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed opacity-90">
                        Masternow is a personal productivity and learning management tool that helps you organize YouTube tutorials into structured courses, sync study schedules with Google Calendar, and securely save Markdown notes directly to your Google Drive. We turn chaotic playlists into a focused syllabus.
                    </p>

                </div>

                <div className="flex gap-4">

                    <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/auth/google?frontendUrl=${window.location.origin}`} className="group flex items-center gap-3 px-8 py-4 rounded-md font-bold text-lg transition-transform hover:-translate-y-1 shadow-2xl bg-white text-black">
                        Start Organizing Now
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </a>

                    {/* <button onClick={() => setShowTutorial(true)} className="group flex items-center gap-3 px-8 py-4 rounded-md font-bold text-lg transition-transform hover:-translate-y-1 shadow-2xl bg-white text-black dark:bg-[#1a1a1a] dark:text-white border border-gray-200 dark:border-gray-800">
                    Watch Tutorial
                    <YoutubeIcon size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                </button> */}


                </div>



                {/* Download Card Section */}
                <div className="mt-32 w-full p-0 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden bg-white/3">
                    <div className="flex-1 items-center justify-center text-left m-0 p-0">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Download for <span className='text-blue-400'>macOS</span></h2>
                        <p className="text-lg font-medium opacity-70 mb-8 leading-relaxed">
                            Take Masternow with you on the go. Our desktop app brings your learning management system directly to your Windows machine with full offline support and seamless synchronization.
                        </p>

                        <div className='flex gap-3'>

                            <button onClick={handleDownload} className="group flex justify-center items-center gap-3 px-8 py-4 rounded-md font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl bg-white text-black">
                                Download .dmg
                                <img src="https://cdn-icons-png.flaticon.com/512/179/179309.png" className="w-5 h-5" alt="mac" />
                                {/* <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /> */}
                            </button>

                            <button onClick={handleDownloadWindows} className="bg-blue-500 hover:bg-blue-600 text-white group flex justify-center items-center gap-3 px-8 py-4 rounded-md font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl">
                                Download .exe
                                <img src="https://cdn-icons-png.flaticon.com/512/888/888882.png" className="w-5 h-5" alt="mac" />
                                {/* <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /> */}
                            </button>

                        </div>


                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        {/* <MacbookSVG /> */}
                        <img src="https://img-prd-pim.poorvika.com/cdn-cgi/image/width=1600,height=1600,quality=75/product/apple-macbook-pro-m4-max-chip-with-16-core-cpu-and-40-core-gpu-mac-os-laptop-16-2-inch-mx2w3hn-a-space-black-48gb-1tb-stright.png" alt="Macbook Logo" />
                    </div>
                </div>



                {/* Highly visual feature bento box grid */}
                <div className="mt-32 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">

                    {/* Feature 1 */}
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-slate-950 border border-slate-800 hover:border-black dark:hover:border-white transition-all group">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                            <img src="/assets/youtube-icon-svgrepo-com.svg" alt="" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 tracking-tight">Focus Player</h3>
                        <p className="text-sm font-medium opacity-70 leading-relaxed">
                            A distraction-free modal. Enter full focus mode with blurred backgrounds to watch tutorials without algorithmic rabbit holes.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-slate-950 border border-slate-800 hover:border-black dark:hover:border-white transition-all group">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                            <img src="/assets/google-calendar-svgrepo-com.svg" alt="" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 tracking-tight">Interactive Calendar</h3>
                        <p className="text-sm font-medium opacity-70 leading-relaxed">
                            Two-way synced scheduling. Generates your daily learning chain directly linked to your Google Calendar routine.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-slate-950 border border-slate-800 hover:border-black dark:hover:border-white transition-all group lg:col-span-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <HardDrive size={180} />
                        </div>
                        <div className="relative z-10 w-full lg:w-2/3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center  mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                <img src="/assets/google-drive-svgrepo-com.svg" alt="" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 tracking-tight">100% Secure Drive Storage</h3>
                            <p className="text-base font-medium opacity-70 leading-relaxed mb-4">
                                Your data is yours. We automatically save all your study notes as markdown files directly to your personal Google Drive in real-time. We store nothing locally. Pure security.
                            </p>
                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-sm">
                                <HardDrive size={14} /> Drive Integration Setup
                            </div>
                        </div>
                    </div>

                    {/* Ext Feature */}
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-slate-950 border border-slate-800 hover:border-black dark:hover:border-white transition-all group lg:col-span-4 flex items-center justify-between overflow-hidden">
                        <div className="max-w-2xl">
                            <h3 className="text-3xl font-bold mb-4 tracking-tight flex items-center gap-3">
                                <Zap size={32} /> Streak Maker
                            </h3>
                            <p className="text-lg font-medium opacity-70 leading-relaxed">
                                Never break the chain. Integrate Masternow with external platforms to enforce your daily learning streak.
                            </p>
                        </div>
                        <div className="hidden md:block w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity">
                            <FlameIcon />
                        </div>
                    </div>

                </div>


            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-8 mt-20 bg-black">
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium opacity-60">
                    <p>&copy; {new Date().getFullYear()} Masternow. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/about" className="hover:opacity-100 transition-opacity">About Us</Link>
                        <Link to="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link>
                        <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
                        <Link to="/terms" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
                    </div>
                </div>
            </footer>

            {/* Tutorial Video Modal */}
            {showTutorial && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/20">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowTutorial(false)}
                            className="absolute z-10 top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                        >
                            <X size={24} />
                        </button>

                        {/* YouTube iFrame - Replace src with your actual video ID */}
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                            title="Masternow Tutorial"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

// Extracted large background icon
const FlameIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
)

// MacBook SVG Component
const MacbookSVG = () => (
    <svg viewBox="0 0 384 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
        {/* MacBook screen */}
        <rect x="32" y="24" width="320" height="216" rx="12" fill="#1a1a1a" stroke="#ffffff" strokeWidth="2" />

        {/* Screen content - gradient background */}
        <defs>
            <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
        </defs>
        <rect x="36" y="28" width="312" height="208" rx="10" fill="url(#screenGradient)" />

        {/* Masternow Icon on screen */}
        <circle cx="192" cy="100" r="20" fill="#ffffff" opacity="0.3" />
        <text x="192" y="140" fontSize="16" fontWeight="bold" fill="#ffffff" textAnchor="middle" opacity="0.8">
            Masternow
        </text>
        <text x="192" y="170" fontSize="12" fill="#ffffff" textAnchor="middle" opacity="0.6">
            Your Learning Hub
        </text>

        {/* Notch */}
        <rect x="152" y="232" width="80" height="16" rx="4" fill="#000000" />

        {/* Bottom bezel */}
        <rect x="32" y="240" width="320" height="40" rx="0" fill="#1a1a1a" stroke="#ffffff" strokeWidth="2" strokeTop="none" />

        {/* Keyboard details - simple pattern */}
        <g opacity="0.4">
            <line x1="50" y1="270" x2="334" y2="270" stroke="#ffffff" strokeWidth="0.5" />
            <line x1="50" y1="280" x2="334" y2="280" stroke="#ffffff" strokeWidth="0.5" />
            <line x1="50" y1="290" x2="334" y2="290" stroke="#ffffff" strokeWidth="0.5" />
        </g>

        {/* Trackpad */}
        <rect x="140" y="295" width="104" height="65" rx="8" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
    </svg>
);

export default LandingPage;
