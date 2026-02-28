import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { Project } from '../models/Project';
import { Entry } from '../models/Entry';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body as { name: string; color?: string };
    if (!name?.trim()) { res.status(400).json({ error: 'Name is required' }); return; }
    const project = await Project.create({
      userId: req.user!._id,
      name:   name.trim(),
      color:  color || '#3b82f6',
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }

    const count = await Entry.countDocuments({ projectId: project._id, userId: req.user!._id });
    if (count > 0) {
      res.status(400).json({ error: `Cannot delete — project has ${count} entr${count === 1 ? 'y' : 'ies'}` });
      return;
    }

    await project.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
