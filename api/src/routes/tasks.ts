import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { Task } from '../models/Task';

const router = Router();

// GET /api/tasks
router.get('/', requireAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: (req.user as any)._id })
      .populate('projectId', 'name color')
      .sort({ completed: 1, dueDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /api/tasks
router.post('/', requireAuth, async (req, res) => {
  const { title, description, dueDate, priority, projectId } = req.body as {
    title?: string; description?: string; dueDate?: string; priority?: string; projectId?: string;
  };
  if (!title?.trim()) { res.status(400).json({ error: 'Title is required' }); return; }
  try {
    const task = await (await Task.create({
      userId:      (req.user as any)._id,
      title:       title.trim(),
      description: description?.trim() || undefined,
      dueDate:     dueDate || undefined,
      priority:    priority || 'medium',
      projectId:   projectId || null,
    })).populate('projectId', 'name color');
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const update: Record<string, unknown> = {};
    const { title, description, dueDate, priority, completed, projectId } = req.body;
    if (title       !== undefined) update.title       = String(title).trim();
    if (description !== undefined) update.description = String(description).trim() || undefined;
    if (dueDate     !== undefined) update.dueDate     = dueDate || undefined;
    if (priority    !== undefined) update.priority    = priority;
    if (projectId   !== undefined) update.projectId   = projectId || null;
    if (completed   !== undefined) {
      update.completed   = Boolean(completed);
      update.completedAt = completed ? new Date() : undefined;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: (req.user as any)._id },
      { $set: update },
      { new: true }
    ).populate('projectId', 'name color');
    if (!task) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: (req.user as any)._id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
