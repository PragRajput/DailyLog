'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Loader from '@/components/Loader';
import { useUser } from '@/lib/useUser';
import { api } from '@/lib/api';
import type { Task, Project } from '@/lib/types';

const PRIORITY_META = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'  },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  low:    { label: 'Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'  },
};

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  return new Date(dueDate + 'T23:59:59') < new Date();
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(d: string) {
  const diff = Math.ceil((new Date(d + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0)  return `${Math.abs(diff)}d overdue`;
  return `${diff}d left`;
}

const STATUS_TABS = [
  { val: 'pending' as const, label: 'Pending' },
  { val: 'done'    as const, label: 'Done'    },
  { val: 'all'     as const, label: 'All'     },
];

function ProjectPicker({ projects, value, onChange }: { projects: Project[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <button onClick={() => onChange('')} style={{
        padding: '4px 11px', borderRadius: 8,
        background: !value ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${!value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
        color: !value ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
        fontSize: '0.73rem', cursor: 'pointer', transition: 'all 0.15s',
      }}>None</button>
      {projects.map((p) => (
        <button key={p._id} onClick={() => onChange(p._id)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 11px', borderRadius: 8,
          background: value === p._id ? `${p.color}18` : 'rgba(255,255,255,0.02)',
          border: `1px solid ${value === p._id ? `${p.color}50` : 'rgba(255,255,255,0.06)'}`,
          color: value === p._id ? p.color : 'rgba(255,255,255,0.3)',
          fontSize: '0.73rem', cursor: 'pointer', transition: 'all 0.15s',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          {p.name}
        </button>
      ))}
    </div>
  );
}

export default function TasksPage() {
  const { user, loading } = useUser();
  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [projects,     setProjects]     = useState<Project[]>([]);

  // Create form
  const [title,      setTitle]      = useState('');
  const [desc,       setDesc]       = useState('');
  const [dueDate,    setDueDate]    = useState('');
  const [priority,   setPriority]   = useState<'low'|'medium'|'high'>('medium');
  const [projectId,  setProjectId]  = useState<string>('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [showForm,   setShowForm]   = useState(false);

  // Edit state
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editTitle,    setEditTitle]    = useState('');
  const [editDesc,     setEditDesc]     = useState('');
  const [editDue,      setEditDue]      = useState('');
  const [editPriority, setEditPriority] = useState<'low'|'medium'|'high'>('medium');
  const [editProjId,   setEditProjId]   = useState('');
  const [editSaving,   setEditSaving]   = useState(false);

  // Filters
  const [filter,     setFilter]     = useState<'all'|'pending'|'done'>('pending');
  const [projFilter, setProjFilter] = useState<string>('');

  useEffect(() => {
    if (user) {
      Promise.all([api.getTasks(), api.getProjects()]).then(([t, p]) => {
        setTasks(t); setProjects(p);
      });
    }
  }, [user]);

  const create = async () => {
    if (!title.trim()) return;
    setSaving(true); setError('');
    try {
      const t = await api.createTask({ title: title.trim(), description: desc.trim() || undefined, dueDate: dueDate || undefined, priority, projectId: projectId || undefined });
      setTasks((prev) => [t, ...prev]);
      setTitle(''); setDesc(''); setDueDate(''); setPriority('medium'); setProjectId(''); setShowForm(false);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const toggle = async (task: Task) => {
    const updated = await api.updateTask(task._id, { completed: !task.completed });
    setTasks((prev) => prev.map((t) => t._id === task._id ? updated : t));
  };

  const remove = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    if (editingId === id) setEditingId(null);
  };

  const openEdit = (task: Task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditDue(task.dueDate || '');
    setEditPriority(task.priority);
    setEditProjId(task.projectId?._id || '');
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editingId) return;
    setEditSaving(true);
    try {
      const updated = await api.updateTask(editingId, {
        title:       editTitle.trim(),
        description: editDesc.trim() || undefined,
        dueDate:     editDue || undefined,
        priority:    editPriority,
        projectId:   editProjId || null,
      });
      setTasks((prev) => prev.map((t) => t._id === editingId ? updated : t));
      setEditingId(null);
    } catch { /* silent */ }
    finally { setEditSaving(false); }
  };

  if (loading || !user) return <Loader />;

  const pending  = tasks.filter((t) => !t.completed);
  const done     = tasks.filter((t) => t.completed);
  const overdue  = pending.filter((t) => isOverdue(t.dueDate));
  let displayed  = filter === 'all' ? tasks : filter === 'pending' ? pending : done;
  if (projFilter) displayed = displayed.filter((t) => t.projectId?._id === projFilter);
  const today    = new Date().toLocaleDateString('sv');

  return (
    <AppLayout user={user}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', marginBottom: 6, textTransform: 'uppercase' }}>To-Do</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', margin: 0 }}>Tasks</h1>
            <div style={{ marginTop: 5, fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)' }}>
              {pending.length} pending
              {overdue.length > 0 && <span style={{ color: '#f87171', marginLeft: 8 }}>· {overdue.length} overdue</span>}
            </div>
          </div>
          <button className="btn-accent" onClick={() => { setShowForm((v) => !v); setEditingId(null); }} style={{ flexShrink: 0, marginTop: 4 }}>
            {showForm ? '✕ Cancel' : '+ New Task'}
          </button>
        </div>

        {/* ── Add form ── */}
        {showForm && (
          <div className="fade-up" style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18, padding: '20px', marginBottom: 22,
            backdropFilter: 'blur(12px)',
          }}>
            <input
              className="field" autoFocus
              style={{ marginBottom: 10, borderRadius: 12 }}
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) create(); }}
            />
            <textarea
              rows={2} className="field"
              style={{ resize: 'none', borderRadius: 12, marginBottom: 14, fontFamily: 'inherit' }}
              placeholder="Description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            {projects.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>
                  Project <span style={{ color: 'rgba(255,255,255,0.12)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
                </div>
                <ProjectPicker projects={projects} value={projectId} onChange={setProjectId} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Due date</div>
                <input type="date" className="field" style={{ borderRadius: 10, colorScheme: 'dark' }} min={today} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Priority</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {(['low','medium','high'] as const).map((p) => {
                    const m = PRIORITY_META[p];
                    return (
                      <button key={p} onClick={() => setPriority(p)} style={{
                        flex: 1, padding: '6px 0', borderRadius: 8,
                        background: priority === p ? m.bg : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${priority === p ? m.border : 'rgba(255,255,255,0.06)'}`,
                        color: priority === p ? m.color : 'rgba(255,255,255,0.25)',
                        fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      }}>{m.label}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            {error && <p style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: 10 }}>{error}</p>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)' }}>⌘↵ to save</span>
              <button className="btn-accent" onClick={create} disabled={saving || !title.trim()}>{saving ? 'Adding…' : '+ Add Task'}</button>
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            display: 'inline-flex',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: 3, gap: 2, marginBottom: 10,
          }}>
            {STATUS_TABS.map(({ val, label }) => {
              const count = val === 'pending' ? pending.length : val === 'done' ? done.length : tasks.length;
              const active = filter === val;
              return (
                <button key={val} onClick={() => setFilter(val)} style={{
                  padding: '5px 14px', borderRadius: 9,
                  background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(245,158,11,0.22)' : 'transparent'}`,
                  color: active ? '#f59e0b' : 'rgba(255,255,255,0.35)',
                  fontSize: '0.75rem', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {label}
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    background: active ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)',
                    color: active ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                    borderRadius: 99, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                  }}>{count}</span>
                </button>
              );
            })}
          </div>
          {projects.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 2 }}>Project</span>
              {projFilter && (
                <button onClick={() => setProjFilter('')} style={{
                  padding: '3px 9px', borderRadius: 7,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', cursor: 'pointer',
                }}>All ✕</button>
              )}
              {projects.map((p) => {
                const active = projFilter === p._id;
                return (
                  <button key={p._id} onClick={() => setProjFilter(active ? '' : p._id)} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 7,
                    background: active ? `${p.color}18` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${active ? `${p.color}50` : 'rgba(255,255,255,0.07)'}`,
                    color: active ? p.color : 'rgba(255,255,255,0.3)',
                    fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: active ? `0 0 8px ${p.color}18` : 'none',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Task list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.15)', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>✓</div>
              {filter === 'done' ? 'No completed tasks yet.' : 'No tasks. Add one above!'}
            </div>
          ) : displayed.map((task) => {
            const pm     = PRIORITY_META[task.priority];
            const od     = !task.completed && isOverdue(task.dueDate);
            const proj   = task.projectId;
            const stripe = task.completed ? 'rgba(255,255,255,0.08)' : (proj?.color ?? pm.color);
            const isEditing = editingId === task._id;

            return (
              <div key={task._id} className="fade-up" style={{
                background: isEditing ? 'rgba(245,158,11,0.04)' : task.completed ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${isEditing ? 'rgba(245,158,11,0.2)' : od ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14, overflow: 'hidden',
                transition: 'all 0.15s', opacity: (!isEditing && task.completed) ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ width: 3, flexShrink: 0, alignSelf: 'stretch', background: stripe, opacity: 0.75 }} />

                  <button onClick={() => toggle(task)} style={{
                    flexShrink: 0, margin: '14px 12px 0 12px',
                    width: 18, height: 18, borderRadius: 5,
                    background: task.completed ? 'rgba(34,197,94,0.15)' : 'transparent',
                    border: `2px solid ${task.completed ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', color: '#22c55e', transition: 'all 0.15s', padding: 0,
                  }}>{task.completed ? '✓' : ''}</button>

                  <div style={{ flex: 1, padding: '12px 10px 12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.875rem', fontWeight: 600, flex: 1,
                        color: task.completed ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}>{task.title}</span>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em',
                        padding: '2px 7px', borderRadius: 99,
                        background: pm.bg, border: `1px solid ${pm.border}`, color: pm.color,
                      }}>{pm.label}</span>
                    </div>
                    {proj && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: proj.color, boxShadow: `0 0 4px ${proj.color}88` }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: proj.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{proj.name}</span>
                      </div>
                    )}
                    {task.description && (
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', marginTop: 3, lineHeight: 1.4 }}>{task.description}</div>
                    )}
                    {task.dueDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                        <span style={{ fontSize: '0.65rem', color: od ? '#f87171' : 'rgba(255,255,255,0.22)' }}>
                          {od ? '⚠' : '◷'} {formatDate(task.dueDate)}
                        </span>
                        {!task.completed && (
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                            background: od ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${od ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
                            color: od ? '#f87171' : 'rgba(255,255,255,0.28)',
                          }}>{daysUntil(task.dueDate)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 10px 0 0', flexShrink: 0 }}>
                    <button
                      onClick={() => isEditing ? setEditingId(null) : openEdit(task)}
                      title={isEditing ? 'Cancel edit' : 'Edit task'}
                      style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: isEditing ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isEditing ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        cursor: 'pointer',
                        color: isEditing ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                        fontSize: '0.8rem', padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { if (!isEditing) { (e.currentTarget as HTMLElement).style.color = '#f59e0b'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.2)'; } }}
                      onMouseLeave={(e) => { if (!isEditing) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; } }}
                    >✎</button>
                    <button onClick={() => remove(task._id)} style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.25)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >✕</button>
                  </div>
                </div>

                {/* ── Inline edit form ── */}
                {isEditing && (
                  <div style={{
                    padding: '0 16px 16px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    marginTop: 4,
                  }}>
                    <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input
                        className="field" autoFocus
                        style={{ borderRadius: 10, fontSize: '0.875rem' }}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                        placeholder="Task title"
                      />
                      <textarea
                        rows={2} className="field"
                        style={{ resize: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.82rem' }}
                        placeholder="Description (optional)"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />

                      {projects.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Project</div>
                          <ProjectPicker projects={projects} value={editProjId} onChange={setEditProjId} />
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 130 }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Due date</div>
                          <input type="date" className="field" style={{ borderRadius: 10, colorScheme: 'dark', fontSize: '0.82rem' }} value={editDue} onChange={(e) => setEditDue(e.target.value)} />
                        </div>
                        <div style={{ flex: 1, minWidth: 130 }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Priority</div>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {(['low','medium','high'] as const).map((p) => {
                              const m = PRIORITY_META[p];
                              return (
                                <button key={p} onClick={() => setEditPriority(p)} style={{
                                  flex: 1, padding: '5px 0', borderRadius: 8,
                                  background: editPriority === p ? m.bg : 'rgba(255,255,255,0.02)',
                                  border: `1px solid ${editPriority === p ? m.border : 'rgba(255,255,255,0.06)'}`,
                                  color: editPriority === p ? m.color : 'rgba(255,255,255,0.25)',
                                  fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                }}>{m.label}</button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 2 }}>
                        <button onClick={() => setEditingId(null)} style={{
                          padding: '6px 14px', borderRadius: 9,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', cursor: 'pointer',
                        }}>Cancel</button>
                        <button className="btn-accent" onClick={saveEdit} disabled={editSaving || !editTitle.trim()} style={{ padding: '6px 18px' }}>
                          {editSaving ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
