import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { PanelLeftClose, LayoutDashboard, CheckSquare, PlusSquare, BookOpen, Flame, Settings, LogOut, BrainCog } from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { theme } = useTheme();
    const location = useLocation();
    const [currentDate, setCurrentDate] = useState('');
    const [user, setUser] = useState(null);
    const [isUserLoaded, setIsUserLoaded] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch(`https://masternow-productivity-testing.onrender.com/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch user profile", err);
                }
            }
            setIsUserLoaded(true);
        };
        fetchUser();
    }, []);

    const currentLogo = theme === 'dark'
        ? '/assets/Masternow-Light-color.svg'
        : '/assets/Masternow-dark-color.svg';

    useEffect(() => {
        const updateDate = () => {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            setCurrentDate(new Date().toLocaleDateString(undefined, options));
        };
        updateDate();
        // Update daily
        const interval = setInterval(updateDate, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'To-Do', path: '/todo', icon: CheckSquare },
        { name: 'Add Course', path: '/add-course', icon: PlusSquare },
        { name: 'Books / Syllabus', path: '/books', icon: BookOpen },
        { name: 'Streak Maker', path: '/streak', icon: Flame },
        { name: 'Settings', path: '/settings', icon: Settings },
        { name: 'Personalised AI', path: '/personal-ai', icon: BrainCog },
    ];

    return (
        <aside
            className={`w-64 h-screen fixed left-0 top-0 flex flex-col p-4 transition-transform duration-300 z-40 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
            style={{ backgroundColor: 'var(--component-bg)', borderRight: '1px solid var(--border-color)' }}>

            {/* Header / Logo / Collapse Button */}
            <div className="mb-6 px-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src={currentLogo} alt="Masternow Logo" className="h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">Beta</span>
                </div>
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500"
                    aria-label="Minimize sidebar"
                >
                    <PanelLeftClose size={20} />
                </button>
            </div>

            {/* User Profile */}
            <div className="mb-6 px-2 flex items-center gap-3 w-full overflow-hidden min-h-[40px]">
                {isUserLoaded ? (
                    <>
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-gray-500">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                '?'
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm truncate">{user?.name || 'Not Logged In'}</h4>
                            {!user && (
                                <a href={`${import.meta.env.VITE_API_BASE_URL || 'https://masternow-productivity-testing.onrender.com'}/auth/google?frontendUrl=${window.location.origin}`} className="text-xs text-blue-500 hover:underline inline-block">
                                    Sign in with Google
                                </a>
                            )}
                            {user?.email && (
                                <p className="text-[10px] opacity-60 truncate">{user.email}</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-full flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Date */}
            <div className="mb-8 px-2">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ opacity: 0.5 }}>{currentDate}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'font-bold' : ''}`}
                            style={{
                                backgroundColor: isActive ? 'var(--hover-bg)' : 'transparent',
                                color: 'var(--text-color)'
                            }}
                        >
                            <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-70'} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            {user && (
                <div className="mt-auto space-y-1">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/';
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400">
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
