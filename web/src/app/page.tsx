'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Loader from '@/components/Loader';
import { useUser } from '@/lib/useUser';
import { api } from '@/lib/api';
import type { Entry, Project, Task } from '@/lib/types';

function todayLocal() { return new Date().toLocaleDateString('sv'); }

const PRIORITY_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

export default function TodayPage() {
  const { user, loading } = useUser();
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [entries,     setEntries]     = useState<Entry[]>([]);
  const [todayTasks,  setTodayTasks]  = useState<Task[]>([]);
  const [description, setDescription] = useState('');
  const [projectId,   setProjectId]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  // Entry edit state
  const [editEntryId,   setEditEntryId]   = useState<string | null>(null);
  const [editEntryDesc, setEditEntryDesc] = useState('');
  const [editEntryProj, setEditEntryProj] = useState('');
  const [editEntrySaving, setEditEntrySaving] = useState(false);

  const today = todayLocal();
  const dateLabel = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const load = useCallback(async () => {
    const [p, e, t] = await Promise.all([
      api.getProjects(),
      api.getEntries({ date: today }),
      api.getTasks(),
    ]);
    setProjects(p);
    setEntries(e);
    setTodayTasks(t.filter((tk) => tk.dueDate === today));
    if (p.length) setProjectId((id) => id || p[0]._id);
  }, [today]);

  useEffect(() => { if (user) load(); }, [user, load]);

  const addEntry = async () => {
    if (!description.trim() || !projectId) return;
    setSaving(true); setError('');
    try {
      const entry = await api.createEntry({ projectId, date: today, description: description.trim() });
      setEntries((prev) => [entry, ...prev]);
      setDescription('');
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const deleteEntry = async (id: string) => {
    await api.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e._id !== id));
    if (editEntryId === id) setEditEntryId(null);
  };

  const openEditEntry = (e: Entry) => {
    setEditEntryId(e._id);
    setEditEntryDesc(e.description);
    setEditEntryProj(e.projectId?._id || '');
  };

  const saveEditEntry = async () => {
    if (!editEntryDesc.trim() || !editEntryId) return;
    setEditEntrySaving(true);
    try {
      const updated = await api.updateEntry(editEntryId, {
        description: editEntryDesc.trim(),
        projectId:   editEntryProj || undefined,
      });
      setEntries((prev) => prev.map((e) => e._id === editEntryId ? updated : e));
      setEditEntryId(null);
    } catch { /* silent */ }
    finally { setEditEntrySaving(false); }
  };

  const toggleTask = async (task: Task, completed: boolean) => {
    await api.updateTask(task._id, { completed });
    setTodayTasks((prev) => prev.map((t) => t._id === task._id ? { ...t, completed } : t));

    // Auto-log as an entry when marking done (requires a linked project)
    if (completed && task.projectId) {
      try {
        const entry = await api.createEntry({
          projectId: task.projectId._id,
          date: today,
          description: `✓ ${task.title}`,
        });
        setEntries((prev) => [entry, ...prev]);
      } catch { /* best-effort */ }
    }
  };

  if (loading || !user) return <Loader />;

  const selProj = projects.find((p) => p._id === projectId);
  const pendingToday = todayTasks.filter((t) => !t.completed).length;

  return (
    <AppLayout user={user}>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.2)', marginBottom: 6, textTransform: 'uppercase' }}>
            Today
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', margin: '0 0 6px' }}>
            {dateLabel}
          </h1>

          {/* Stats pills */}
          {(entries.length > 0 || todayTasks.length > 0) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {entries.length > 0 && (
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)',
                  color: '#93c5fd',
                }}>
                  {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} logged
                </span>
              )}
              {pendingToday > 0 && (
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                  color: '#fbbf24',
                }}>
                  {pendingToday} task{pendingToday === 1 ? '' : 's'} pending
                </span>
              )}
              {todayTasks.length > 0 && todayTasks.every((t) => t.completed) && (
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                  color: '#4ade80',
                }}>
                  ✓ All tasks done
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Today's Tasks ── */}
        {todayTasks.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '16px 18px', marginBottom: 20,
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 12 }}>
              Today's Tasks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayTasks.map((t) => {
                const c = t.projectId?.color ?? PRIORITY_COLOR[t.priority];
                return (
                  <div key={t._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    opacity: t.completed ? 0.5 : 1, transition: 'opacity 0.2s',
                  }}>
                    <button
                      onClick={() => toggleTask(t, !t.completed)}
                      style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        background: t.completed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${t.completed ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
                        cursor: 'pointer', padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#22c55e', fontSize: '0.65rem', fontWeight: 900,
                        transition: 'all 0.15s',
                      }}
                    >{t.completed ? '✓' : ''}</button>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: 2, flexShrink: 0,
                        background: c, boxShadow: `0 0 5px ${c}66`,
                      }} />
                      {t.projectId && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: t.projectId.color, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                          {t.projectId.name}
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.83rem', color: t.completed ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
                        textDecoration: t.completed ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{t.title}</span>
                    </div>
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700,
                      padding: '2px 7px', borderRadius: 99,
                      background: t.priority === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${t.priority === 'high' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
                      color: PRIORITY_COLOR[t.priority],
                      flexShrink: 0,
                    }}>{t.priority}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Add Entry Card ── */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, overflow: 'hidden', marginBottom: 24,
          boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
        }}>
          {/* Card header */}
          <div style={{
            padding: '12px 18px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.01)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
              Log Work
            </span>
            {selProj && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: selProj.color, fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: selProj.color }} />
                {selProj.name}
              </span>
            )}
          </div>

          <div style={{ padding: '16px 18px' }}>
            {projects.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem', margin: '8px 0' }}>
                No projects yet —{' '}
                <a href="/projects" style={{ color: '#f59e0b', textDecoration: 'none' }}>create one first →</a>
              </p>
            ) : (
              <>
                {/* Project picker */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {projects.map((p) => {
                    const active = projectId === p._id;
                    return (
                      <button key={p._id} onClick={() => setProjectId(p._id)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 11px', borderRadius: 20,
                        background: active ? p.color + '22' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${active ? p.color : 'rgba(255,255,255,0.08)'}`,
                        color: active ? p.color : 'rgba(255,255,255,0.35)',
                        fontSize: '0.75rem', fontWeight: active ? 700 : 500,
                        cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: active ? `0 0 12px ${p.color}33` : 'none',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        {p.name}
                      </button>
                    );
                  })}
                </div>

                {/* Textarea */}
                <textarea
                  rows={3}
                  className="field"
                  style={{ resize: 'none', borderRadius: 12, marginBottom: 12, fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6 }}
                  placeholder={selProj ? `What did you work on for ${selProj.name}?` : 'What did you work on?'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addEntry(); }}
                />

                {error && <p style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: 10 }}>{error}</p>}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.02em' }}>⌘↵ to save</span>
                  <button
                    className="btn-accent"
                    onClick={addEntry}
                    disabled={saving || !description.trim() || !projectId}
                    style={{ minWidth: 100, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                  >
                    {saving ? (
                      <span style={{ opacity: 0.7 }}>Saving…</span>
                    ) : (
                      <><span style={{ fontSize: '0.9rem' }}>+</span> Add Entry</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Entries List ── */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10, opacity: 0.4 }}>✦</div>
            <div style={{ fontSize: '0.85rem' }}>Nothing logged yet — start your day above.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10 }}>
              {entries.length} Logged Entr{entries.length === 1 ? 'y' : 'ies'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {entries.map((e) => {
                const isEditing = editEntryId === e._id;
                return (
                  <div
                    key={e._id}
                    className="fade-up"
                    style={{
                      background: isEditing ? 'rgba(245,158,11,0.03)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditing ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.055)'}`,
                      borderRadius: 13, overflow: 'hidden',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {/* Display row */}
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      <div style={{
                        width: 3, flexShrink: 0,
                        background: e.projectId?.color || '#555',
                        boxShadow: `2px 0 8px ${e.projectId?.color || '#555'}44`,
                      }} />
                      <div style={{ flex: 1, padding: '12px 15px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{
                            fontSize: '0.63rem', fontWeight: 800, marginRight: 8,
                            color: e.projectId?.color || '#888',
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                          }}>
                            {e.projectId?.name}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>{e.description}</span>
                        </div>
                        {/* Edit + Delete */}
                        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                          <button
                            onClick={() => isEditing ? setEditEntryId(null) : openEditEntry(e)}
                            style={{
                              width: 26, height: 26, borderRadius: 6, border: `1px solid ${isEditing ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`,
                              background: isEditing ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                              cursor: 'pointer', color: isEditing ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                              fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(ev) => { if (!isEditing) { (ev.currentTarget).style.color = '#f59e0b'; (ev.currentTarget).style.borderColor = 'rgba(245,158,11,0.2)'; } }}
                            onMouseLeave={(ev) => { if (!isEditing) { (ev.currentTarget).style.color = 'rgba(255,255,255,0.3)'; (ev.currentTarget).style.borderColor = 'rgba(255,255,255,0.08)'; } }}
                          >✎</button>
                          <button
                            onClick={() => deleteEntry(e._id)}
                            style={{
                              width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.03)',
                              cursor: 'pointer', color: 'rgba(255,255,255,0.25)',
                              fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(ev) => { (ev.currentTarget).style.color = '#f87171'; (ev.currentTarget).style.borderColor = 'rgba(239,68,68,0.25)'; }}
                            onMouseLeave={(ev) => { (ev.currentTarget).style.color = 'rgba(255,255,255,0.25)'; (ev.currentTarget).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                          >✕</button>
                        </div>
                      </div>
                    </div>

                    {/* Inline edit form */}
                    {isEditing && (
                      <div style={{ padding: '0 14px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                        {/* Project picker */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                          {projects.map((p) => {
                            const active = editEntryProj === p._id;
                            return (
                              <button key={p._id} onClick={() => setEditEntryProj(p._id)} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '3px 10px', borderRadius: 20,
                                background: active ? p.color + '22' : 'rgba(255,255,255,0.03)',
                                border: `1.5px solid ${active ? p.color : 'rgba(255,255,255,0.08)'}`,
                                color: active ? p.color : 'rgba(255,255,255,0.35)',
                                fontSize: '0.72rem', fontWeight: active ? 700 : 500,
                                cursor: 'pointer', transition: 'all 0.15s',
                              }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: p.color }} />
                                {p.name}
                              </button>
                            );
                          })}
                        </div>
                        <textarea
                          rows={2} autoFocus
                          className="field"
                          style={{ resize: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 10 }}
                          value={editEntryDesc}
                          onChange={(ev) => setEditEntryDesc(ev.target.value)}
                          onKeyDown={(ev) => { if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) saveEditEntry(); if (ev.key === 'Escape') setEditEntryId(null); }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button onClick={() => setEditEntryId(null)} style={{
                            padding: '5px 13px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', cursor: 'pointer',
                          }}>Cancel</button>
                          <button className="btn-accent" onClick={saveEditEntry} disabled={editEntrySaving || !editEntryDesc.trim()} style={{ padding: '5px 16px' }}>
                            {editEntrySaving ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
