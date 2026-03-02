'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Loader from '@/components/Loader';
import { useUser } from '@/lib/useUser';
import { api } from '@/lib/api';
import type { Entry, Project, Task } from '@/lib/types';

function todayLocal() { return new Date().toLocaleDateString('sv'); }
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

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
  const [editEntryId,     setEditEntryId]     = useState<string | null>(null);
  const [editEntryDesc,   setEditEntryDesc]   = useState('');
  const [editEntryProj,   setEditEntryProj]   = useState('');
  const [editEntrySaving, setEditEntrySaving] = useState(false);

  // Completion modal
  const [completingTask,   setCompletingTask]   = useState<Task | null>(null);
  const [completionNote,   setCompletionNote]   = useState('');
  const [completionProjId, setCompletionProjId] = useState('');
  const [completionSaving, setCompletionSaving] = useState(false);

  // Task detail modal
  const [detailTask,     setDetailTask]     = useState<Task | null>(null);
  const [taskEntries,    setTaskEntries]    = useState<Entry[]>([]);
  const [taskEntLoading, setTaskEntLoading] = useState(false);

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
    // Show tasks with a deadline >= today that are not yet completed
    setTodayTasks(t.filter((tk) => !tk.completed && tk.dueDate && tk.dueDate >= today));
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

  const openCompletion = (task: Task) => {
    setCompletingTask(task);
    setCompletionNote('');
    setCompletionProjId(task.projectId?._id || '');
  };

  const submitCompletion = async (partial: boolean) => {
    if (!completingTask || completionSaving) return;
    setCompletionSaving(true);
    try {
      let entryCreated = false;
      if (completionNote.trim() && completionProjId) {
        const entry = await api.createEntry({
          projectId:   completionProjId,
          date:        today,
          description: completionNote.trim(),
          taskId:      completingTask._id,
        });
        setEntries((prev) => [entry, ...prev]);
        entryCreated = true;
      }
      if (!partial || entryCreated) {
        if (!entryCreated) {
          await api.updateTask(completingTask._id, { completed: true });
        }
        setTodayTasks((prev) => prev.filter((t) => t._id !== completingTask._id));
      }
      setCompletingTask(null);
    } catch { /* silent */ }
    finally { setCompletionSaving(false); }
  };

  const openDetail = async (task: Task) => {
    setDetailTask(task);
    setTaskEntries([]);
    setTaskEntLoading(true);
    try {
      const entries = await api.getTaskEntries(task._id);
      setTaskEntries(entries);
    } finally { setTaskEntLoading(false); }
  };

  if (loading || !user) return <Loader />;

  const selProj = projects.find((p) => p._id === projectId);
  const pendingToday = todayTasks.length;

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
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Checkbox → opens completion modal */}
                    <button
                      onClick={() => openCompletion(t)}
                      title="Log progress"
                      style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer', padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'rgba(34,197,94,0.5)'; (e.currentTarget).style.background = 'rgba(34,197,94,0.08)'; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget).style.background = 'rgba(255,255,255,0.04)'; }}
                    />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, flexShrink: 0, background: c, boxShadow: `0 0 5px ${c}66` }} />
                      {t.projectId && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: t.projectId.color, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                          {t.projectId.name}
                        </span>
                      )}
                      <span style={{ fontSize: '0.83rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                        background: t.priority === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${t.priority === 'high' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        color: PRIORITY_COLOR[t.priority],
                      }}>{t.priority}</span>
                      {/* Detail button */}
                      <button
                        onClick={() => openDetail(t)}
                        title="View task details"
                        style={{
                          width: 22, height: 22, borderRadius: 5,
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                          cursor: 'pointer', color: 'rgba(255,255,255,0.25)',
                          fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#93c5fd'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.2)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      >⊙</button>
                    </div>
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
                    {saving ? <span style={{ opacity: 0.7 }}>Saving…</span> : <><span style={{ fontSize: '0.9rem' }}>+</span> Add Entry</>}
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

                    {isEditing && (
                      <div style={{ padding: '0 14px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
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

      {/* ── Completion Modal ── */}
      {completingTask && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => { if (!completionSaving) setCompletingTask(null); }}
        >
          <div
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 5 }}>
              Log Progress
            </div>
            <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, margin: '0 0 14px', lineHeight: 1.4 }}>
              {completingTask.title}
            </h3>

            {completingTask.projectId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: '0.7rem', fontWeight: 700,
                  color: completingTask.projectId.color,
                  padding: '3px 9px', borderRadius: 99,
                  background: completingTask.projectId.color + '18',
                  border: `1px solid ${completingTask.projectId.color}30`,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: completingTask.projectId.color }} />
                  {completingTask.projectId.name}
                </span>
              </div>
            )}

            <textarea
              rows={3} autoFocus
              className="field"
              style={{ resize: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 18 }}
              placeholder="What did you accomplish? (optional — skip to just mark done)"
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape' && !completionSaving) setCompletingTask(null); }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCompletingTask(null)}
                disabled={completionSaving}
                style={{
                  padding: '7px 14px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={() => submitCompletion(true)}
                disabled={completionSaving || !completionNote.trim()}
                style={{
                  padding: '7px 16px', borderRadius: 9,
                  background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.22)',
                  color: '#93c5fd', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  opacity: !completionNote.trim() ? 0.35 : 1,
                }}
              >Log partial</button>
              <button
                onClick={() => submitCompletion(false)}
                disabled={completionSaving}
                style={{
                  padding: '7px 16px', borderRadius: 9,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)',
                  color: '#4ade80', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                }}
              >{completionSaving ? '…' : 'Mark done ✓'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Detail Modal ── */}
      {detailTask && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setDetailTask(null)}
        >
          <div
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, maxWidth: 480, width: '100%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>Task Details</div>
              <button onClick={() => setDetailTask(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '1rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}>✕</button>
            </div>
            <h3 style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 14px', lineHeight: 1.4 }}>{detailTask.title}</h3>

            {detailTask.description && (
              <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.85rem', margin: '0 0 16px', lineHeight: 1.6 }}>{detailTask.description}</p>
            )}

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
              {detailTask.projectId && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: detailTask.projectId.color, padding: '3px 9px', borderRadius: 99, background: detailTask.projectId.color + '18', border: `1px solid ${detailTask.projectId.color}30` }}>
                  {detailTask.projectId.name}
                </span>
              )}
              <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: PRIORITY_COLOR[detailTask.priority] }}>
                {detailTask.priority} priority
              </span>
              {detailTask.dueDate && (
                <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)', color: '#93c5fd' }}>
                  Deadline: {formatDate(detailTask.dueDate)}
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10 }}>
              Progress Log
            </div>
            {taskEntLoading ? (
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>Loading…</div>
            ) : taskEntries.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.82rem', textAlign: 'center', padding: '20px 0' }}>
                No progress logged yet. Click the checkbox to log your first entry.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {taskEntries.map((e) => (
                  <div key={e._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{formatDate(e.date)}</span>
                      {e.projectId && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: e.projectId.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{e.projectId.name}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{e.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
