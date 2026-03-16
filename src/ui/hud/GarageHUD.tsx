import { DRIVER } from '../../data/portfolio'
import { useGameStore } from '../../state/gameStore'

export default function GarageHUD() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <>
      {/* Driver info card — top right */}
      <div
        className="hud-glass hud-noise"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 320,
          zIndex: 250,
          padding: '14px 16px 16px',
          color: 'var(--text)',
          fontFamily: '"Orbitron", "Rajdhani", sans-serif',
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
          animation: 'hudIn 0.4s ease',
          border: '1px solid rgba(0,255,136,0.18)',
          boxShadow: '0 0 18px rgba(0,255,136,0.1), 0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Green accent top line */}
        <div style={{
          position: 'absolute', top: 0, left: 16, right: 16, height: 1.5,
          background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.7) 40%, rgba(0,255,136,0.7) 60%, transparent)',
        }} />

        {/* Number + Team */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--muted)', marginBottom: 2 }}>GRID SLOT</div>
            <div style={{
              fontFamily: '"Orbitron", monospace',
              fontSize: 48,
              lineHeight: 1,
              fontWeight: 900,
              color: 'var(--accent-red)',
              letterSpacing: 1,
              textShadow: '0 0 24px rgba(232,0,29,0.4)',
            }}>
              {DRIVER.number}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, letterSpacing: 2.5, color: 'var(--muted)', marginBottom: 4 }}>CREW</div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
              {DRIVER.team.split(' ').map((word, i) => <div key={i}>{word}</div>)}
            </div>
          </div>
        </div>

        <div
          style={{
            marginBottom: 10,
            fontSize: 9,
            letterSpacing: 1.8,
            color: 'rgba(190, 214, 206, 0.62)',
            textTransform: 'uppercase',
            fontFamily: '"Rajdhani", sans-serif',
          }}
        >
          Dubai Night GP Setup // High-Downforce // Soft Compound
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />

        {/* Info rows */}
        <div style={{ display: 'grid', gap: 7 }}>
          <Row label="DRIVER" value={DRIVER.name} />
          <Row label="HANDLE" value={`@${DRIVER.handle}`} />
          <Row label="VEHICLE" value="GT3 RS // RACE TUNE" />
          <Row label="MODE" value="QUALIFYING SIM" />
          <Row label="STATUS" value={
            <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px rgba(0,255,136,0.8)', animation: 'pulseGlowGreen 1.8s ease-in-out infinite' }} />
              SYSTEMS READY
            </span>
          } />
        </div>

        {/* Hint */}
        <div style={{ marginTop: 12, fontSize: 9, letterSpacing: 1.8, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          INSPECT HOTSPOTS OR START SESSION
        </div>
      </div>

      {/* Start Engine button */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 260,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          onClick={() => setScreen('COUNTDOWN')}
          className="hud-glass"
          style={{
            fontFamily: '"Orbitron", monospace',
            fontSize: 12,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#ffe8ea',
            padding: '15px 40px',
            border: '1px solid rgba(232,0,29,0.55)',
            background: 'linear-gradient(180deg, rgba(50,6,12,0.6) 0%, rgba(20,4,8,0.5) 100%)',
            clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
            cursor: 'pointer',
            animation: 'pulseGlow 2.4s ease-in-out infinite',
          }}
        >
          ▶ START RACE SESSION
        </button>
        <div style={{ fontSize: 9, letterSpacing: 2.5, color: 'rgba(255,255,255,0.2)', fontFamily: '"Orbitron", monospace' }}>
          LIGHTS OUT PREP
        </div>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <span style={{ width: 72, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, letterSpacing: 1, color: 'var(--text)', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  )
}