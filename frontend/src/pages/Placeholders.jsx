import React from 'react';
import Layout from '../components/Layout';
import { Construction } from 'lucide-react';

const Placeholder = ({ title }) => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center opacity-50 py-20">
                <Construction size={48} className="mb-4" />
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <p>This module is currently under development.</p>
            </div>
        </Layout>
    );
};

export const Streak = () => <Placeholder title="Streak Maker" />;
export const Settings = () => <Placeholder title="Settings" />;
export const PersonalisedAI = () => <Placeholder title="Personalised AI" />;
export const Books = () => <Placeholder title="Books & Syllabus" />;
