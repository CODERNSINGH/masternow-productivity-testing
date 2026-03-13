import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Parse token from query string (e.g. ?token=xxxxx)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            // Save token to localStorage
            localStorage.setItem('token', token);
            // Redirect to dashboard
            navigate('/dashboard', { replace: true });
        } else {
            // If no token, return to landing page
            navigate('/', { replace: true });
        }
    }, [navigate, location]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#121212]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin"></div>
                <p className="text-sm font-semibold opacity-60 animate-pulse">Authenticating...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
