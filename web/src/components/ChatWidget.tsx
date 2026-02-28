'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  meta?: { startDate: string; endDate: string; entryCount: number; taskCount?: number; type?: 'entries' | 'tasks' };
  loading?: boolean;
}

const QUICK = [
  { icon: '◫', label: "What did I work on today?" },
  { icon: '✓', label: "Tasks due today" },
  { icon: '📅', label: "Upcoming week tasks" },
  { icon: '⚠', label: "Any overdue tasks?" },
  { icon: '◫', label: "Summarise this week" },
];

export default function ChatWidget() {
  const [open, setOpen]     = useState(false);
  const [input, setInput]   = useState('');
  const [msgs, setMsgs]     = useState<Message[]>([]);
  const [busy, setBusy]     = useState(false);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);
  const panelRef            = useRef<HTMLDivElement>(null);
  const toggleRef           = useRef<HTMLButtonElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Scroll to bottom + focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        bottomRef.current?.scrollIntoView({ behavior: 'instant' });
      }, 80);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        toggleRef.current && !toggleRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: '', loading: true }]);
    setBusy(true);
    try {
      const res = await api.getSummary(q);
      setMsgs((m) => [
        ...m.slice(0, -1),
        { role: 'assistant', text: res.summary, meta: { startDate: res.startDate, endDate: res.endDate, entryCount: res.entryCount, taskCount: res.taskCount, type: res.type } },
      ]);
    } catch (e) {
      setMsgs((m) => [
        ...m.slice(0, -1),
        { role: 'assistant', text: `Error: ${(e as Error).message}` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div ref={panelRef} style={{
          position: 'fixed', bottom: 84, right: 24, zIndex: 900,
          width: 360, height: 500,
          background: 'linear-gradient(160deg,#0d0e1e,#090a17)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 20,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.06)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease',
        }}>

          {/* Panel header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(245,158,11,0.04)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#f59e0b,#f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem',
            }}>✧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>Work Assistant</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Ask about your work or tasks</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.25)', fontSize: '1rem', padding: '2px 6px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '12px 0' }}>
                <div style={{ fontSize: '1.6rem' }}>✧</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.5 }}>
                  Ask about your work entries<br />or tasks in plain English.
                </div>
                {/* Quick prompts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
                  {QUICK.map(({ icon, label }) => (
                    <button key={label} onClick={() => send(label)} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '7px 12px',
                      color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.2)'; (e.currentTarget as HTMLElement).style.color = '#f59e0b'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}
                    >
                      <span style={{ opacity: 0.6 }}>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.loading ? (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px 14px 14px 4px',
                    fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)',
                  }}>
                    ✧ Thinking…
                  </div>
                ) : m.role === 'user' ? (
                  <div style={{
                    padding: '9px 14px',
                    background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.1))',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '14px 14px 4px 14px',
                    fontSize: '0.82rem', color: '#fde68a', maxWidth: '85%', lineHeight: 1.4,
                  }}>{m.text}</div>
                ) : (
                  <div style={{ maxWidth: '95%' }}>
                    {m.meta && (
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginBottom: 4, paddingLeft: 2 }}>
                        {m.meta.type === 'tasks'
                          ? `${m.meta.taskCount ?? m.meta.entryCount} task${(m.meta.taskCount ?? m.meta.entryCount) === 1 ? '' : 's'}`
                          : `${m.meta.entryCount} entr${m.meta.entryCount === 1 ? 'y' : 'ies'}`
                        } · {m.meta.startDate} → {m.meta.endDate}
                      </div>
                    )}
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '14px 14px 14px 4px',
                      fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.55,
                    }}>
                      <div className="md-body md-chat"><ReactMarkdown>{m.text}</ReactMarkdown></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              className="field"
              style={{ flex: 1, borderRadius: 12, fontSize: '0.82rem', padding: '8px 12px' }}
              placeholder="Ask about your work…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              disabled={busy}
            />
            <button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: 12,
                background: (busy || !input.trim()) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#f59e0b,#f97316)',
                border: 'none', cursor: (busy || !input.trim()) ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', color: (busy || !input.trim()) ? 'rgba(255,255,255,0.2)' : '#0a0b14',
                transition: 'all 0.15s',
              }}
            >
              {busy ? '…' : '↑'}
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        ref={toggleRef}
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 901,
          width: 52, height: 52, borderRadius: '50%',
          background: open
            ? 'rgba(15,17,30,0.95)'
            : 'linear-gradient(135deg,#f59e0b,#f97316)',
          border: open ? '1px solid rgba(245,158,11,0.3)' : 'none',
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.5)'
            : '0 4px 20px rgba(245,158,11,0.35), 0 0 0 1px rgba(245,158,11,0.2)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: open ? '1.1rem' : '1.3rem',
          color: open ? '#f59e0b' : '#0a0b14',
          transition: 'all 0.25s ease',
          transform: open ? 'scale(0.9)' : 'scale(1)',
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        title={open ? 'Close chat' : 'Ask about your work'}
      >
        {open ? '✕' : '✧'}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .md-chat p { margin: 0 0 6px; }
        .md-chat p:last-child { margin-bottom: 0; }
        .md-chat ul, .md-chat ol { margin: 4px 0 6px 16px; padding: 0; }
        .md-chat li { margin-bottom: 2px; }
        .md-chat strong { color: #f1f5f9; }
      `}</style>
    </>
  );
}
