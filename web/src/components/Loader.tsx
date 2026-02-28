export default function Loader() {
  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: '#070810',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>

      {/* ── Laptop shell ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Screen lid */}
        <div style={{
          width: 200, height: 130,
          background: 'linear-gradient(160deg,#1a1b2e,#111220)',
          borderRadius: '10px 10px 3px 3px',
          border: '2px solid rgba(255,255,255,0.1)',
          borderBottom: '2px solid rgba(255,255,255,0.04)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)',
          position: 'relative',
          overflow: 'hidden',
          padding: 5,
        }}>
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
            {/* Screen glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 45%, rgba(245,158,11,0.08) 0%, transparent 65%)',
              animation: 'screenBreathe 2.8s ease-in-out infinite',
              pointerEvents: 'none',
            }} />

            {/* Logo icon */}
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(145deg,#f59e0b,#f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem', color: '#07080f', fontWeight: 900,
              boxShadow: '0 0 14px rgba(245,158,11,0.35)',
              animation: 'iconPulse 2.8s ease-in-out infinite',
              position: 'relative', zIndex: 1,
            }}>✦</div>

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
              <div style={{
                height: '100%', width: '40%',
                borderRadius: 99,
                background: 'linear-gradient(90deg, transparent, #f59e0b, #f97316, transparent)',
                animation: 'sweep 1.5s ease-in-out infinite',
              }} />
            </div>

            {/* Scanline effect */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
              pointerEvents: 'none', borderRadius: 9,
            }} />
          </div>

          {/* Webcam dot */}
          <div style={{
            position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
            width: 4, height: 4, borderRadius: '50%',
            background: '#1a1b2e',
            border: '1px solid rgba(255,255,255,0.08)',
          }} />
        </div>

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
          {/* Keyboard rows - tiny dots */}
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
        <div style={{
          width: 180, height: 5, marginTop: 2,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <style>{`
        @keyframes screenBreathe {
          0%, 100% { opacity: 0.8; }
          50%       { opacity: 1.4; }
        }
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.35); transform: scale(1); }
          50%       { box-shadow: 0 0 32px rgba(245,158,11,0.55); transform: scale(1.05); }
        }
        @keyframes sweep {
          0%   { transform: translateX(-140%); }
          100% { transform: translateX(360%); }
        }
      `}</style>
    </div>
  );
}
