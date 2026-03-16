import React from 'react';
import Layout from '../components/Layout';
import { Shield, Mail, Info } from 'lucide-react';

export const PrivacyPolicy = () => {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-12">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                        <Shield size={28} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
                </div>
                
                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-3">Introduction</h2>
                        <p className="mb-4">Welcome to Masternow's Privacy Policy. This document explains how we collect, use, and protect your information when you use our website (masternow.in) and our web application.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-3">1. Information We Collect</h2>
                        <p>Masternow uses Google OAuth to authenticate users. We only collect the minimal information required to provide our service: your name, email address, and profile picture provided by Google. We store this in our database to identify your account across sessions.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-3">2. How We Use OAuth and API Scopes</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Google Profile:</strong> Used strictly for creating your account identity and logging you in.</li>
                            <li><strong>Google Drive:</strong> We request Drive access <em>only</em> to save markdown files of your study notes into your personal Drive. We do not read or modify files we did not create.</li>
                            <li><strong>Google Calendar:</strong> We request Calendar access <em>only</em> to push your daily tasks and course deadlines to your calendar to keep you organized.</li>
                            <li><strong>YouTube Data:</strong> We access public YouTube playlist data to parse videos into a structured syllabus.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-3">3. Data Sharing</h2>
                        <p>We <strong>do not sell, rent, or share</strong> your personal data with third parties. Your notes and calendar events are synced directly to your own Google accounts.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-3">4. Your Control</h2>
                        <p>You can revoke Masternow's access to your Google Account at any time via your Google Account Permissions page. You can also delete your Masternow account in the Settings, which will remove all our records of your courses and streaks.</p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export const ContactUs = () => {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-12">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                        <Mail size={28} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Contact Us</h1>
                </div>

                <div className="p-8 border rounded-xl bg-gray-50 dark:bg-[#0a0a0a]" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                    <p className="opacity-80 mb-6 text-lg">Have a question, feedback, or need support? We're here to help.</p>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold w-24">Email:</span>
                            <a href="mailto:support@masternow.app" className="text-blue-500 hover:underline">support@masternow.app</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold w-24">Response:</span>
                            <span className="opacity-80">Usually within 24-48 hours.</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export const AboutUs = () => {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-12">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
                        <Info size={28} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">About Us</h1>
                </div>

                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    <p>
                        <strong className="text-black dark:text-white">Masternow</strong> was built out of a simple frustration: there is an infinite amount of high-quality educational content on YouTube, but watching it often leads to distraction rather than mastery.
                    </p>
                    
                    <p>
                        We built Masternow to transform chaotic, algorithm-driven video playlists into <strong>structured, daily syllabuses</strong>. 
                    </p>

                    <p>
                        By combining a distraction-free video player with automated Google Drive note syncing and Google Calendar task scheduling, Masternow forces you to plan your learning, take meaningful notes, and actually finish the courses you start.
                    </p>

                    <p className="font-bold pt-4 text-black dark:text-white">
                        Stop watching. Start mastering.
                    </p>
                </div>
            </div>
        </Layout>
    );
};
