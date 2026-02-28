import { Router, Request, Response } from 'express';
import passport from 'passport';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=1`,
  }),
  (_req: Request, res: Response) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

router.get('/me', (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) { res.json(null); return; }
  const { _id, name, email, avatar } = req.user;
  res.json({ id: _id, name, email, avatar });
});

router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) { res.status(500).json({ error: 'Logout failed' }); return; }
    res.json({ ok: true });
  });
});

export default router;
