import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children, maxW = 'max-w-5xl' }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Sidebar */}
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 relative ${isSidebarCollapsed ? 'ml-0' : 'ml-64'}`}>

                {/* Toggle Button when Collapsed */}
                {isSidebarCollapsed && (
                    <button
                        onClick={() => setIsSidebarCollapsed(false)}
                        className="absolute top-6 left-6 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-50 text-gray-500"
                        aria-label="Open Sidebar"
                    >
                        <Menu size={24} />
                    </button>
                )}

                {/* Theme Toggle Button (Hidden for now as default is Dark Mode)
                <button
                    onClick={toggleTheme}
                    className="absolute top-6 right-8 p-2 rounded-full border bg-white dark:bg-[#1f1f1f] shadow-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all z-50 text-gray-700 dark:text-gray-300"
                    style={{ borderColor: 'var(--border-color)' }}
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                */}

                <div className={`p-8 pt-20 ${maxW} mx-auto w-full`}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
