import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, AlignLeft, X, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const initialColumns = [
    {
        id: 'todo',
        title: 'To Do',
        color: 'bg-indigo-50/50 dark:bg-indigo-900/10',
        borderColor: 'border-indigo-100 dark:border-indigo-900',
        textColor: 'text-indigo-800 dark:text-indigo-300',
        tasks: []
    },
    {
        id: 'progress',
        title: 'In Progress',
        color: 'bg-blue-50/50 dark:bg-blue-900/10',
        borderColor: 'border-blue-100 dark:border-blue-900',
        textColor: 'text-blue-800 dark:text-blue-300',
        tasks: []
    },
    {
        id: 'completed',
        title: 'Completed',
        color: 'bg-orange-50/50 dark:bg-orange-900/10',
        borderColor: 'border-orange-100 dark:border-orange-900',
        textColor: 'text-orange-800 dark:text-orange-300',
        tasks: []
    }
];

const ToDo = () => {
    const [columns, setColumns] = useState(initialColumns);
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [draggedFromColId, setDraggedFromColId] = useState(null);

    // Create state
    const [isCreating, setIsCreating] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        duration: '30' // minutes
    });

    // View state
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'calendar'

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();

                setColumns(prevCols => prevCols.map(col => ({
                    ...col,
                    tasks: data
                        .filter(t => t.status === col.id)
                        .sort((a, b) => a.order - b.order)
                        .map(t => ({
                            ...t,
                            date: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date',
                            desc: t.description || '',
                            statusLabel: t.status === 'todo' ? 'Not started' : t.status === 'progress' ? 'In progress' : 'Done'
                        }))
                })));
            }
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const dateTimeString = `${newTask.date}T${newTask.time}:00`;
            const isoDueDate = new Date(dateTimeString).toISOString();

            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/tasks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    status: 'todo',
                    dueDate: isoDueDate,
                    duration: newTask.duration
                })
            });
            if (res.ok) {
                // Sync to Google Calendar quietly
                try {
                    await fetch(`https://masternow-productivity-testing.onrender.com/api/calendar/add-event`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            title: newTask.title,
                            description: newTask.description || "Task generated from Masternow Kanban Board",
                            dueDate: isoDueDate,
                            duration: parseInt(newTask.duration) || 30 // pass to backend if calendar API needs it
                        })
                    });
                } catch (calErr) {
                    console.error("Failed to sync to calendar:", calErr);
                }

                setNewTask({
                    title: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    time: '12:00',
                    duration: '30'
                });
                setIsCreating(false);
                fetchTasks(); // Re-fetch to get real ID and order
            }
        } catch (err) {
            console.error("Failed to create task", err);
        }
    };

    const handleDragStart = (e, taskId, colId) => {
        setDraggedTaskId(taskId);
        setDraggedFromColId(colId);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData('text/plain', taskId.toString());
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "move";
        }
    };

    const handleDrop = async (e, targetColId) => {
        e.preventDefault();

        if (!draggedTaskId || !draggedFromColId) return;
        if (draggedFromColId === targetColId) {
            setDraggedTaskId(null);
            setDraggedFromColId(null);
            return;
        }

        // Optimistic UI Update
        let draggedTaskInfo = null;
        setColumns(prev => {
            const newCols = prev.map(c => ({ ...c, tasks: [...c.tasks] }));

            const sourceCol = newCols.find(c => c.id === draggedFromColId);
            const targetCol = newCols.find(c => c.id === targetColId);

            const taskIndex = sourceCol.tasks.findIndex(t => t.id === draggedTaskId);
            const [task] = sourceCol.tasks.splice(taskIndex, 1);

            draggedTaskInfo = { ...task };

            if (targetColId === 'todo') task.statusLabel = 'Not started';
            if (targetColId === 'progress') task.statusLabel = 'In progress';
            if (targetColId === 'completed') task.statusLabel = 'Done';
            task.status = targetColId;

            targetCol.tasks.push(task);
            return newCols;
        });

        // Backend Update
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/tasks/${draggedTaskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: targetColId,
                    isCompleted: targetColId === 'completed'
                })
            });
            if (!res.ok) throw new Error("Update failed");
        } catch (err) {
            console.error("Failed to update status", err);
            fetchTasks(); // Revert basically
        }

        setDraggedTaskId(null);
        setDraggedFromColId(null);
    };

    const handleDeleteTask = async (taskId, colId, e) => {
        e.stopPropagation();

        // Optimistic delete
        setColumns(prev => prev.map(c => {
            if (c.id === colId) {
                return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
            }
            return c;
        }));

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://masternow-productivity-testing.onrender.com/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Delete failed");
        } catch (err) {
            console.error("Failed to delete", err);
            fetchTasks(); // Revert
        }
    };

    const calendarEvents = columns.flatMap(col => col.tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: col.id,
        start: task.dueDate ? new Date(task.dueDate) : new Date(),
        end: task.dueDate ? new Date(task.dueDate) : new Date(),
        allDay: true
    })));

    return (
        <Layout maxW="max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Tasks & Calendar</h1>
                    <p className="flex items-center gap-2 text-sm opacity-60">
                        Manage your tasks and upcoming deadlines.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center p-1 rounded-sm border" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}>
                        <button
                            onClick={() => setViewMode('board')}
                            className={`px-3 py-1.5 rounded-sm flex items-center gap-2 text-sm font-semibold transition-all ${viewMode === 'board' ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                        >
                            <LayoutGrid size={16} /> Board
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-1.5 rounded-sm flex items-center gap-2 text-sm font-semibold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                        >
                            <CalendarIcon size={16} /> Calendar
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-2 transition-colors">
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            {viewMode === 'board' ? (
                <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-8 items-start h-full min-h-[60vh]">
                    {columns.map(col => (
                        <div
                            key={col.id}
                            className={`w-full md:w-80 shrink-0 min-h-[300px] border-2 border-transparent transition-colors rounded-lg flex flex-col ${draggedTaskId ? 'bg-black/5 dark:bg-white/5 border-dashed border-gray-300 dark:border-gray-600' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* Column Header */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm w-fit mb-3 border font-semibold text-sm ${col.color} ${col.borderColor} ${col.textColor}`}>
                                <span>{col.title}</span>
                                <span className="opacity-70 font-mono text-xs">{col.tasks.length}</span>
                            </div>

                            {/* Task Cards & Drop Zone */}
                            <div className="space-y-3 flex-1">
                                {col.tasks.map(task => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id, col.id)}
                                        className={`relative p-4 rounded-sm border shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-400 dark:hover:border-gray-500 transition-colors group ${draggedTaskId === task.id ? 'opacity-50 blur-[1px]' : ''}`}
                                        style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)' }}
                                    >
                                        {/* Delete Button (visible on hover) */}
                                        <button
                                            onClick={(e) => handleDeleteTask(task.id, col.id, e)}
                                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all"
                                            title="Delete Task"
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>

                                        <h3 className="font-semibold text-sm mb-1 leading-snug pr-6">{task.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{task.date}</p>

                                        {task.desc && (
                                            <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4 opacity-80">
                                                <AlignLeft size={12} className="mt-0.5 shrink-0" />
                                                <span className="line-clamp-2">{task.desc}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center">
                                            <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-[11px] font-medium border border-gray-200 dark:border-gray-700">
                                                <span className={`w-1.5 h-1.5 rounded-full ${col.id === 'todo' ? 'bg-gray-400' : col.id === 'progress' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                                                {task.statusLabel}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {/* Drop zone placeholder/padding if column is empty */}
                                {col.tasks.length === 0 && !isCreating && (
                                    <div className="h-16 rounded-sm border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-xs text-gray-400 font-medium">
                                        Drop tasks here
                                    </div>
                                )}

                                {/* Add New Page Button - Only visible in To Do to simplify UX */}
                                {col.id === 'todo' && (
                                    <button onClick={() => setIsCreating(true)} className="w-full flex items-center gap-2 py-2 px-3 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-sm transition-colors mt-1 font-medium text-left">
                                        <Plus size={16} /> New task
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--component-bg)', borderColor: 'var(--border-color)', height: '70vh' }}>
                    <style>{`
                    .rbc-calendar { font-family: inherit; font-size: 0.85rem; }
                    .rbc-toolbar button { color: inherit; border-radius: 4px; padding: 4px 10px; }
                    .rbc-toolbar button:active, .rbc-toolbar button.rbc-active { background-color: var(--border-color); color: inherit; box-shadow: none; outline: none; }
                    .rbc-event { background-color: #000; color: #fff; border-radius: 4px; font-weight: 600; padding: 2px 6px; border: none; }
                    .dark .rbc-event { background-color: #fff; color: #000; }
                    .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-header { border-color: #333; }
                    .dark .rbc-day-bg + .rbc-day-bg { border-left-color: #333; }
                    .dark .rbc-month-row + .rbc-month-row { border-top-color: #333; }
                    .dark .rbc-off-range-bg { background-color: #0a0a0a; }
                    .rbc-today { background-color: rgba(255, 165, 0, 0.1); }
                    .dark .rbc-today { background-color: rgba(255, 165, 0, 0.05); }
                `}</style>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={['month', 'week', 'day']}
                    />
                </div>
            )}

            {/* Create Task Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-lg shadow-2xl border dark:border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/50">
                            <h2 className="text-lg font-bold">Create New Task</h2>
                            <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border dark:border-gray-800 rounded-sm text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                    placeholder="E.g., Finish React Course Module"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border dark:border-gray-800 rounded-sm text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all min-h-[80px]"
                                    placeholder="Add any extra details..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newTask.date}
                                        onChange={e => setNewTask({ ...newTask, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border dark:border-gray-800 rounded-sm text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={newTask.time}
                                        onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border dark:border-gray-800 rounded-sm text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    min="5"
                                    step="5"
                                    required
                                    value={newTask.duration}
                                    onChange={e => setNewTask({ ...newTask, duration: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border dark:border-gray-800 rounded-sm text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t dark:border-gray-800 mt-6">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black text-sm font-bold rounded-sm shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
                                    <Plus size={16} /> Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ToDo;
