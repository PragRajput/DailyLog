import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth } from '../middleware/requireAuth';
import { Entry } from '../models/Entry';
import { Task } from '../models/Task';
import { IProject } from '../models/Project';

const router = Router();
router.use(requireAuth);

function getDateRange(query: string): { startDate: string; endDate: string } {
  const now   = new Date();
  const today = now.toLocaleDateString('sv');
  const q     = query.toLowerCase();

  let startDate: string;
  const endDate = today;

  if (q.includes('today')) {
    return { startDate: today, endDate: today };
  } else if (q.includes('yesterday')) {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    const d = y.toLocaleDateString('sv');
    return { startDate: d, endDate: d };
  } else if (q.includes('this week')) {
    const s = new Date(now); s.setDate(s.getDate() - s.getDay());
    startDate = s.toLocaleDateString('sv');
  } else if (q.includes('last week') || q.includes('past week')) {
    const s = new Date(now); s.setDate(s.getDate() - 7);
    startDate = s.toLocaleDateString('sv');
  } else if (q.includes('this month')) {
    startDate = today.slice(0, 7) + '-01';
  } else if (q.includes('last month') || q.includes('past month')) {
    const s = new Date(now); s.setMonth(s.getMonth() - 1);
    startDate = s.toLocaleDateString('sv');
  } else {
    const s = new Date(now); s.setDate(s.getDate() - 7);
    startDate = s.toLocaleDateString('sv');
  }

  return { startDate, endDate };
}

function isTomorrow(q: string) {
  // catch "tomorrow" and common typos: "tommorow", "tomorow", "tomoro", etc.
  return /tomor{1,2}o{1,2}w?/.test(q);
}

function isTaskQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('task') || q.includes('todo') || q.includes('to-do') ||
    q.includes('overdue') || q.includes('upcoming') || q.includes('deadline') ||
    q.includes('pending') || isTomorrow(q) ||
    (q.includes('due') && !q.includes('did'))
  );
}

function getTaskDateRange(query: string): { startDate: string; endDate: string; overdue: boolean } {
  const now   = new Date();
  const today = now.toLocaleDateString('sv');
  const q     = query.toLowerCase();

  if (q.includes('overdue')) {
    return { startDate: '2020-01-01', endDate: today, overdue: true };
  }
  if (isTomorrow(q)) {
    const t = new Date(now); t.setDate(t.getDate() + 1);
    return { startDate: t.toLocaleDateString('sv'), endDate: t.toLocaleDateString('sv'), overdue: false };
  }
  if (q.includes('today')) {
    return { startDate: today, endDate: today, overdue: false };
  }
  if (q.includes('next week') || q.includes('upcoming week') || q.includes('this week') || q.includes('week')) {
    const end = new Date(now); end.setDate(end.getDate() + 7);
    return { startDate: today, endDate: end.toLocaleDateString('sv'), overdue: false };
  }
  if (q.includes('this month') || q.includes('month')) {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: today, endDate: end.toLocaleDateString('sv'), overdue: false };
  }
  // default: next 7 days
  const end = new Date(now); end.setDate(end.getDate() + 7);
  return { startDate: today, endDate: end.toLocaleDateString('sv'), overdue: false };
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { query } = req.body as { query: string };
    if (!query?.trim()) { res.status(400).json({ error: 'Query is required' }); return; }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    // ── Task query ──
    if (isTaskQuery(query)) {
      const { startDate, endDate, overdue } = getTaskDateRange(query);
      const today = new Date().toLocaleDateString('sv');

      const filter: Record<string, unknown> = { userId: (req.user as any)._id };
      if (overdue) {
        filter.completed = false;
        filter.dueDate   = { $lt: today };
      } else {
        filter.dueDate = { $gte: startDate, $lte: endDate };
      }

      const tasks = await Task.find(filter)
        .populate('projectId', 'name color')
        .sort({ dueDate: 1, priority: -1 });

      if (!tasks.length) {
        const label = overdue
          ? 'No overdue tasks — all caught up!'
          : `No tasks due between ${startDate} and ${endDate}.`;
        res.json({ summary: label, startDate, endDate, entryCount: 0, taskCount: 0, type: 'tasks' });
        return;
      }

      const lines = tasks.map((t) => {
        const proj = (t.projectId as any)?.name ?? null;
        const due  = t.dueDate ?? 'no due date';
        const done = t.completed ? '[DONE]' : '[PENDING]';
        return `${done} ${proj ? `[${proj}] ` : ''}${t.title} (priority: ${t.priority}, due: ${due})`;
      });

      const prompt = `You are a helpful task assistant. The user asked: "${query}"

Here are the relevant tasks:
${lines.join('\n')}

Summarize these tasks helpfully. Group by project when multiple projects exist. Highlight high-priority items. Mention due dates. Keep it concise and actionable. Use markdown.`;

      const result = await model.generateContent(prompt);
      res.json({
        summary: result.response.text(),
        startDate, endDate,
        entryCount: tasks.length,
        taskCount: tasks.length,
        type: 'tasks',
      });
      return;
    }

    // ── Entry / journal query ──
    const { startDate, endDate } = getDateRange(query);

    const entries = await Entry.find({
      userId: (req.user as any)._id,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('projectId', 'name color')
      .sort({ date: 1 });

    if (!entries.length) {
      res.json({ summary: `No entries found between ${startDate} and ${endDate}.`, startDate, endDate, entryCount: 0, type: 'entries' });
      return;
    }

    const lines = entries.map((e) => {
      const proj = (e.projectId as IProject | null)?.name ?? 'Unknown';
      return `[${e.date}] ${proj}: ${e.description}`;
    });

    const prompt = `You are a work activity summarizer. A developer is asking about their recent work.

User query: "${query}"
Date range: ${startDate} to ${endDate}

Journal entries:
${lines.join('\n')}

Write a concise summary grouped by project. Format:
## Project Name
- [Date] What was done

Add a 1-2 sentence overall summary at the end.`;

    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text(), startDate, endDate, entryCount: entries.length, type: 'entries' });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
