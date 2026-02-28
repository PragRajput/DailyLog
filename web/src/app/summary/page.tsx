'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AppLayout from '@/components/AppLayout';
import Loader from '@/components/Loader';
import { useUser } from '@/lib/useUser';
import { api } from '@/lib/api';

const SUGGESTIONS = [
  'What did I do today?',
  'What did I work on last week?',
  'Summarise this month\'s work',
  'What did I do yesterday?',
];

export default function SummaryPage() {
  const { user, loading } = useUser();
  const [query,    setQuery]    = useState('');
  const [summary,  setSummary]  = useState('');
  const [meta,     setMeta]     = useState<{ startDate: string; endDate: string; entryCount: number } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error,    setError]    = useState('');

  const ask = async (q?: string) => {
    const text = (q ?? query).trim();
    if (!text) return;
    if (q) setQuery(q);
    setFetching(true); setSummary(''); setError(''); setMeta(null);
    try {
      const res = await api.getSummary(text);
      setSummary(res.summary);
      setMeta({ startDate: res.startDate, endDate: res.endDate, entryCount: res.entryCount });
    } catch (e) { setError((e as Error).message); }
    finally { setFetching(false); }
  };

  if (loading || !user) return <Loader />;

  return (
    <AppLayout user={user}>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', marginBottom: 6, textTransform: 'uppercase' }}>AI Insights</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', margin: 0 }}>
            Summary
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.28)', marginTop: 5, marginBottom: 0 }}>
            Ask anything about your work history in plain English.
          </p>
        </div>

        {/* Suggestion chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} style={{
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20,
              color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.25)'; (e.currentTarget as HTMLElement).style.color = '#f59e0b'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
            >{s}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input
            className="field"
            style={{ flex: 1, borderRadius: 14 }}
            placeholder="e.g. what did I work on last week?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
          />
          <button
            className="btn-accent"
            onClick={() => ask()}
            disabled={fetching || !query.trim()}
            style={{ flexShrink: 0, minWidth: 80, textAlign: 'center' }}
          >
            {fetching ? '…' : '✧ Ask'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px', background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12,
            color: '#f87171', fontSize: '0.83rem', marginBottom: 16,
          }}>{error}</div>
        )}

        {/* Loading indicator */}
        {fetching && (
          <div style={{
            padding: '24px', textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
              ✧ Analysing your work history…
            </div>
          </div>
        )}

        {/* Result */}
        {summary && !fetching && (
          <div className="fade-up">
            {meta && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
                  {meta.entryCount} entr{meta.entryCount === 1 ? 'y' : 'ies'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.15)' }}>
                  {meta.startDate} → {meta.endDate}
                </span>
              </div>
            )}

            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '22px 24px',
              backdropFilter: 'blur(12px)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Glow accent */}
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 200, height: 200,
                background: 'radial-gradient(circle at top right,rgba(245,158,11,0.05),transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div className="md-body" style={{ position: 'relative', zIndex: 1 }}>
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
