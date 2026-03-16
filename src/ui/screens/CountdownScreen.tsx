import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../../state/gameStore'

const TOTAL_LIGHTS = 5

export default function CountdownScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const [activeLights, setActiveLights] = useState(0)
  const [go, setGo] = useState(false)

  useEffect(() => {
    // Light up 1..5 red lights
    const t = setInterval(() => {
      setActiveLights((n) => {
        if (n >= TOTAL_LIGHTS) {
          clearInterval(t)
          return n
        }
        return n + 1
      })
    }, 700)

    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (activeLights < TOTAL_LIGHTS) return
    const hold = setTimeout(() => {
      setGo(true)
      // Switch to race after GO flash
      setTimeout(() => setScreen('RACE'), 900)
    }, 700)

    return () => clearTimeout(hold)
  }, [activeLights, setScreen])

  const statusText = useMemo(() => {
    if (go) return 'GO'
    if (activeLights === 0) return 'FORMING GRID...'
    return `START SEQUENCE ${activeLights}/${TOTAL_LIGHTS}`
  }, [activeLights, go])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 350,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(15,8,8,0.55) 0%, rgba(0,0,0,0.88) 100%)',
        backdropFilter: 'blur(2px)',
        color: '#eaf2ef',
        fontFamily: '"Orbitron", "Rajdhani", sans-serif',
      }}
    >
      {/* Top red racing stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, transparent, #e8001d 20%, #ff4a3a 50%, #e8001d 80%, transparent)',
        boxShadow: '0 0 16px rgba(232,0,29,0.65)',
      }} />

      <div
        className="hud-glass hud-noise"
        style={{
          width: 'min(720px, 94vw)',
          padding: '26px 28px 30px',
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
          border: '1px solid rgba(236,241,239,0.16)',
          animation: 'hudIn 0.35s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: 9, letterSpacing: 3, color: 'var(--muted)' }}>BOREDOOM RACING // START SEQUENCE</span>
          <span style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(232,0,29,0.7)' }}>#1806</span>
        </div>

        {/* Status / GO */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 22,
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {go ? (
            <div
              style={{
                fontFamily: '"Orbitron", monospace',
                fontSize: 'clamp(42px, 8vw, 80px)',
                fontWeight: 900,
                letterSpacing: 12,
                color: 'var(--accent-green)',
                textShadow: '0 0 30px rgba(0,255,136,0.6), 0 0 60px rgba(0,255,136,0.25)',
                animation: 'countdownGo 0.5s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              GO!
            </div>
          ) : (
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 3,
                color: activeLights > 0 ? '#e8edf0' : 'var(--muted)',
              }}
            >
              {statusText}
            </div>
          )}
        </div>

        {/* F1 lights */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 18,
            marginBottom: 18,
          }}
        >
          {Array.from({ length: TOTAL_LIGHTS }).map((_, i) => {
            const lit = i < activeLights && !go
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {/* Housing bracket */}
                <div style={{
                  width: 14,
                  height: 8,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '2px 2px 0 0',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderBottom: 'none',
                }} />
                {/* Light */}
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    border: `2px solid ${lit ? 'rgba(232,0,29,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    background: lit
                      ? 'radial-gradient(circle at 32% 32%, #ff9aaa 0%, #ff2746 30%, #aa0520 70%, #50020e 100%)'
                      : 'radial-gradient(circle at 32% 32%, #1c1c20 0%, #0e0e10 65%, #080808 100%)',
                    boxShadow: lit
                      ? '0 0 28px rgba(232,0,29,0.65), 0 0 60px rgba(232,0,29,0.22), inset 0 0 18px rgba(255,120,140,0.28)'
                      : 'inset 0 0 12px rgba(0,0,0,0.6)',
                    transform: lit ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 160ms ease',
                  }}
                />
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.25)' }}>
          {go ? 'FULL THROTTLE — LIGHTS OUT' : 'HOLD RPM · WAIT FOR LIGHTS OUT'}
        </div>
      </div>
    </div>
  )
}
