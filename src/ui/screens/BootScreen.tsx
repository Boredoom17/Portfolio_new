import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../../state/gameStore'

type BootLine = { id: string; text: string }

export default function BootScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  const [progress, setProgress] = useState(0)
  const [visibleCount, setVisibleCount] = useState(0)
  const [done, setDone] = useState(false)

  const lines: BootLine[] = useMemo(
    () => [
      { id: 'l1', text: 'BOREDOOM RACING SYSTEMS v1.0' },
      { id: 'l2', text: 'LOADING INTERACTIVE PORTFOLIO ENGINE...' },
      { id: 'l3', text: 'SYNCING PROJECT GARAGE + DRIVER DATA...' },
      { id: 'l4', text: 'MOUNTING R3F SCENE + HUD OVERLAY...' },
      { id: 'l5', text: 'DRIVER: A. CHHETRI  //  #1806' },
      { id: 'l6', text: `VEHICLE BOOT: ${String(progress).padStart(3, ' ')}%` },
      { id: 'l7', text: progress < 100 ? 'SYSTEM CHECK: IN PROGRESS...' : '● SYSTEM CHECK: READY TO RACE' },
    ],
    [progress]
  )

  useEffect(() => {
    const t = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= 7) { clearInterval(t); return c }
        return c + 1
      })
    }, 580)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (visibleCount < 5) return
    if (progress >= 100) return
    const t = setInterval(() => {
      setProgress((p) => Math.min(100, p + (p < 70 ? 3 : 2)))
    }, 80)
    return () => clearInterval(t)
  }, [visibleCount, progress])

  useEffect(() => {
    if (progress < 100 || visibleCount < 7) return
    const t = setTimeout(() => setDone(true), 700)
    return () => clearTimeout(t)
  }, [progress, visibleCount])

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setScreen('GARAGE'), 1000)
    return () => clearTimeout(t)
  }, [done, setScreen])

  const progressBar = `${'█'.repeat(Math.floor(progress / 5))}${'░'.repeat(20 - Math.floor(progress / 5))}`

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at 50% 30%, #0e0210 0%, #050508 55%, #030304 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Horizontal scan lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.18) 50%)',
          backgroundSize: '100% 4px',
          opacity: 0.55,
        }}
      />

      {/* Top red racing stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, transparent 0%, #e8001d 20%, #ff6040 50%, #e8001d 80%, transparent 100%)',
          boxShadow: '0 0 18px rgba(232,0,29,0.7)',
        }}
      />
      {/* Bottom stripe */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,136,0.6) 30%, rgba(0,255,136,0.9) 50%, rgba(0,255,136,0.6) 70%, transparent 100%)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          marginBottom: 40,
          textAlign: 'center',
          animation: 'fadeIn 0.8s ease',
        }}
      >
        <div
          style={{
            fontFamily: '"Orbitron", monospace',
            fontSize: 'clamp(34px, 6vw, 72px)',
            fontWeight: 900,
            letterSpacing: 12,
            color: '#fff',
            textShadow: '0 0 40px rgba(232,0,29,0.5), 0 0 80px rgba(232,0,29,0.2)',
            lineHeight: 1,
          }}
        >
          BORE<span style={{ color: '#e8001d' }}>DOOM</span>
        </div>
        <div
          style={{
            fontFamily: '"Rajdhani", monospace',
            fontSize: 'clamp(10px, 1.5vw, 14px)',
            letterSpacing: 8,
            color: 'rgba(255,255,255,0.35)',
            marginTop: 6,
          }}
        >
          RACING SYSTEMS
        </div>
      </div>

      {/* Terminal panel */}
      <div
        style={{
          width: 'min(660px, 92vw)',
          background: 'rgba(6,8,10,0.9)',
          border: '1px solid rgba(0,255,136,0.15)',
          borderTop: '1px solid rgba(0,255,136,0.35)',
          padding: '20px 24px 18px',
          clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
          boxShadow: '0 0 60px rgba(0,255,136,0.07), 0 30px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ color: 'rgba(0,255,136,0.5)', fontSize: 10, letterSpacing: 2, fontFamily: '"Orbitron", monospace' }}>
            SYSTEM TERMINAL
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 1 }}>
            BOREDOOM_R1806
          </span>
        </div>

        {lines.slice(0, visibleCount).map((line, i, arr) => {
          const isLast = i === arr.length - 1
          const isOk = line.text.includes('ALL GREEN')
          return (
            <div
              key={line.id}
              style={{
                color: isOk ? '#00FF88' : isLast ? '#bbcfc7' : 'rgba(160,185,175,0.65)',
                fontSize: 12,
                lineHeight: 2,
                letterSpacing: 1.2,
                fontFamily: '"Courier New", monospace',
                animation: 'lineIn 300ms ease',
                display: 'flex',
                gap: 8,
              }}
            >
              <span style={{ color: isOk ? '#00cc6a' : 'rgba(0,255,136,0.35)', minWidth: 12 }}>›</span>
              {line.text}
            </div>
          )
        })}

        {/* Progress bar */}
        {visibleCount >= 6 && (
          <div
            style={{
              marginTop: 10,
              fontFamily: '"Courier New", monospace',
              animation: 'lineIn 300ms ease',
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'rgba(0,255,136,0.35)' }}>›</span>
              <span style={{ color: '#00FF88', letterSpacing: 0.5, fontSize: 12 }}>
                {progressBar}
              </span>
              <span style={{ color: '#00FF88', fontSize: 11, minWidth: 36, textAlign: 'right' }}>
                {progress}%
              </span>
            </div>
            {/* Actual colored bar under terminal */}
            <div style={{ marginTop: 10, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #00ff88 0%, #00cc6a 100%)',
                  borderRadius: 2,
                  boxShadow: '0 0 8px rgba(0,255,136,0.5)',
                  transition: 'width 80ms linear',
                }}
              />
            </div>
          </div>
        )}

        {/* Blinking cursor */}
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 13,
            marginTop: 8,
            background: '#00FF88',
            animation: 'blink 0.85s step-end infinite',
            boxShadow: '0 0 6px rgba(0,255,136,0.6)',
          }}
        />
      </div>

      {/* Done fade indicator */}
      {done && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0)',
            animation: 'fadeIn 0.5s ease forwards',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

