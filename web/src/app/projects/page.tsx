'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Loader from '@/components/Loader';
import { useUser } from '@/lib/useUser';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';

const PALETTE = ['#3b82f6','#22c55e','#a855f7','#f97316','#ef4444','#eab308','#ec4899','#14b8a6'];

export default function ProjectsPage() {
  const { user, loading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name,     setName]     = useState('');
  const [color,    setColor]    = useState(PALETTE[0]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => { if (user) api.getProjects().then(setProjects); }, [user]);

  const create = async () => {
    if (!name.trim()) return;
    setSaving(true); setError('');
    try {
      const p = await api.createProject({ name: name.trim(), color });
      setProjects((prev) => [p, ...prev]);
      setName('');
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    setError('');
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (e) { setError((e as Error).message); }
  };

  if (loading || !user) return <Loader />;

  return (
    <AppLayout user={user}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', marginBottom: 6, textTransform: 'uppercase' }}>Manage</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', margin: 0 }}>Projects</h1>
        </div>

        {/* Create form */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 18, padding: '20px', marginBottom: 20,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            New project
          </div>

          <input
            className="field"
            style={{ marginBottom: 14, borderRadius: 12 }}
            placeholder="Project name (e.g. TrueDialog, Side Project…)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
          />

          {/* Color picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginRight: 4 }}>Color</span>
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: '50%', background: c,
                  border: `2px solid ${color === c ? '#fff' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s', padding: 0, outline: 'none',
                  transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: color === c ? `0 0 10px ${c}88` : 'none',
                }}
              />
            ))}
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}88` }} />
            <span style={{ fontSize: '0.82rem', color: name ? '#f1f5f9' : 'rgba(255,255,255,0.2)', fontWeight: name ? 600 : 400 }}>
              {name || 'Project preview'}
            </span>
          </div>

          {error && <p style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: 10 }}>{error}</p>}

          <button className="btn-accent" onClick={create} disabled={saving || !name.trim()}>
            {saving ? 'Creating…' : '+ Create Project'}
          </button>
        </div>

        {/* Project list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.15)', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>⬡</div>
              No projects yet. Create one above.
            </div>
          ) : projects.map((p) => (
            <div key={p._id} className="fade-up" style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 13, overflow: 'hidden',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ width: 4, flexShrink: 0, alignSelf: 'stretch', background: p.color, boxShadow: `2px 0 12px ${p.color}55` }} />
              <div style={{ flex: 1, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}88`, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{p.name}</span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
                  {new Date(p.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
                <button onClick={() => remove(p._id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.13)', fontSize: '0.72rem', padding: '2px 6px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#f87171')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.13)')}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', marginTop: 14, textAlign: 'center' }}>
          Projects with entries cannot be deleted.
        </p>
      </div>
    </AppLayout>
  );
}
