import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import ReactMarkdown from 'react-markdown';
import RemarkGfm from 'remark-gfm';
import {
    Send, Paperclip, Mic, StopCircle, X,
    FileText, ImageIcon, Bot, Sparkles, BrainCog, Zap, Loader, CheckCircle, AlertCircle
} from 'lucide-react';

/* ── helpers ──────────────────────────────────────────── */
const formatTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const AI_REPLIES = [
    "Based on your recent study sessions, I'd focus on the core concepts first — want me to break them down?",
    "I've reviewed your course material. Here's the key insight you need to nail this topic.",
    "Great question. Let me connect this to what you studied last week for a clearer picture.",
    "That's a classic exam area. Here's a concise breakdown tailored to your syllabus.",
    "I noticed you've been revisiting this. Let me explain it from a different angle — sometimes a fresh perspective clicks better.",
];

const CHIPS = [
    { label: 'Summarise my Uploaded Notes',  icon: '' },
    { label: "Quiz me on today's topic",     icon: '' },
    { label: 'Build me a study plan',        icon: '' },
    { label: 'Explain this concept simply',  icon: 'c'  },
];

/* ── typing dots ──────────────────────────────────────── */
const TypingDots = () => (
    <div className="flex items-end gap-2.5 pr-20">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/5 border border-white/10 text-white/40">
            <Bot size={11} strokeWidth={1.8} />
        </div>
        <div className="flex items-center gap-1 px-4 py-3 bg-white/[0.035] border border-white/[0.065] border-l-2 border-l-white/10 rounded-2xl rounded-bl-sm">
            {[0, 170, 340].map(delay => (
                <span
                    key={delay}
                    className="w-1 h-1 rounded-full bg-white/30 animate-bounce"
                    style={{ animationDelay: `${delay}ms`, animationDuration: '1.1s' }}
                />
            ))}
        </div>
    </div>
);

/* ── single bubble ────────────────────────────────────── */
const Bubble = ({ msg, prevRole }) => {
    const isUser  = msg.role === 'user';
    const grouped = prevRole === msg.role;

    return (
        <div className={`flex items-end gap-2.5 animate-[fadeUp_0.2s_ease_both] ${
            isUser ? 'flex-row-reverse pl-20' : 'flex-row pr-20'
        } ${grouped ? 'mt-0.5' : 'mt-3'}`}>

            {/* Avatar – hidden when grouped */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-0.5 border
                ${isUser
                    ? 'bg-white/5 border-white/8 text-white/30'
                    : 'bg-white/5 border-white/10 text-white/40'}
                ${grouped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {isUser
                    ? <Sparkles size={10} strokeWidth={2} />
                    : <Bot size={11} strokeWidth={1.8} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[68%] rounded-2xl px-4 py-2.5 ${
                isUser
                    ? 'bg-[#151515] border border-white/[0.08] rounded-br-sm'
                    : 'bg-white/[0.035] border border-white/[0.065] border-l-2 border-l-white/10 rounded-bl-sm'
            }`}>
                {/* Attached files */}
                {msg.files?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {msg.files.map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/45">
                                {f.type?.startsWith('image/')
                                    ? <ImageIcon size={10} strokeWidth={2} />
                                    : <FileText size={10} strokeWidth={2} />}
                                <span className="max-w-[100px] truncate">{f.name}</span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Text */}
                {msg.content && (
                    isUser ? (
                        <p className={`text-[13.5px] leading-[1.68] whitespace-pre-wrap break-words m-0 ${
                            isUser ? 'text-white/88' : 'text-white/80'
                        }`}>
                            {msg.content}
                        </p>
                    ) : (
                        <div className="prose prose-invert max-w-none text-[13.5px] [&_*]:m-0 [&_p]:leading-[1.68] [&_p]:text-white/80 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-3 [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-2.5 [&_h2]:mb-1.5 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-white/95 [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_li]:text-white/80 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-white/70 [&_pre]:bg-black/50 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-white/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-white/60 [&_blockquote]:my-2 [&_strong]:text-white [&_em]:text-white/75 [&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300 [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:border [&_table]:border-white/15 [&_th]:bg-white/5 [&_th]:border [&_th]:border-white/15 [&_th]:px-3 [&_th]:py-2 [&_th]:text-white [&_th]:font-semibold [&_th]:text-left [&_th]:text-[12px] [&_td]:border [&_td]:border-white/15 [&_td]:px-3 [&_td]:py-2 [&_td]:text-white/80 [&_tbody_tr:hover]:bg-white/[0.03] [&_tr:nth-child(odd)]:bg-white/[0.02]">
                            <ReactMarkdown remarkPlugins={[RemarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                    )
                )}

                {/* Metadata (documents used) */}
                {msg.metadata && (
                    <p className="text-[10px] text-white/30 mt-2 pt-1.5 border-t border-white/10">
                        {msg.metadata}
                    </p>
                )}

                {/* Timestamp */}
                <time className="block text-[10px] text-white/20 mt-1.5 text-right tabular-nums">
                    {msg.time}
                </time>
            </div>
        </div>
    );
};

/* ── page ─────────────────────────────────────────────── */
const PersonalisedAI = () => {
    const [messages, setMessages] = useState([{
        id: 1, role: 'ai',
        content: "Hey — I'm your Personalised AI, trained on your courses and notes. Upload a PDF or Word document, then ask me anything!",
        time: formatTime(new Date()), files: [],
    }]);
    const [input, setInput]     = useState('');
    const [files, setFiles]     = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isRec, setIsRec]     = useState(false);
    const [recSecs, setRecSecs] = useState(0);
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(null);
    const [error, setError] = useState(null);

    const bottomRef = useRef(null);
    const fileRef   = useRef(null);
    const textaRef  = useRef(null);
    const recRef    = useRef(null);
    const timerRef  = useRef(null);

    // Fetch uploaded documents on mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    // scroll to bottom
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    // auto-resize textarea
    useEffect(() => {
        const el = textaRef.current;
        if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px'; }
    }, [input]);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/chat/documents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUploadedDocs(data.documents || []);
            }
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        }
    };

    const handleFileUpload = async (e) => {
        const newFiles = Array.from(e.target.files || []);
        
        for (const file of newFiles) {
            if (files.length >= 5) break;
            
            setUploadingFile(file.name);
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5001/api/chat/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    setUploadedDocs(prev => [...prev, data.document]);
                    setError(null);
                    
                    // Add success message to chat
                    setMessages(p => [...p, {
                        id: Date.now(),
                        role: 'system',
                        content: `✓ Uploaded: ${file.name} (${data.document.chunkCount} chunks)`,
                        time: formatTime(new Date()),
                        files: []
                    }]);
                } else {
                    const errData = await res.json();
                    setError(`Failed to upload ${file.name}: ${errData.error}`);
                }
            } catch (err) {
                setError(`Upload error for ${file.name}: ${err.message}`);
                console.error(err);
            }
        }
        
        setUploadingFile(null);
        e.target.value = '';
    };

    const send = async () => {
        const text = input.trim();
        if (!text && files.length === 0) return;

        const userMsg = { 
            id: Date.now(), 
            role: 'user', 
            content: text, 
            time: formatTime(new Date()), 
            files: [...files] 
        };
        
        setMessages(p => [...p, userMsg]);
        setInput(''); 
        setFiles([]); 
        setIsTyping(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/chat/message', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: text,
                    documentIds: uploadedDocs.filter(d => d.status === 'ready').map(d => d.id)
                })
            });

            if (res.ok) {
                const data = await res.json();
                setIsTyping(false);
                setMessages(p => [...p, {
                    id: Date.now() + 1,
                    role: 'ai',
                    content: data.response,
                    time: formatTime(new Date()),
                    files: [],
                    metadata: `Used ${data.usedChunks} chunks from ${data.usedDocuments.length} document(s)`
                }]);
            } else {
                const errData = await res.json();
                setError(`Failed to get response: ${errData.error}`);
                setIsTyping(false);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            setIsTyping(false);
            console.error(err);
        }
    };

    const onKey  = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
    const onFile = e => { handleFileUpload(e); };

    const toggleRec = async () => {
        if (isRec) {
            recRef.current?.stop();
            clearInterval(timerRef.current);
            setIsRec(false); 
            setRecSecs(0);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const rec = new MediaRecorder(stream);
                recRef.current = rec;
                rec.start();
                setIsRec(true);
                timerRef.current = setInterval(() => setRecSecs(t => t + 1), 1000);
                
                rec.onstop = () => {
                    stream.getTracks().forEach(t => t.stop());
                    setInput(p => (p ? p + ' ' : '') + '[Voice message recorded]');
                };
            } catch {
                setError('Microphone access denied.');
            }
        }
    };

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <Layout maxW="max-w-5xl">
            <div className="flex flex-col" style={{ height: 'calc(100vh - 116px)' }}>

                {/* ── Header ─────────────────────────────── */}
                <header className="flex items-center justify-between pb-4 border-b border-white/[0.055] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/[0.07] flex items-center justify-center text-white/55 shrink-0">
                            <BrainCog size={18} strokeWidth={1.7} />
                        </div>
                        <div>
                            <h1 className="text-[16px] font-bold text-white tracking-[-0.4px] m-0 leading-none mb-1">
                                Personalised AI · RAG
                            </h1>
                            <p className="flex items-center gap-1.5 text-[11.5px] text-white/30 m-0 leading-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                Trainable on your documents
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] text-[11px] font-medium text-white/30">
                        <Zap size={11} strokeWidth={2} />
                        Groq · Active
                    </div>
                </header>

                {/* ── Error Alert ────────────────────────── */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-2.5 mt-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[12px]">
                        <AlertCircle size={13} strokeWidth={2} />
                        {error}
                        <button 
                            onClick={() => setError(null)}
                            className="ml-auto text-red-300 hover:text-red-200"
                        >
                            <X size={13} />
                        </button>
                    </div>
                )}

                {/* ── Document Status ────────────────────– */}
                {uploadedDocs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pb-3">
                        {uploadedDocs.map(doc => (
                            <div 
                                key={doc.id}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${
                                    doc.status === 'ready'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                }`}
                            >
                                {doc.status === 'ready' 
                                    ? <CheckCircle size={10} strokeWidth={2} />
                                    : <Loader size={10} strokeWidth={2} className="animate-spin" />
                                }
                                <span className="truncate max-w-[150px]">{doc.fileName}</span>
                                <span className="opacity-60">({doc.chunkCount})</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Feed ───────────────────────────────── */}
                <div className="flex-1 overflow-y-auto py-7 flex flex-col [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.07)_transparent]">
                    {/* Day divider */}
                    <div className="flex items-center gap-3 mb-4 shrink-0">
                        <hr className="flex-1 border-none border-t border-white/[0.055]" />
                        <span className="text-[10.5px] font-medium text-white/20 tracking-wide whitespace-nowrap">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        <hr className="flex-1 border-none border-t border-white/[0.055]" />
                    </div>

                    {/* Messages */}
                    {messages.map((msg, i) => (
                        <Bubble 
                            key={msg.id} 
                            msg={msg} 
                            prevRole={messages[i - 1]?.role ?? null}
                            isSystem={msg.role === 'system'}
                        />
                    ))}

                    {/* Typing */}
                    {isTyping && <div className="mt-3"><TypingDots /></div>}

                    <div ref={bottomRef} />
                </div>

                {/* ── Suggestion chips ────────────────────– */}
                {messages.length <= 2 && uploadedDocs.some(d => d.status === 'ready') && (
                    <div className="flex flex-wrap gap-2 pb-4 shrink-0">
                        {CHIPS.map((c, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(c.label)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-transparent text-white/38 text-[12px] font-medium cursor-pointer transition-all duration-150 hover:border-white/[0.17] hover:text-white/70 hover:bg-white/[0.035] whitespace-nowrap"
                            >
                                <span className="text-[13px]">{c.icon}</span>
                                {c.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Input zone ────────────────────────────── */}
                <div className="shrink-0 border-t border-white/[0.055] pt-3.5">
                    <div className="flex items-end gap-1.5 bg-white/[0.028] border border-white/[0.085] rounded-2xl px-3.5 py-2.5 focus-within:border-white/[0.16] focus-within:bg-white/[0.036] transition-all duration-200">

                        {/* Attach */}
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploadingFile !== null}
                            title="Attach PDF or Word files"
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-transparent border-none text-white/30 cursor-pointer hover:bg-white/[0.07] hover:text-white/65 transition-all duration-150 disabled:opacity-50"
                        >
                            {uploadingFile ? (
                                <Loader size={15} strokeWidth={1.8} className="animate-spin" />
                            ) : (
                                <Paperclip size={15} strokeWidth={1.8} />
                            )}
                        </button>
                        <input 
                            ref={fileRef} 
                            type="file" 
                            multiple 
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                            className="hidden" 
                            onChange={onFile}
                            disabled={uploadingFile !== null}
                        />

                        {/* Divider */}
                        <div className="w-px h-5 bg-white/[0.07] shrink-0 self-end mb-1.5" />

                        {/* Textarea / rec indicator */}
                        {isRec ? (
                            <div className="flex-1 flex items-center gap-2 text-[13px] font-medium text-red-400 py-0.5">
                                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
                                Recording {fmt(recSecs)}
                            </div>
                        ) : (
                            <textarea
                                ref={textaRef}
                                className="flex-1 bg-transparent border-none outline-none text-white/85 text-[13.5px] leading-relaxed resize-none min-h-[22px] max-h-[140px] overflow-y-auto font-[inherit] py-0.5 placeholder:text-white/20 [scrollbar-width:thin]"
                                placeholder={uploadedDocs.length === 0 ? "Upload a file first..." : "Ask about your documents…"}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={onKey}
                                disabled={uploadedDocs.every(d => d.status !== 'ready')}
                                rows={1}
                            />
                        )}

                        {/* Divider */}
                        <div className="w-px h-5 bg-white/[0.07] shrink-0 self-end mb-1.5" />

                        {/* Mic */}
                        <button
                            onClick={toggleRec}
                            title={isRec ? 'Stop' : 'Record voice'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-none cursor-pointer transition-all duration-150 ${
                                isRec
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/15'
                                    : 'bg-transparent text-white/30 hover:bg-white/[0.07] hover:text-white/65'
                            }`}
                        >
                            {isRec ? <StopCircle size={15} strokeWidth={1.8} /> : <Mic size={15} strokeWidth={1.8} />}
                        </button>

                        {/* Send */}
                        <button
                            onClick={send}
                            disabled={!input.trim() || isTyping || uploadedDocs.every(d => d.status !== 'ready')}
                            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 bg-white text-black border-none cursor-pointer transition-all duration-150 hover:opacity-88 hover:scale-[1.04] disabled:opacity-15 disabled:cursor-not-allowed"
                        >
                            <Send size={14} strokeWidth={2} />
                        </button>
                    </div>

                    <p className="text-center text-[10.5px] text-white/15 mt-2.5 tracking-[0.1px]">
                        ↵ Enter to send &nbsp;·&nbsp; Shift+Enter for new line &nbsp;·&nbsp; PDF & Word files up to 10MB
                    </p>
                </div>

            </div>
        </Layout>
    );
};

export default PersonalisedAI;
