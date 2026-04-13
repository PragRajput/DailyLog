'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Floating orb config
const ORBS = [
  { size: 500, top: '-10%', left: '-10%',  color: 'rgba(245,158,11,0.07)', dur: 18 },
  { size: 400, top: '50%',  left: '60%',   color: 'rgba(249,115,22,0.06)', dur: 22 },
  { size: 300, top: '70%',  left: '10%',   color: 'rgba(245,158,11,0.05)', dur: 15 },
  { size: 250, top: '20%',  left: '75%',   color: 'rgba(251,191,36,0.05)', dur: 25 },
];

// Particle config
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  dur: Math.random() * 8 + 6,
  delay: Math.random() * 6,
  opacity: Math.random() * 0.4 + 0.1,
}));

function LoginContent() {
  const params  = useSearchParams();
  const error   = params.get('error');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleGoogleClick = () => {
    setLoading(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#080916' }}>

      {/* ── Animated orbs ── */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          animate={{ x: [0, 30, -20, 10, 0], y: [0, -20, 30, -10, 0], scale: [1, 1.05, 0.95, 1.02, 1] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
          style={{
            position: 'absolute', top: orb.top, left: orb.left,
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            pointerEvents: 'none', filter: 'blur(1px)',
          }}
        />
      ))}

      {/* ── Particles ── */}
      {mounted && PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -30, 0], opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: 'rgba(245,158,11,0.7)',
            boxShadow: '0 0 4px rgba(245,158,11,0.4)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Grid lines overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, padding: '0 24px' }}
      >
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: 24 }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
            {greeting()}
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <motion.div
            animate={{ boxShadow: ['0 8px 32px rgba(245,158,11,0.25)', '0 8px 48px rgba(245,158,11,0.45)', '0 8px 32px rgba(245,158,11,0.25)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg,#f59e0b,#f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
              fontSize: '1.6rem', color: '#0a0b14', fontWeight: 800,
            }}
          >✦</motion.div>

          <h1 style={{
            fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 10px',
            background: 'linear-gradient(135deg,#f59e0b,#f97316)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>DailyLog</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: 1.6 }}>
            Track what you build, every single day.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 24, padding: '28px 24px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,158,11,0.04)',
          }}
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: '0.82rem', textAlign: 'center' }}
              >
                Login failed — please try again.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google button */}
          <motion.a
            href={`${API}/auth/google`}
            onClick={handleGoogleClick}
            whileHover={!loading ? { y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              width: '100%', padding: '14px 20px',
              background: loading ? 'rgba(255,255,255,0.9)' : '#ffffff',
              color: '#1a1a2e', fontWeight: 700, fontSize: '0.92rem',
              borderRadius: 13, textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              transition: 'background 0.2s',
              pointerEvents: loading ? 'none' : 'auto',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Shimmer on loading */}
            {loading && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)',
                  pointerEvents: 'none',
                }}
              />
            )}

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(26,26,46,0.2)', borderTopColor: '#1a1a2e' }}
                  />
                  <span>Redirecting…</span>
                </motion.div>
              ) : (
                <motion.div key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </motion.div>
              )}
            </AnimatePresence>
          </motion.a>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.17)', marginTop: 18, marginBottom: 0, lineHeight: 1.5 }}>
            Your data is private and only visible to you.
          </p>
        </motion.div>

        {/* Bottom feature hints */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24, flexWrap: 'wrap' }}
        >
          {['Daily logs', 'Task tracking', 'AI summaries'].map((label) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(245,158,11,0.5)', flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}
