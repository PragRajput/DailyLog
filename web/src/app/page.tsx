'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/AppLayout';
import Loader from '@/components/Loader';
import { useUser } from '@/lib/useUser';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import type { Entry, Project, Task } from '@/lib/types';

function todayLocal() { return new Date().toLocaleDateString('sv'); }
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

const PRIORITY_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  { label: 'Smileys', emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😵‍💫','🤠','🥸','🥳','😷','🤒','🤕','🤢','🤮','🤧','😇','🥹','🫠','🤡','🤓'] },
  { label: 'People', emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁','👅','👄','🫦','💋','👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🫅','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🫃','🤱','👼','🎅','🤶','🧑‍🎄','🦸','🦹','🧙','🧝','🧛','🧟','🧞','🧜','🧚','🧑‍🤝‍🧑','👫','👬','👭','💏','💑','👨‍👩‍👦','🗣️','👤','💃','🕺'] },
  { label: 'Animals', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪲','🦟','🦗','🪳','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🪺','🪹','🍄','🌾','💐','🌷','🌹','🥀','🪷','🌺','🌸','🌼','🌻','🌞','🌝','🍋','🍊','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🫛','🫑','🌶️','🥦','🥬','🥒','🫒','🌰','🥜','🍞','🥐','🥖','🫓','🥨','🥯','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖'] },
  { label: 'Food', emojis: ['🍕','🌭','🍔','🍟','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🧁','🍡','🍧','🍨','🍦','🥧','🧊','🍬','🍭','🍮','🍯','🍩','🍪','🎂','🍰','🥮','🍫','☕','🫖','🍵','🧋','🥛','🍺','🍻','🥂','🍷','🫗','🥃','🍸','🍹','🧉','🍾','🧃','🥤','🧊','🥢','🍽️','🍴','🥄','🫙'] },
  { label: 'Travel', emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🚤','🛥️','🛳️','⛴️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🪐','🌍','🌎','🌏','🌐','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏗️','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','🎠','🎡','🎢','💈','🎪','🛎️','🧳','⌛','⏰','🌡️','☂️','☔','🌂','🌬️','🌀','🌈','🌊','🌌'] },
  { label: 'Activities', emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🛝','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🏇','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🪘','🥁','🪗','🎷','🎺','🪕','🎸','🎹','🎲','♟️','🎯','🎳','🎰','🎮','🕹️','🧩','🪅','🪆','🪄','🃏','🀄','🎴','🔮','🧿'] },
  { label: 'Objects', emojis: ['📱','💻','🖥️','🖨️','⌨️','🖱️','🖲️','💽','💾','💿','📀','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🧭','⏱️','⏲️','⏰','🕰️','⌛','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💰','💳','💎','⚖️','🔧','🪛','🔩','⚙️','🗜️','🔗','⛓️','🪝','🧲','🪜','🧰','🪤','🗑️','🛡️','⚔️','🪚','🔫','🪃','🏹','🪤','🔑','🗝️','🔐','🔒','🔓','🪪','🧲','🔬','🔭','📡','💉','🩸','💊','🩹','🩺','🩻','🩼','🧬','🦠','🧪','🧫','🧲','🪞','🪟','🛋️','🪑','🚿','🛁','🪠','🧴','🪥','🧷','🧹','🧺','🧻','🪣','🧼','🫧','🧽','🪒','🧻','🛒','🚪','🪞','🎁','🎀','🎊','🎉','🎈','🎋','🎍','🎎','🎐','🎏','🧧','🎆','🎇'] },
  { label: 'Symbols', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','📶','🛜','📳','📴','⚜️','🔱','📛','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧','🚻','🚮','🎦','📵','🔇','🔕','🔔','🔊','📢','📣','🔉','🔈','🃏','🀄','♠️','♣️','♥️','♦️','🎴','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔷','🔶','🔹','🔸','🔲','🔳','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔉','🔊','📯','🔔','🔕','🎵','🎶','✔️','🔖','🏷️','💱','💲','➕','➖','➗','✖️','🟰','♾️','💲','⚡','🌟','✨','💫','⭐','🌠','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','🍃','💨','🌪️','🌈','☔','💧','💦','🌊'] },
];

function renderRichText(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer"
            style={{ color: '#60a5fa', textDecoration: 'underline', wordBreak: 'break-all' }}>
            {part}
          </a>
        ) : (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
        )
      )}
    </>
  );
}

function needsExpand(text: string) {
  const lines = text.split('\n');
  return lines.length > 2 || text.length > 180;
}

// Motion variants
const listVariants = { show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 30 } },
  exit:   { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
  exit:   { opacity: 0, transition: { duration: 0.2 } },
};

export default function TodayPage() {
  const { user, loading } = useUser();
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [entries,     setEntries]     = useState<Entry[]>([]);
  const [todayTasks,  setTodayTasks]  = useState<Task[]>([]);
  const [description, setDescription] = useState('');
  const [hours,       setHours]       = useState('');
  const [projectId,   setProjectId]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  // Entry edit state
  const [editEntryId,     setEditEntryId]     = useState<string | null>(null);
  const [editEntryDesc,   setEditEntryDesc]   = useState('');
  const [editEntryProj,   setEditEntryProj]   = useState('');
  const [editEntryHours,  setEditEntryHours]  = useState('');
  const [editEntrySaving, setEditEntrySaving] = useState(false);

  // Completion modal
  const [completingTask,    setCompletingTask]   = useState<Task | null>(null);
  const [completionNote,    setCompletionNote]   = useState('');
  const [completionHours,   setCompletionHours]  = useState('');
  const [completionProjId,  setCompletionProjId] = useState('');
  const [completionSaving,  setCompletionSaving] = useState(false);
  const [completionError,   setCompletionError]  = useState('');

  // Task detail modal
  const [detailTask,     setDetailTask]     = useState<Task | null>(null);
  const [taskEntries,    setTaskEntries]    = useState<Entry[]>([]);
  const [taskEntLoading, setTaskEntLoading] = useState(false);

  // Entry expand / emoji picker
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setTodayTasks(t.filter((tk) => !tk.completed && Boolean(tk.dueDate)));
    if (p.length) setProjectId((id) => id || p[0]._id);
  }, [today]);

  useEffect(() => { if (user) load(); }, [user, load]);

  const addEntry = async () => {
    if (!projectId) { setError('Select a project first.'); return; }
    if (!description.trim()) { setError('Add a description before saving.'); return; }
    setSaving(true); setError('');
    try {
      const parsedHours = parseFloat(hours);
      const entry = await api.createEntry({
        projectId, date: today, description: description.trim(),
        hours: !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : null,
      });
      setEntries((prev) => [entry, ...prev]);
      setDescription('');
      setHours('');
    } catch (e) {
      setError((e as Error).message);
    }
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
    setEditEntryHours(e.hours != null ? String(e.hours) : '');
  };

  const saveEditEntry = async () => {
    if (!editEntryDesc.trim() || !editEntryId) return;
    setEditEntrySaving(true);
    try {
      const parsedHours = parseFloat(editEntryHours);
      const updated = await api.updateEntry(editEntryId, {
        description: editEntryDesc.trim(),
        projectId:   editEntryProj || undefined,
        hours:       !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : null,
      });
      setEntries((prev) => prev.map((e) => e._id === editEntryId ? updated : e));
      setEditEntryId(null);
    } catch { /* silent */ }
    finally { setEditEntrySaving(false); }
  };

  const openCompletion = (task: Task) => {
    setCompletingTask(task);
    setCompletionNote('');
    setCompletionHours('');
    setCompletionError('');
    setCompletionProjId(task.projectId?._id || projectId || '');
  };

  const submitCompletion = async (partial: boolean) => {
    if (!completingTask || completionSaving) return;
    if (completionNote.trim() && !completionProjId) {
      setCompletionError('Select a project to save the entry.');
      return;
    }
    setCompletionSaving(true);
    setCompletionError('');
    try {
      if (completionNote.trim() && completionProjId) {
        const parsedHours = parseFloat(completionHours);
        const entry = await api.createEntry({
          projectId:   completionProjId,
          date:        today,
          description: completionNote.trim(),
          taskId:      completingTask._id,
          hours:       !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : null,
        });
        setEntries((prev) => [entry, ...prev]);
      }
      if (!partial) {
        await api.updateTask(completingTask._id, { completed: true });
        setTodayTasks((prev) => prev.filter((t) => t._id !== completingTask._id));
      }
      setCompletingTask(null);
    } catch (e) {
      setCompletionError((e as Error).message);
    }
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

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) { setDescription((d) => d + emoji); return; }
    const start = ta.selectionStart ?? description.length;
    const end   = ta.selectionEnd   ?? description.length;
    const next  = description.slice(0, start) + emoji + description.slice(end);
    setDescription(next);
    setShowEmojiPicker(false);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
  };

  const toggleExpand = (id: string) =>
    setExpandedEntries((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  if (loading || !user) return <Loader />;
  // if (true) return <Loader />;

  const activeProjects = projects.filter((p) => !p.archived);
  const selProj = activeProjects.find((p) => p._id === projectId);
  const pendingToday = todayTasks.length;

  return (
    <AppLayout user={user}>
      <div style={{ padding: '32px' }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <div style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.18)', marginBottom: 6, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }}
              />
              Today
            </div>
            <h1 style={{
              fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px',
              background: 'linear-gradient(90deg, #f1f5f9 0%, #94a3b8 40%, #f59e0b 100%)',
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {dateLabel}
            </h1>
          </div>
          <AnimatePresence>
            {(entries.length > 0 || todayTasks.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'center' }}
              >
                {entries.length > 0 && <Badge variant="blue">{entries.length} entr{entries.length === 1 ? 'y' : 'ies'} logged</Badge>}
                {pendingToday > 0 && <Badge variant="default">{pendingToday} task{pendingToday === 1 ? '' : 's'} due today</Badge>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: Log Work + Entries ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Log Work card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, overflow: 'visible', boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{
                padding: '12px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', borderRadius: '18px 18px 0 0',
              }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
                  Log Work
                </span>
                {selProj && (
                  <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: selProj.color, fontWeight: 700 }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: selProj.color, boxShadow: `0 0 8px ${selProj.color}` }} />
                    {selProj.name}
                  </motion.span>
                )}
              </div>
              <div style={{ padding: '16px 18px' }}>
                {activeProjects.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem', margin: '8px 0' }}>
                    No projects yet — <a href="/projects" style={{ color: '#f59e0b', textDecoration: 'none' }}>create one first →</a>
                  </p>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {activeProjects.map((p) => {
                        const active = projectId === p._id;
                        return (
                          <motion.button key={p._id} onClick={() => setProjectId(p._id)}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20,
                              background: active ? p.color + '22' : 'rgba(255,255,255,0.03)',
                              border: `1.5px solid ${active ? p.color : 'rgba(255,255,255,0.08)'}`,
                              color: active ? p.color : 'rgba(255,255,255,0.35)',
                              fontSize: '0.75rem', fontWeight: active ? 700 : 500, cursor: 'pointer',
                              boxShadow: active ? `0 0 12px ${p.color}33` : 'none',
                              transition: 'background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s',
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: active ? `0 0 6px ${p.color}` : 'none' }} />
                            {p.name}
                          </motion.button>
                        );
                      })}
                    </div>
                    <textarea
                      ref={textareaRef} rows={6} className="field"
                      style={{ resize: 'none', borderRadius: 12, marginBottom: 6, fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6 }}
                      placeholder={selProj ? `What did you work on for ${selProj.name}?` : 'What did you work on?'}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addEntry(); }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginBottom: showEmojiPicker ? 8 : 10, alignItems: 'center' }}>
                      <motion.button onClick={() => setShowEmojiPicker((v) => !v)} title="Insert emoji"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{
                          background: showEmojiPicker ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${showEmojiPicker ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 7, padding: '4px 10px', cursor: 'pointer',
                          fontSize: '0.72rem', fontWeight: 600, color: showEmojiPicker ? '#f59e0b' : 'rgba(255,255,255,0.45)',
                          lineHeight: 1, display: 'flex', alignItems: 'center', gap: 5,
                          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>☺</span> Emoji
                      </motion.button>

                      {/* Hours input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, overflow: 'hidden' }}>
                        <span style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>⏱ hrs</span>
                        <input
                          type="number"
                          min="0.25" max="24" step="0.25"
                          placeholder="—"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          style={{
                            width: 52, background: 'transparent', border: 'none', outline: 'none',
                            color: hours ? '#f1f5f9' : 'rgba(255,255,255,0.25)',
                            fontSize: '0.78rem', fontWeight: 600, padding: '4px 8px',
                            fontFamily: 'inherit', textAlign: 'center',
                          }}
                        />
                      </div>
                    </div>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div key="emoji-picker" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}
                        >
                          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '10px 10px 6px', marginBottom: 10, maxHeight: 220, overflowY: 'auto' }}>
                            {EMOJI_CATEGORIES.map((cat) => (
                              <div key={cat.label} style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{cat.label}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {cat.emojis.map((em) => (
                                    <motion.button key={em} onClick={() => insertEmoji(em)}
                                      whileHover={{ scale: 1.25, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem', padding: '3px', borderRadius: 5, lineHeight: 1 }}
                                    >{em}</motion.button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: 10 }}
                        >{error}</motion.p>
                      )}
                    </AnimatePresence>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <motion.span animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.02em' }}
                      >⌘↵ to save</motion.span>
                      <motion.button className="btn-accent" onClick={addEntry} disabled={saving}
                        whileHover={!saving ? { scale: 1.04, y: -1 } : {}} whileTap={{ scale: 0.96 }}
                        style={{ minWidth: 100, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', opacity: (!description.trim() || !projectId) ? 0.45 : 1, transition: 'opacity 0.15s' }}
                      >
                        {saving ? <span style={{ opacity: 0.7 }}>Saving…</span> : <><span style={{ fontSize: '0.9rem' }}>+</span> Add Entry</>}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Entries list */}
            <AnimatePresence mode="wait">
              {entries.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.12)' }}
                >
                  <motion.div animate={{ opacity: [0.2, 0.5, 0.2], rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ fontSize: '2rem', marginBottom: 10 }}
                  >✦</motion.div>
                  <div style={{ fontSize: '0.85rem' }}>Nothing logged yet — start your day above.</div>
                </motion.div>
              ) : (
                <motion.div key="entries-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10 }}>
                    {entries.length} Logged Entr{entries.length === 1 ? 'y' : 'ies'}
                  </div>
                  <motion.div variants={listVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <AnimatePresence initial={false}>
                      {entries.map((e) => {
                        const isEditing = editEntryId === e._id;
                        return (
                          <motion.div key={e._id} variants={itemVariants} layout
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            whileHover={!isEditing ? { borderColor: e.projectId?.color ? `${e.projectId.color}40` : 'rgba(255,255,255,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' } : {}}
                            style={{
                              background: isEditing ? 'rgba(245,158,11,0.03)' : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${isEditing ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.055)'}`,
                              borderRadius: 13, overflow: 'hidden', transition: 'border-color 0.2s, background 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'stretch' }}>
                              <div style={{ width: 3, flexShrink: 0, background: e.projectId?.color || '#555', boxShadow: `2px 0 8px ${e.projectId?.color || '#555'}44` }} />
                              <div style={{ flex: 1, padding: '12px 15px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.63rem', fontWeight: 800, color: e.projectId?.color || '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                      {e.projectId?.name}
                                    </span>
                                    {e.hours != null && e.hours > 0 && (
                                      <span style={{
                                        fontSize: '0.62rem', fontWeight: 700,
                                        color: 'rgba(255,255,255,0.4)',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        borderRadius: 5, padding: '1px 6px',
                                        display: 'flex', alignItems: 'center', gap: 3,
                                      }}>
                                        ⏱ {e.hours}h
                                      </span>
                                    )}
                                  </div>
                                  {(() => {
                                    const expanded = expandedEntries.has(e._id);
                                    const long = needsExpand(e.description);
                                    return (
                                      <>
                                        <div style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, ...(!expanded && long ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' } : { whiteSpace: 'pre-wrap' }) }}>
                                          {renderRichText(e.description)}
                                        </div>
                                        {long && (
                                          <motion.button onClick={() => toggleExpand(e._id)} whileHover={{ color: '#93c5fd' }}
                                            style={{ background: 'none', border: 'none', padding: '2px 0', marginTop: 2, color: '#60a5fa', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                                          >{expanded ? 'show less' : 'read more'}</motion.button>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                                  <motion.button onClick={() => isEditing ? setEditEntryId(null) : openEditEntry(e)}
                                    whileHover={{ scale: 1.1, color: '#f59e0b' }} whileTap={{ scale: 0.9 }}
                                    style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${isEditing ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`, background: isEditing ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', color: isEditing ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  >✎</motion.button>
                                  <motion.button onClick={() => deleteEntry(e._id)}
                                    whileHover={{ scale: 1.1, color: '#f87171', borderColor: 'rgba(239,68,68,0.35)' }} whileTap={{ scale: 0.9 }}
                                    style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  >✕</motion.button>
                                </div>
                              </div>
                            </div>
                            <AnimatePresence>
                              {isEditing && (
                                <motion.div key="edit-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}
                                >
                                  <div style={{ padding: '12px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                                      {activeProjects.map((p) => {
                                        const active = editEntryProj === p._id;
                                        return (
                                          <motion.button key={p._id} onClick={() => setEditEntryProj(p._id)}
                                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: active ? p.color + '22' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${active ? p.color : 'rgba(255,255,255,0.08)'}`, color: active ? p.color : 'rgba(255,255,255,0.35)', fontSize: '0.72rem', fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s' }}
                                          >
                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: p.color }} />
                                            {p.name}
                                          </motion.button>
                                        );
                                      })}
                                    </div>
                                    <textarea rows={2} autoFocus className="field"
                                      style={{ resize: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 10 }}
                                      value={editEntryDesc}
                                      onChange={(ev) => setEditEntryDesc(ev.target.value)}
                                      onKeyDown={(ev) => { if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) saveEditEntry(); if (ev.key === 'Escape') setEditEntryId(null); }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, overflow: 'hidden' }}>
                                        <span style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>⏱ hrs</span>
                                        <input
                                          type="number"
                                          min="0.25" max="24" step="0.25"
                                          placeholder="—"
                                          value={editEntryHours}
                                          onChange={(ev) => setEditEntryHours(ev.target.value)}
                                          style={{
                                            width: 52, background: 'transparent', border: 'none', outline: 'none',
                                            color: editEntryHours ? '#f1f5f9' : 'rgba(255,255,255,0.25)',
                                            fontSize: '0.78rem', fontWeight: 600, padding: '4px 8px',
                                            fontFamily: 'inherit', textAlign: 'center',
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                      <motion.button onClick={() => setEditEntryId(null)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        style={{ padding: '5px 13px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', cursor: 'pointer' }}
                                      >Cancel</motion.button>
                                      <motion.button className="btn-accent" onClick={saveEditEntry} disabled={editEntrySaving || !editEntryDesc.trim()}
                                        whileHover={!editEntrySaving && editEntryDesc.trim() ? { scale: 1.04 } : {}} whileTap={{ scale: 0.96 }} style={{ padding: '5px 16px' }}
                                      >{editEntrySaving ? 'Saving…' : 'Save'}</motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>{/* end LEFT col */}

          {/* ── RIGHT: Today's Tasks ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
            style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
                Due Today
              </span>
              {pendingToday > 0 && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 99 }}>
                  {pendingToday}
                </span>
              )}
            </div>
            <div style={{ padding: '12px 14px' }}>
              {todayTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>✓</div>
                  No tasks due today
                </div>
              ) : (
                <motion.div variants={listVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {todayTasks.map((t) => {
                    const c = t.projectId?.color ?? PRIORITY_COLOR[t.priority];
                    return (
                      <motion.div key={t._id} variants={itemVariants} layout whileHover={{ x: 2 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, borderLeft: `3px solid ${c}`, background: `${c}08`, transition: 'background 0.2s' }}
                      >
                        <motion.button onClick={() => openCompletion(t)} title="Log progress"
                          whileHover={{ scale: 1.15, borderColor: 'rgba(34,197,94,0.6)' }} whileTap={{ scale: 0.9 }}
                          style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                          {t.projectId && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: t.projectId.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {t.projectId.name}
                            </span>
                          )}
                          <motion.button onClick={() => openCompletion(t)} title="Log progress" whileHover={{ color: '#f1f5f9' }}
                            style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, textAlign: 'left', fontSize: '0.83rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', minWidth: 0 }}
                          >{t.title}</motion.button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: t.priority === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${t.priority === 'high' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`, color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                          <motion.button onClick={() => openDetail(t)} title="View task details"
                            whileHover={{ scale: 1.1, color: '#93c5fd' }} whileTap={{ scale: 0.9 }}
                            style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >⊙</motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>{/* end RIGHT col */}

        </div>{/* end grid */}
      </div>

      {/* ── Completion Modal ── */}
      <AnimatePresence>
        {completingTask && (
          <motion.div
            key="completion-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={() => { if (!completionSaving) setCompletingTask(null); }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            <motion.div
              key="completion-modal"
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(ev) => ev.stopPropagation()}
              style={{
                background: '#0d0f1c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: 24, maxWidth: 440, width: '100%',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.05)',
              }}
            >
              <div style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 5,
              }}>
                Log Progress
              </div>
              <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, margin: '0 0 14px', lineHeight: 1.4 }}>
                {completingTask.title}
              </h3>

              {/* Project selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {activeProjects.map((p) => {
                  const active = completionProjId === p._id;
                  return (
                    <motion.button
                      key={p._id}
                      onClick={() => { setCompletionProjId(p._id); setCompletionError(''); }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 11px', borderRadius: 20,
                        background: active ? p.color + '22' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${active ? p.color : 'rgba(255,255,255,0.08)'}`,
                        color: active ? p.color : 'rgba(255,255,255,0.35)',
                        fontSize: '0.75rem', fontWeight: active ? 700 : 500, cursor: 'pointer',
                        boxShadow: active ? `0 0 10px ${p.color}33` : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      {p.name}
                    </motion.button>
                  );
                })}
              </div>

              <textarea
                rows={3} autoFocus
                className="field"
                style={{ resize: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 12 }}
                placeholder="What did you accomplish? (optional — skip to just mark done)"
                value={completionNote}
                onChange={(ev) => setCompletionNote(ev.target.value)}
                onKeyDown={(ev) => { if (ev.key === 'Escape' && !completionSaving) setCompletingTask(null); }}
              />

              {/* Hours */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>⏱ hrs spent</span>
                  <input
                    type="number"
                    min="0.25" max="24" step="0.25"
                    placeholder="—"
                    value={completionHours}
                    onChange={(ev) => setCompletionHours(ev.target.value)}
                    style={{
                      width: 60, background: 'transparent', border: 'none', outline: 'none',
                      color: completionHours ? '#f1f5f9' : 'rgba(255,255,255,0.25)',
                      fontSize: '0.82rem', fontWeight: 600, padding: '6px 10px',
                      fontFamily: 'inherit', textAlign: 'center',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>optional</span>
              </div>

              <AnimatePresence>
                {completionError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: 12 }}
                  >{completionError}</motion.p>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <motion.button
                  onClick={() => setCompletingTask(null)}
                  disabled={completionSaving}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '7px 14px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', cursor: 'pointer',
                  }}
                >Cancel</motion.button>
                <motion.button
                  onClick={() => submitCompletion(true)}
                  disabled={completionSaving || !completionNote.trim()}
                  whileHover={!completionNote.trim() ? {} : { scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '7px 16px', borderRadius: 9,
                    background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.22)',
                    color: '#93c5fd', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    opacity: !completionNote.trim() ? 0.35 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >Save entry</motion.button>
                <motion.button
                  onClick={() => submitCompletion(false)}
                  disabled={completionSaving}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 16px rgba(34,197,94,0.2)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '7px 16px', borderRadius: 9,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)',
                    color: '#4ade80', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >{completionSaving ? '…' : 'Mark done ✓'}</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Task Detail Modal ── */}
      <AnimatePresence>
        {detailTask && (
          <motion.div
            key="detail-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={() => setDetailTask(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            <motion.div
              key="detail-modal"
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(ev) => ev.stopPropagation()}
              style={{
                background: '#0d0f1c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: 24, maxWidth: 480, width: '100%',
                maxHeight: '80vh', overflow: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(96,165,250,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{
                  fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase',
                }}>Task Details</div>
                <motion.button
                  onClick={() => setDetailTask(null)}
                  whileHover={{ scale: 1.15, color: '#f87171' }}
                  whileTap={{ scale: 0.9 }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '1rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >✕</motion.button>
              </div>
              <h3 style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 14px', lineHeight: 1.4 }}>
                {detailTask.title}
              </h3>

              {detailTask.description && (
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.85rem', margin: '0 0 16px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {detailTask.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
                {detailTask.projectId && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, color: detailTask.projectId.color,
                    padding: '3px 9px', borderRadius: 99,
                    background: detailTask.projectId.color + '18',
                    border: `1px solid ${detailTask.projectId.color}30`,
                  }}>
                    {detailTask.projectId.name}
                  </span>
                )}
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: PRIORITY_COLOR[detailTask.priority],
                }}>
                  {detailTask.priority} priority
                </span>
                {detailTask.dueDate && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                    background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)', color: '#93c5fd',
                  }}>
                    Deadline: {formatDate(detailTask.dueDate)}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10,
              }}>
                Progress Log
              </div>
              {taskEntLoading ? (
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>Loading…</div>
              ) : taskEntries.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.82rem', textAlign: 'center', padding: '20px 0' }}>
                  No progress logged yet. Click the task or checkbox in Today to log your first entry.
                </div>
              ) : (
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'flex', flexDirection: 'column', gap: 7 }}
                >
                  {taskEntries.map((e) => (
                    <motion.div
                      key={e._id}
                      variants={itemVariants}
                      style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 10, padding: '10px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{formatDate(e.date)}</span>
                        {e.projectId && (
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700, color: e.projectId.color,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}>{e.projectId.name}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{renderRichText(e.description)}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
