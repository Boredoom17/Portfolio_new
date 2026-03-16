type Props = {
  speedKmh: number
  elapsedSec: number
  progress: number
  trackOffsetNorm: number
  collected: number
  total: number
}

const CLIP_LEFT = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
const CLIP_RIGHT = 'polygon(0 12px, 12px 0, 100% 0, 100% 100%, 0 100%)'
const CLIP_CENTER = 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
const TRACK_LENGTH = 2200

function smoothStep(a: number, b: number, t: number) {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

function bendSection(s: number, start: number, end: number, amount: number) {
  return smoothStep(start, end, s) * amount
}

function mapTrackCenter(s: number) {
  let x = 0
  x += bendSection(s, 60, 180, 4.2)
  x += bendSection(s, 240, 420, -9.8)
  x += bendSection(s, 500, 670, 6.9)
  x += bendSection(s, 760, 940, -5.2)
  x += bendSection(s, 1040, 1260, 8.8)
  x += bendSection(s, 1360, 1610, -8.2)
  x += bendSection(s, 1710, 1950, 5.6)
  x += bendSection(s, 2010, 2180, -3.4)
  x += Math.sin(s * 0.005 + 1.3) * 0.5
  return x
}

function GlassPanel({ children, clip, style }: {
  children: React.ReactNode
  clip?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className="hud-glass hud-noise"
      style={{
        clipPath: clip,
        animation: 'hudIn 0.4s ease',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function RaceHUD({ speedKmh, elapsedSec, progress, trackOffsetNorm, collected, total }: Props) {
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0')
  const ss = String(Math.floor(elapsedSec % 60)).padStart(2, '0')
  const ms = String(Math.floor((elapsedSec % 1) * 100)).padStart(2, '0')
  const pct = Math.round(progress * 100)
  const speed = Math.round(speedKmh)

  const mapWidth = 150
  const mapHeight = 112
  const mapPadding = 8
  const samples = 44
  const points = Array.from({ length: samples }, (_, i) => {
    const ratio = i / (samples - 1)
    const s = ratio * TRACK_LENGTH
    const xNorm = (mapTrackCenter(s) + 11) / 22
    return {
      x: mapPadding + Math.max(0, Math.min(1, xNorm)) * (mapWidth - mapPadding * 2),
      y: mapHeight - mapPadding - ratio * (mapHeight - mapPadding * 2),
    }
  })
  const trackPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  const carY = mapHeight - mapPadding - progress * (mapHeight - mapPadding * 2)
  const baseXNorm = (mapTrackCenter(progress * TRACK_LENGTH) + 11) / 22
  const cursorX = mapPadding + Math.max(0, Math.min(1, baseXNorm + trackOffsetNorm * 0.06)) * (mapWidth - mapPadding * 2)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 310,
        pointerEvents: 'none',
        fontFamily: '"Orbitron", "Rajdhani", monospace',
      }}
    >
      {/* ── Top row ───────────────────────────────────── */}

      {/* Skills counter — top left */}
      <GlassPanel
        clip={CLIP_LEFT}
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          padding: '10px 16px 10px 12px',
          minWidth: 140,
        }}
      >
        <div style={{ fontSize: 8, letterSpacing: 3, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>
          Skills
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1, textShadow: '0 0 14px rgba(0,255,136,0.45)' }}>
            {collected}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>/ {total}</span>
        </div>
      </GlassPanel>

      {/* Lap progress bar — top center */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(420px, 48vw)',
        }}
      >
        <GlassPanel
          clip={CLIP_CENTER}
          style={{ padding: '10px 16px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 8, letterSpacing: 2.5, color: 'var(--muted)', textTransform: 'uppercase' }}>Track</span>
            <span style={{ fontSize: 10, letterSpacing: 1.5, color: '#fff', opacity: 0.6, fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}>
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: `linear-gradient(90deg, #00ff88 0%, ${pct > 75 ? '#f5c842' : '#4aa3ff'} 100%)`,
                borderRadius: 3,
                boxShadow: `0 0 12px ${pct > 75 ? 'rgba(245,200,66,0.5)' : 'rgba(0,255,136,0.45)'}`,
                transition: 'width 200ms linear',
              }}
            />
          </div>
          {/* Segment ticks */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            {[0,25,50,75,100].map((v) => (
              <span
                key={v}
                style={{
                  fontSize: 7,
                  letterSpacing: 0.4,
                  color: pct >= v ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                  fontWeight: 600,
                }}
              >
                {v === 0 ? 'S' : v === 100 ? 'F' : `${v}%`}
              </span>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Timer — top right */}
      <GlassPanel
        clip={CLIP_RIGHT}
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          padding: '10px 12px 10px 16px',
          textAlign: 'right',
          minWidth: 140,
        }}
      >
        <div style={{ fontSize: 8, letterSpacing: 3, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>
          Time
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: 1.5, fontFamily: '\"Courier New\", monospace' }}>
            {mm}:{ss}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 0.8 }}>.{ms}</span>
        </div>
      </GlassPanel>

      {/* ── Bottom row ────────────────────────────────── */}

      {/* Speed — bottom left */}
      <GlassPanel
        clip={CLIP_LEFT}
        style={{
          position: 'absolute',
          bottom: 154,
          left: 14,
          padding: '12px 20px 12px 14px',
          minWidth: 150,
        }}
      >
        {/* Red accent top line */}
        <div style={{ position: 'absolute', top: 0, left: 12, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent-red), transparent)' }} />
        <div style={{ fontSize: 7, letterSpacing: 3, color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', fontWeight: 700 }}>Speed</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 1,
              color: speed > 70 ? '#f5c842' : 'var(--accent-green)',
              textShadow: speed > 70 ? '0 0 20px rgba(245,200,66,0.5)' : '0 0 20px rgba(0,255,136,0.4)',
              transition: 'color 0.3s ease, text-shadow 0.3s ease',
              fontFamily: '\"Orbitron\", monospace',
            }}
          >
            {speed}
          </span>
          <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted)', fontWeight: 600 }}>KM/H</span>
        </div>
        {/* Speed gauge bar */}
        <div style={{ marginTop: 7, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (speed / 84) * 100)}%`,
              background: speed > 70
                ? 'linear-gradient(90deg, #f5c842, #ff6030)'
                : 'linear-gradient(90deg, #00ff88, #4aa3ff)',
              borderRadius: 2,
              transition: 'width 100ms linear, background 300ms ease',
              boxShadow: speed > 70 ? '0 0 10px rgba(245,200,66,0.4)' : '0 0 10px rgba(0,255,136,0.3)',
            }}
          />
        </div>
      </GlassPanel>

      {/* Minimap — bottom left */}
      <GlassPanel
        clip={CLIP_LEFT}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 14,
          padding: '9px 11px 10px',
          width: 174,
          height: 132,
        }}
      >
        <div style={{ fontSize: 7, letterSpacing: 2.8, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', fontWeight: 700 }}>
          Circuit Map
        </div>
        <svg width={mapWidth} height={mapHeight} style={{ display: 'block' }}>
          <rect x={0} y={0} width={mapWidth} height={mapHeight} fill="rgba(6,8,12,0.5)" />
          <path d={trackPath} stroke="rgba(255,255,255,0.22)" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={trackPath} stroke="rgba(0,255,136,0.75)" strokeWidth={2.1} fill="none" strokeLinecap="round" />
          <circle cx={cursorX} cy={carY} r={4.4} fill="#e8001d" />
          <circle cx={cursorX} cy={carY} r={8.5} fill="none" stroke="rgba(232,0,29,0.4)" strokeWidth={1.1} />
          <text x={mapPadding} y={mapHeight - 3} fill="rgba(255,255,255,0.45)" fontSize={8}>S</text>
          <text x={mapPadding} y={10} fill="rgba(255,255,255,0.62)" fontSize={8}>F</text>
        </svg>
      </GlassPanel>

      {/* Driver tag — bottom right */}
      <GlassPanel
        clip={CLIP_RIGHT}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 14,
          padding: '12px 14px 12px 18px',
          textAlign: 'right',
          minWidth: 180,
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 12, left: 0, height: 2, background: 'linear-gradient(270deg, rgba(0,255,136,0.5), transparent)' }} />
        <div style={{ fontSize: 7, letterSpacing: 3, color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', fontWeight: 700 }}>Driver</div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1.5, color: '#e8f4ef', fontFamily: '\"Orbitron\", monospace' }}>
          A. CHHETRI
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-red)', letterSpacing: 2, textShadow: '0 0 12px rgba(232,0,29,0.4)', fontFamily: '\"Orbitron\", monospace' }}>
          #1806
        </div>
      </GlassPanel>

      {/* Controls hint — bottom center */}
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        {[
          { key: 'W / ↑', label: 'ACCEL' },
          { key: 'S / ↓', label: 'BRAKE' },
          { key: 'A,D / ←→', label: 'STEER' },
        ].map(({ key, label }) => (
          <div key={label} style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.45 }}>
            <span
              style={{
                fontSize: 9,
                letterSpacing: 0.8,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '2px 6px',
                borderRadius: 4,
                color: '#cde',
                fontFamily: '"Courier New", monospace',
              }}
            >
              {key}
            </span>
            <span style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}