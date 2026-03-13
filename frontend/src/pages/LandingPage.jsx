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

    return (
        <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>

            {/* Minimalist Header */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-black/70" style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                        <Link to="/dashboard" className="px-5 py-2 rounded-md font-bold text-sm transition hover:scale-105 active:scale-95" style={{ backgroundColor: 'var(--primary-btn)', color: 'var(--primary-btn-text)' }}>
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

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight mb-8" style={{ letterSpacing: '-0.03em' }}>
                    Plan your learning.<br />
                    <span className="opacity-40">Master your Skills.</span>
                </h1>

                <div className="max-w-3xl mb-12 space-y-4">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed" style={{ opacity: 0.9 }}>
                        Masternow is a personal productivity and learning management tool. 
                    </p>
                   
                </div>

                <div className="flex gap-4">

                    <a href="http://localhost:5001/auth/google" className="group flex items-center gap-3 px-8 py-4 rounded-md font-bold text-lg transition-transform hover:-translate-y-1 shadow-2xl" style={{ backgroundColor: 'var(--primary-btn)', color: 'var(--primary-btn-text)' }}>
                    Start Organizing Now
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>

                {/* <button onClick={() => setShowTutorial(true)} className="group flex items-center gap-3 px-8 py-4 rounded-md font-bold text-lg transition-transform hover:-translate-y-1 shadow-2xl bg-white text-black dark:bg-[#1a1a1a] dark:text-white border border-gray-200 dark:border-gray-800">
                    Watch Tutorial
                    <YoutubeIcon size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                </button> */}


                </div>

                

                {/* Highly visual feature bento box grid */}
                <div className="mt-32 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">

                    {/* Feature 1 */}
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border hover:border-black dark:hover:border-white transition-all group" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                            <img src="/assets/youtube-icon-svgrepo-com.svg" alt="" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 tracking-tight">Focus Player</h3>
                        <p className="text-sm font-medium opacity-70 leading-relaxed">
                            A distraction-free modal. Enter full focus mode with blurred backgrounds to watch tutorials without algorithmic rabbit holes.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border hover:border-black dark:hover:border-white transition-all group" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                            <img src="/assets/google-calendar-svgrepo-com.svg" alt="" />  
                        </div>
                        <h3 className="text-xl font-bold mb-3 tracking-tight">Interactive Calendar</h3>
                        <p className="text-sm font-medium opacity-70 leading-relaxed">
                            Two-way synced scheduling. Generates your daily learning chain directly linked to your Google Calendar routine.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border hover:border-black dark:hover:border-white transition-all group lg:col-span-2 relative overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
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
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border hover:border-black dark:hover:border-white transition-all group lg:col-span-4 flex items-center justify-between overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
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
            <footer className="border-t py-8 mt-20" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium" style={{ opacity: 0.6 }}>
                    <p>&copy; {new Date().getFullYear()} Masternow. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/about" className="hover:opacity-100 transition-opacity">About Us</Link>
                        <Link to="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link>
                        <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
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

export default LandingPage;
