import { useEffect, useState } from 'react'

import { create } from 'zustand'
import { DRIVER, PROJECTS, SKILLS } from '../../data/portfolio'

type SpotId = 'projects' | 'profile' | 'stack' | 'links'

type HotspotStore = {
  active: SpotId | null
  setActive: (id: SpotId | null) => void
}

export const useHotspotStore = create<HotspotStore>((set) => ({
  active: null,
  setActive: (id) => set((s) => ({ active: s.active === id ? null : id })),
}))



// Updated positions for custom car model:
// profile  → driver seat
// links    → back wing
// projects → front booth
// stack    → all 4 tires


// Inject keyframes once into document head — avoids JSX/R3F <style> issues
function useGlobalStyles() {
  useEffect(() => {
    const ID = 'gh-keyframes'
    if (document.getElementById(ID)) return
    const el = document.createElement('style')
    el.id = ID
    el.textContent = `
      @keyframes gh-ripple {
        0%   { transform: translate(-50%,-50%) scale(0.85); opacity: 1; }
        100% { transform: translate(-50%,-50%) scale(2.6);  opacity: 0; }
      }
      @keyframes gh-blink  { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes gh-in     { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
      @keyframes gh-flicker{ 0%,97%,100%{opacity:1} 98%{opacity:0.88} 99%{opacity:1} }
    `
    document.head.appendChild(el)
    return () => document.getElementById(ID)?.remove()
  }, [])
}

// (HotspotDots removed in favor of mesh-based interaction)

// ─── Driver Telemetry Card (always visible, top-right) ───────────────────────
function DriverTelemetry() {
  const [cursor, setCursor] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setCursor(p => !p), 550)
    return () => clearInterval(t)
  }, [])

  const rows = [
    { k: 'GRID_SLOT',   v: '1806',                        big: true  },
    { k: 'OPERATOR',    v: DRIVER.name.toUpperCase()                  },
    { k: 'CALLSIGN',    v: (DRIVER.handle || '@BOREDOOM').toUpperCase() },
    { k: 'VEHICLE',     v: 'GT3 RS // RACE TUNE'                      },
    { k: 'MODE',        v: 'QUALIFYING SIM'                           },
    { k: 'SYS_STATUS',  v: 'NOMINAL',                     ok: true   },
  ]

  return (
    <div style={{
      position: 'absolute', top: 18, right: 18,
      width: 'min(290px, 86vw)',
      fontFamily: '"Orbitron", monospace',
      zIndex: 300,
      animation: 'gh-flicker 12s infinite',
    }}>

      {/* Header */}
      <div style={{
        background: 'rgba(0,255,65,0.07)',
        border: '1px solid rgba(0,255,65,0.28)',
        borderBottom: 'none',
        padding: '5px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: '#00ff41', fontSize: 9, letterSpacing: '0.16em' }}>
          ◈ DRIVER TELEMETRY
        </span>
        <span style={{ color: 'rgba(0,255,65,0.5)', fontSize: 8 }}>
          <span style={{ animation: 'gh-blink 1.1s infinite' }}>■</span> LIVE
        </span>
      </div>

      {/* Rows */}
      <div style={{
        background: 'rgba(1,6,1,0.92)',
        border: '1px solid rgba(0,255,65,0.22)',
        borderBottom: 'none',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* CRT scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.1) 2px,rgba(0,0,0,0.1) 4px)',
        }} />
        {rows.map((r) => (
          <div key={r.k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 10px',
            borderBottom: '1px solid rgba(0,255,65,0.07)',
            position: 'relative', zIndex: 2,
          }}>
            <span style={{ color: 'rgba(0,255,65,0.4)', fontSize: 8, letterSpacing: '0.1em' }}>
              {r.k}
            </span>
            <span style={{
              color: r.big ? '#00ff41' : r.ok ? '#00ff41' : 'rgba(190,230,195,0.88)',
              fontSize: r.big ? 20 : 9,
              fontWeight: r.big ? 700 : 400,
              letterSpacing: r.big ? '0.04em' : '0.08em',
              textShadow: (r.big || r.ok) ? '0 0 10px currentColor' : 'none',
            }}>
              {r.ok
                ? <><span style={{ color: '#00ff41', marginRight: 4 }}>●</span>{r.v}</>
                : r.v
              }
            </span>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div style={{
        background: 'rgba(1,6,1,0.92)',
        border: '1px solid rgba(0,255,65,0.22)',
        borderTop: '1px solid rgba(0,255,65,0.08)',
        padding: '4px 10px',
        color: 'rgba(0,255,65,0.38)',
        fontSize: 7.5,
        letterSpacing: '0.1em',
      }}>
        {DRIVER.tagline || 'BIM 7TH SEM // FULL STACK + ML // ALWAYS SHIPPING'}
      </div>

      {/* Footer prompt */}
      <div style={{
        background: 'rgba(0,255,65,0.05)',
        border: '1px solid rgba(0,255,65,0.22)',
        borderTop: 'none',
        padding: '4px 10px',
        display: 'flex', justifyContent: 'space-between',
        color: 'rgba(0,255,65,0.35)', fontSize: 7.5, letterSpacing: '0.1em',
      }}>
        <span>INSPECT HOTSPOTS OR START SESSION</span>
        <span style={{ animation: 'gh-blink 0.9s infinite' }}>{cursor ? '█' : ' '}</span>
      </div>

    </div>
  )
}

// ─── Info Panel (active hotspot content) — rendered OUTSIDE <Canvas> ─────────
export default function GarageHotspots() {
  const { active, setActive } = useHotspotStore()
  useGlobalStyles()

  const title =
    active === 'projects' ? 'PROJECT GARAGE' :
    active === 'profile'  ? 'DRIVER FILE'    :
    active === 'stack'    ? 'TECH STACK'     :
    active === 'links'    ? 'PIT LINKS'      : ''

  return (
    <>
      <DriverTelemetry />

      {active && (
        <div style={{
          position: 'absolute', left: 18, top: 18,
          width: 'min(460px, 88vw)',
          maxHeight: '74vh', overflowY: 'auto',
          zIndex: 280,
          fontFamily: '"Orbitron", monospace',
          animation: 'gh-in 0.2s ease',
        }}>

          {/* Panel header */}
          <div style={{
            background: 'rgba(255,46,79,0.1)',
            border: '1px solid rgba(255,46,79,0.45)',
            borderBottom: 'none',
            padding: '5px 12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#ff3f5d', fontSize: 9, letterSpacing: '0.16em' }}>
              ◈ {title}
            </span>
            <button
              onClick={() => setActive(null)}
              style={{
                background: 'transparent',
                color: 'rgba(255,63,93,0.65)',
                border: '1px solid rgba(255,63,93,0.3)',
                padding: '2px 8px', cursor: 'pointer',
                fontSize: 8, fontFamily: 'inherit', letterSpacing: '0.1em',
              }}
            >
              [X] CLOSE
            </button>
          </div>

          {/* Panel body */}
          <div style={{
            background: 'rgba(3,1,5,0.94)',
            border: '1px solid rgba(255,46,79,0.28)',
            padding: 12, position: 'relative', overflow: 'hidden',
          }}>
            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>

              {/* ── PROJECTS ── */}
              {active === 'projects' && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {PROJECTS.map((p, i) => (
                    <div key={p.id} style={{
                      border: '1px solid rgba(255,46,79,0.18)',
                      padding: '8px 10px',
                      background: 'rgba(255,46,79,0.03)',
                      position: 'relative',
                    }}>
                      <div style={{
                        fontSize: 7, color: 'rgba(255,63,93,0.38)',
                        letterSpacing: '0.1em', marginBottom: 4,
                      }}>
                        PROJ_{String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.06em' }}>
                        {p.title.toUpperCase()}
                      </div>
                      <div style={{
                        color: 'rgba(200,200,210,0.6)', fontSize: 10,
                        marginTop: 5, lineHeight: 1.55, fontFamily: 'monospace', letterSpacing: '0.02em',
                      }}>
                        {p.description}
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.tags.map((t) => (
                          <span key={t} style={{
                            fontSize: 7.5, letterSpacing: '0.08em',
                            border: '1px solid rgba(255,46,79,0.22)',
                            color: 'rgba(255,120,135,0.75)', padding: '1px 5px',
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <a href={p.github} target="_blank" rel="noreferrer" style={{
                        display: 'inline-block', marginTop: 8,
                        color: '#7ab4ff', fontSize: 8.5, letterSpacing: '0.1em',
                        textDecoration: 'none',
                        border: '1px solid rgba(122,180,255,0.28)', padding: '2px 8px',
                      }}>
                        → OPEN REPO
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* ── PROFILE ── */}
              {active === 'profile' && (
                <div style={{ display: 'grid', gap: 0 }}>
                  {[
                    { k: 'OPERATOR', v: DRIVER.name.toUpperCase()                        },
                    { k: 'CALLSIGN', v: (DRIVER.handle || '@BOREDOOM').toUpperCase()      },
                    { k: 'TAGLINE',  v: DRIVER.tagline || 'FULL STACK + ML // ALWAYS SHIPPING' },
                  ].map((r) => (
                    <div key={r.k} style={{
                      display: 'flex', gap: 14,
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(255,46,79,0.1)',
                    }}>
                      <span style={{ color: 'rgba(255,63,93,0.45)', fontSize: 8.5, minWidth: 72, letterSpacing: '0.1em' }}>
                        {r.k}
                      </span>
                      <span style={{ color: '#ddeedd', fontSize: 9.5, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                        {r.v}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── STACK ── */}
              {active === 'stack' && (
                <div>
                  <div style={{
                    color: 'rgba(255,63,93,0.45)', fontSize: 8,
                    marginBottom: 10, letterSpacing: '0.12em',
                  }}>
                    SYSTEMS ONLINE //&nbsp;
                    {SKILLS.filter(s => s.level === 'mastered').length} MASTERED //&nbsp;
                    {SKILLS.filter(s => s.level === 'learning').length} LEARNING
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {SKILLS.map((s) => (
                      <span key={s.name} style={{
                        fontSize: 8.5, letterSpacing: '0.07em',
                        border: `1px solid ${s.level === 'learning' ? 'rgba(255,165,0,0.32)' : 'rgba(0,255,65,0.32)'}`,
                        color: s.level === 'learning' ? 'rgba(255,185,0,0.8)' : 'rgba(0,255,65,0.85)',
                        background: s.level === 'learning' ? 'rgba(255,165,0,0.05)' : 'rgba(0,255,65,0.05)',
                        padding: '3px 7px',
                      }}>
                        {s.level === 'mastered' ? '◈' : '○'} {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── LINKS ── */}
              {active === 'links' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {[
                    { label: 'GITHUB',   url: DRIVER.github   },
                    { label: 'LINKEDIN', url: DRIVER.linkedin },
                  ].map((lk) => (
                    <a key={lk.label} href={lk.url} target="_blank" rel="noreferrer" style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px',
                      border: '1px solid rgba(122,180,255,0.2)',
                      background: 'rgba(122,180,255,0.04)',
                      color: '#7ab4ff', textDecoration: 'none',
                      fontSize: 9.5, letterSpacing: '0.1em',
                    }}>
                      <span>◈ {lk.label}</span>
                      <span style={{ fontSize: 8, opacity: 0.55 }}>→ OPEN</span>
                    </a>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}