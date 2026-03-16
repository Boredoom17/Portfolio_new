import { useMemo, useState } from 'react'
import { DRIVER, PROJECTS, SKILLS } from '../../data/portfolio'

type SpotId = 'projects' | 'profile' | 'stack' | 'links'

type Spot = {
  id: SpotId
  label: string
  x: string
  y: string
}

const SPOTS: Spot[] = [
  { id: 'projects', label: 'PROJECT GARAGE', x: '43%', y: '56%' },
  { id: 'profile', label: 'DRIVER FILE', x: '50%', y: '48%' },
  { id: 'stack', label: 'TECH STACK', x: '56%', y: '52%' },
  { id: 'links', label: 'PIT LINKS', x: '60%', y: '44%' },
]

export default function GarageHotspots() {
  const [active, setActive] = useState<SpotId | null>(null)

  const panelTitle = useMemo(() => {
    if (active === 'projects') return 'PROJECT GARAGE'
    if (active === 'profile') return 'DRIVER FILE'
    if (active === 'stack') return 'TECH STACK'
    if (active === 'links') return 'PIT LINKS'
    return ''
  }, [active])

  return (
    <>
      {/* Hotspot dots */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 270, pointerEvents: 'none' }}>
        {SPOTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive((p) => (p === s.id ? null : s.id))}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              transform: 'translate(-50%, -50%)',
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '1px solid rgba(232,0,29,0.9)',
              background: '#ff2e4f',
              boxShadow: '0 0 14px rgba(232,0,29,0.8)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'pulseHotspot 1.2s ease-in-out infinite',
            }}
            aria-label={s.label}
            title={s.label}
          />
        ))}
      </div>

      {/* Info panel */}
      {active && (
        <div
          className="hud-glass hud-noise"
          style={{
            position: 'absolute',
            left: 24,
            top: 24,
            width: 'min(520px, 92vw)',
            maxHeight: '72vh',
            overflowY: 'auto',
            zIndex: 280,
            padding: 16,
            borderRadius: 16,
            border: '1px solid rgba(232,0,29,0.45)',
            boxShadow: '0 0 24px rgba(232,0,29,0.25)',
            fontFamily: '"Orbitron", "Rajdhani", sans-serif',
            color: '#e8f2ee',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ color: '#ff3f5d', letterSpacing: 1.4 }}>{panelTitle}</h3>
            <button
              onClick={() => setActive(null)}
              style={{
                background: 'transparent',
                color: '#cbd9d3',
                border: '1px solid #3a3a3a',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              CLOSE
            </button>
          </div>

          {active === 'projects' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {PROJECTS.map((p) => (
                <div key={p.id} style={{ border: '1px solid #2d2d2d', padding: 10, borderRadius: 10 }}>
                  <div style={{ color: '#fff', fontWeight: 700 }}>{p.title}</div>
                  <div style={{ color: '#9fb0a8', fontSize: 13, marginTop: 4 }}>{p.description}</div>
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block', marginTop: 8, color: '#85b8ff', fontSize: 12 }}
                  >
                    Open Repository
                  </a>
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.tags.map((t) => (
                      <span key={t} style={{ fontSize: 11, border: '1px solid #2f3d37', padding: '2px 6px', borderRadius: 8 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {active === 'profile' && (
            <div>
              <p><strong>{DRIVER.name}</strong> ({DRIVER.handle})</p>
              <p style={{ color: '#9fb0a8', marginTop: 8 }}>{DRIVER.tagline}</p>
              <p style={{ color: '#9fb0a8', marginTop: 8 }}>
                Full-stack developer focused on practical products, ML experiments, and immersive interfaces.
              </p>
            </div>
          )}

          {active === 'stack' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKILLS.map((s) => (
                <span
                  key={s.name}
                  style={{
                    border: `1px solid ${s.level === 'learning' ? '#4a5c55' : '#2f4a3f'}`,
                    color: s.level === 'learning' ? '#8da098' : '#cfe6dc',
                    background: s.level === 'learning' ? 'rgba(20,20,20,0.5)' : 'rgba(0,255,136,0.08)',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}

          {active === 'links' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <a href={DRIVER.github} target="_blank" rel="noreferrer" style={{ color: '#85b8ff' }}>
                GitHub
              </a>
              <a href={DRIVER.linkedin} target="_blank" rel="noreferrer" style={{ color: '#85b8ff' }}>
                LinkedIn
              </a>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulseHotspot {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }
      `}</style>
    </>
  )
}