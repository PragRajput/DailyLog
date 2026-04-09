'use client';

import { motion } from 'framer-motion';

const particles = [
  { size: 3, left: '8%',  top: '22%', dur: 2.8, delay: 0 },
  { size: 2, left: '15%', top: '55%', dur: 3.2, delay: 0.4 },
  { size: 4, left: '22%', top: '35%', dur: 2.5, delay: 0.8 },
  { size: 2, left: '30%', top: '68%', dur: 3.6, delay: 0.2 },
  { size: 3, left: '38%', top: '18%', dur: 2.9, delay: 1.1 },
  { size: 2, left: '48%', top: '75%', dur: 3.1, delay: 0.6 },
  { size: 4, left: '58%', top: '28%', dur: 2.6, delay: 0.9 },
  { size: 2, left: '65%', top: '60%', dur: 3.4, delay: 0.3 },
  { size: 3, left: '73%', top: '42%', dur: 2.7, delay: 1.3 },
  { size: 2, left: '80%', top: '20%', dur: 3.0, delay: 0.7 },
  { size: 3, left: '87%', top: '58%', dur: 2.4, delay: 0.5 },
  { size: 2, left: '92%', top: '38%', dur: 3.3, delay: 1.0 },
];

export default function Loader() {
  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: '#070810',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background ambient glow */}
      <motion.div
        style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? 'rgba(249,115,22,0.6)' : 'rgba(245,158,11,0.35)',
            left: p.left, top: p.top,
            boxShadow: i % 4 === 0 ? '0 0 6px rgba(245,158,11,0.6)' : 'none',
          }}
          animate={{
            y: [-14, 14, -14],
            opacity: [0.15, 0.9, 0.15],
            scale: [0.7, 1.3, 0.7],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* Laptop shell */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >

        {/* Screen lid */}
        <motion.div
          style={{
            width: 200, height: 130,
            background: 'linear-gradient(160deg,#1a1b2e,#111220)',
            borderRadius: '10px 10px 3px 3px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderBottom: '2px solid rgba(255,255,255,0.04)',
            position: 'relative',
            overflow: 'hidden',
            padding: 5,
          }}
          animate={{
            boxShadow: [
              '0 -4px 40px rgba(0,0,0,0.6), 0 0 0px rgba(245,158,11,0)',
              '0 -4px 40px rgba(0,0,0,0.6), 0 0 30px rgba(245,158,11,0.12)',
              '0 -4px 40px rgba(0,0,0,0.6), 0 0 0px rgba(245,158,11,0)',
            ],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Bezel glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          {/* Screen area */}
          <div style={{
            width: '100%', height: '100%',
            background: '#07080f',
            borderRadius: '9px 9px 2px 2px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 10,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Screen breathe glow */}
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 45%, rgba(245,158,11,0.10) 0%, transparent 65%)',
                pointerEvents: 'none',
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Logo icon */}
            <motion.div
              style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(145deg,#f59e0b,#f97316)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', color: '#07080f', fontWeight: 900,
                position: 'relative', zIndex: 1,
              }}
              animate={{
                boxShadow: [
                  '0 0 14px rgba(245,158,11,0.35)',
                  '0 0 28px rgba(245,158,11,0.65)',
                  '0 0 14px rgba(245,158,11,0.35)',
                ],
                scale: [1, 1.06, 1],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >✦</motion.div>

            {/* App name */}
            <div style={{
              fontSize: '0.72rem', fontWeight: 800, letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg,#f59e0b,#f97316)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              position: 'relative', zIndex: 1,
            }}>DailyLog</div>

            {/* Progress bar */}
            <div style={{
              width: 80, height: 2,
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 99, overflow: 'hidden',
              position: 'relative', zIndex: 1,
            }}>
              <motion.div
                style={{
                  height: '100%', width: '40%',
                  borderRadius: 99,
                  background: 'linear-gradient(90deg, transparent, #f59e0b, #f97316, transparent)',
                }}
                animate={{ x: ['-140%', '360%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Scanline effect */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
              pointerEvents: 'none', borderRadius: 9,
            }} />
          </div>

          {/* Webcam dot */}
          <motion.div
            style={{
              position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
              width: 4, height: 4, borderRadius: '50%',
              background: '#1a1b2e',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Hinge */}
        <div style={{
          width: 214, height: 4,
          background: 'linear-gradient(180deg,#1c1d30,#131420)',
          borderRadius: '0 0 2px 2px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }} />

        {/* Keyboard base */}
        <div style={{
          width: 224, height: 30,
          background: 'linear-gradient(180deg,#151626,#0f1020)',
          borderRadius: '0 0 10px 10px',
          border: '2px solid rgba(255,255,255,0.07)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 3,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, opacity: 0.3 }}>
            {[10, 12, 11].map((count, row) => (
              <div key={row} style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: count }).map((_, i) => (
                  <div key={i} style={{
                    width: row === 2 && i === 0 ? 12 : 6,
                    height: 3, borderRadius: 1,
                    background: 'rgba(255,255,255,0.25)',
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Base shadow */}
        <motion.div
          style={{
            width: 180, height: 5, marginTop: 2,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
          animate={{ scaleX: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />

      </motion.div>
    </div>
  );
}
