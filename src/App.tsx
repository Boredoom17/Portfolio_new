import { useEffect, useState } from 'react'
import { useGameStore } from './state/gameStore'
import GarageScene from './scenes/garage/GarageScene'
import RaceScene from './scenes/race/RaceScene'
import BootScreen from './ui/screens/BootScreen'
import CountdownScreen from './ui/screens/CountdownScreen'
import RaceHUD from './ui/hud/RaceHUD'
import GarageHotspots from './ui/hud/GarageHotspots'
import { SKILLS } from './data/portfolio'
import { useRaceAudio } from './hooks/useRaceAudio'

function App() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const setLapTime = useGameStore((s) => s.setLapTime)
  const collectSkill = useGameStore((s) => s.collectSkill)
  const resetSkills = useGameStore((s) => s.resetSkills)
  const skillsCollected = useGameStore((s) => s.skillsCollected)
  const lapTime = useGameStore((s) => s.lapTime)

  const [speedKmh, setSpeedKmh] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [progress, setProgress] = useState(0)
  const [trackOffsetNorm, setTrackOffsetNorm] = useState(0)
  const [pickupToast, setPickupToast] = useState<string | null>(null)
  const [finishFlash, setFinishFlash] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const {
    ensureReady,
    playUiClick,
    playPickup,
    playEngineStart,
    startEngineLoop,
    updateEngineFromSpeed,
    stopEngineLoop,
    playFinish,
    setMuted,
    toggleMuted,
  } = useRaceAudio()

  const inGarage = screen === 'GARAGE' || screen === 'REVEAL'

  useEffect(() => {
    if (screen === 'COUNTDOWN') {
      playUiClick()
      playEngineStart()
      resetSkills()
      setElapsedSec(0)
      setProgress(0)
      setSpeedKmh(0)
      setTrackOffsetNorm(0)
      setPickupToast(null)
      setFinishFlash(false)
    }
  }, [screen, resetSkills, playUiClick, playEngineStart])

  useEffect(() => {
    if (!pickupToast) return
    playPickup()
    const t = setTimeout(() => setPickupToast(null), 900)
    return () => clearTimeout(t)
  }, [pickupToast, playPickup])

  useEffect(() => {
    const unlock = () => {
      void ensureReady().then(() => setAudioReady(true))
      window.removeEventListener('pointerdown', unlock)
    }

    window.addEventListener('pointerdown', unlock)
    return () => window.removeEventListener('pointerdown', unlock)
  }, [ensureReady])

  useEffect(() => {
    if (!audioReady) return

    if (screen === 'RACE') {
      startEngineLoop()
    } else {
      stopEngineLoop()
    }
  }, [screen, audioReady, startEngineLoop, stopEngineLoop])

  useEffect(() => {
    if (!audioReady || screen !== 'RACE') return
    updateEngineFromSpeed(speedKmh)
  }, [speedKmh, audioReady, screen, updateEngineFromSpeed])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#050505',
        color: '#fff',
        fontFamily: '"Orbitron", "Rajdhani", monospace',
        overflow: 'hidden',
      }}
    >
      {inGarage && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <GarageScene />
        </div>
      )}

      {screen === 'RACE' && (
        <RaceScene
          onTelemetry={(t) => {
            setSpeedKmh(t.speedKmh)
            setElapsedSec(t.elapsedSec)
            setProgress(t.progress)
            setTrackOffsetNorm(t.trackOffsetNorm)
          }}
          onPickup={(skill) => {
            collectSkill(skill)
            setPickupToast(skill)
          }}
          onFinish={(time) => {
            setLapTime(time)
            playFinish()
            setFinishFlash(true)
            setTimeout(() => {
              setFinishFlash(false)
              setScreen('FINISH')
            }, 380)
          }}
        />
      )}

    {inGarage && <GarageHotspots />}
      {screen === 'BOOT' && <BootScreen />}
      {screen === 'COUNTDOWN' && <CountdownScreen />}
      {screen === 'RACE' && (
        <RaceHUD
          speedKmh={speedKmh}
          elapsedSec={elapsedSec}
          progress={progress}
          trackOffsetNorm={trackOffsetNorm}
          collected={skillsCollected.length}
          total={SKILLS.length}
        />
      )}

      {screen === 'RACE' && pickupToast && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: '50%',
            zIndex: 330,
            pointerEvents: 'none',
            animation: 'toastIn 0.9s ease forwards',
          }}
        >
          <div
            className="hud-glass hud-edge-green"
            style={{
              padding: '9px 18px',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--accent-green)', textShadow: '0 0 8px rgba(0,255,136,0.5)' }}>✦</span>
            <span style={{ fontSize: 11, letterSpacing: 1.8, color: '#c9ffec', fontFamily: '"Orbitron", monospace' }}>
              SKILL UNLOCKED
            </span>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>
              {pickupToast}
            </span>
          </div>
        </div>
      )}

      {finishFlash && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 360,
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.0) 55%)',
            animation: 'raceFlash 0.4s ease',
            pointerEvents: 'none',
          }}
        />
      )}

      {screen === 'FINISH' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 40%, rgba(0,20,10,0.92) 0%, rgba(4,4,10,0.97) 60%)',
            animation: 'fadeIn 0.5s ease',
          }}
        >
          {/* Checkered flag stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'repeating-linear-gradient(90deg, #fff 0px, #fff 12px, #000 12px, #000 24px)',
            opacity: 0.7,
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
            background: 'repeating-linear-gradient(90deg, #000 0px, #000 12px, #fff 12px, #fff 24px)',
            opacity: 0.7,
          }} />

          <div
            className="hud-glass hud-noise"
            style={{
              width: 'min(820px, 94vw)',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '32px 32px 28px',
              clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
              border: '1px solid rgba(0,255,136,0.22)',
              animation: 'finishReveal 0.6s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--muted)', marginBottom: 6 }}>
                BOREDOOM RACING // LAP COMPLETE
              </div>
              <div
                style={{
                  fontFamily: '"Orbitron", monospace',
                  fontSize: 'clamp(28px, 5vw, 52px)',
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: 4,
                  lineHeight: 1,
                  textShadow: '0 0 30px rgba(0,255,136,0.3)',
                }}
              >
                RACE <span style={{ color: 'var(--accent-green)' }}>COMPLETE</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                {
                  label: 'LAP TIME',
                  value: (() => {
                    const m = Math.floor(lapTime / 60)
                    const s = Math.floor(lapTime % 60).toString().padStart(2 ,'0')
                    const ms = Math.floor((lapTime % 1) * 100).toString().padStart(2, '0')
                    return `${m}:${s}.${ms}`
                  })(),
                  color: '#fff',
                },
                {
                  label: 'SKILLS',
                  value: `${skillsCollected.length} / ${SKILLS.length}`,
                  color: 'var(--accent-green)',
                },
                {
                  label: 'COMPLETION',
                  value: `${Math.round((skillsCollected.length / SKILLS.length) * 100)}%`,
                  color: skillsCollected.length === SKILLS.length ? 'var(--accent-gold)' : 'var(--accent-blue)',
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="hud-glass"
                  style={{
                    flex: '1 1 160px',
                    padding: '12px 16px',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                    borderTop: '2px solid var(--accent-green)',
                  }}
                >
                  <div style={{ fontSize: 9, letterSpacing: 2.5, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: '"Orbitron", monospace', fontSize: 22, fontWeight: 700, color, letterSpacing: 2 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Skill badges */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: 2.5, color: 'var(--muted)', marginBottom: 10 }}>
                TECH SKILLS UNLOCKED
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {SKILLS.map((skill) => {
                  const ok = skillsCollected.includes(skill.name)
                  return (
                    <span
                      key={skill.name}
                      style={{
                        fontSize: 11,
                        letterSpacing: 0.8,
                        padding: '5px 12px',
                        clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))',
                        border: `1px solid ${ok ? 'rgba(0,255,136,0.45)' : 'rgba(255,255,255,0.1)'}`,
                        color: ok ? '#d4ffec' : 'rgba(255,255,255,0.28)',
                        background: ok ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                        boxShadow: ok ? '0 0 10px rgba(0,255,136,0.12)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      {ok ? '✓ ' : ''}{skill.name}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Links + CTA row */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { resetSkills(); setScreen('GARAGE') }}
                style={{
                  cursor: 'pointer',
                  fontFamily: '"Orbitron", monospace',
                  fontSize: 11,
                  letterSpacing: 2,
                  padding: '12px 24px',
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                  background: 'rgba(232,0,29,0.18)',
                  border: '1px solid rgba(232,0,29,0.5)',
                  color: '#ffd7db',
                  textTransform: 'uppercase',
                  animation: 'pulseGlow 2.5s ease-in-out infinite',
                }}
              >
                ↺ RACE AGAIN
              </button>

              {[
                { label: 'GITHUB', href: 'https://github.com/Aadarsha2059', icon: '⌥' },
                { label: 'LINKEDIN', href: 'https://linkedin.com/in/aadarsha-chhetri', icon: '⚡' },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    cursor: 'pointer',
                    fontFamily: '"Orbitron", monospace',
                    fontSize: 11,
                    letterSpacing: 2,
                    padding: '12px 18px',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                    background: 'rgba(74,163,255,0.1)',
                    border: '1px solid rgba(74,163,255,0.3)',
                    color: '#c6deff',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{icon}</span> {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dev navigation (remove before launch) */}
      <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 400, display: 'flex', gap: 4 }}>
        {(['BOOT', 'REVEAL', 'GARAGE', 'COUNTDOWN', 'RACE', 'FINISH'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            style={{
              padding: '3px 7px',
              background: screen === s ? '#E8001D' : 'rgba(0,0,0,0.6)',
              color: screen === s ? '#fff' : '#666',
              border: `1px solid ${screen === s ? '#E8001D' : '#333'}`,
              cursor: 'pointer',
              fontSize: 9,
              letterSpacing: 1,
              fontFamily: '"Orbitron", monospace',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Audio toggle */}
      <button
        onClick={() => {
          if (!audioReady) {
            void ensureReady().then(() => {
              setAudioReady(true)
              setMuted(false)
              setIsMuted(false)
            })
            return
          }
          const next = toggleMuted()
          setIsMuted(next)
        }}
        className="hud-glass"
        style={{
          position: 'absolute',
          top: screen === 'GARAGE' ? 'auto' : 14,
          bottom: screen === 'GARAGE' ? 30 : 'auto',
          right: screen === 'GARAGE' ? '50%' : 14,
          transform: screen === 'GARAGE' ? 'translateX(50%) translateX(110px)' : 'none',
          zIndex: 420,
          padding: '7px 14px',
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
          border: '1px solid rgba(255,255,255,0.18)',
          color: isMuted ? 'rgba(255,255,255,0.35)' : '#d7e2dd',
          fontSize: 9,
          letterSpacing: 2,
          cursor: 'pointer',
          textTransform: 'uppercase',
          fontFamily: '"Orbitron", monospace',
          opacity: screen === 'RACE' ? 0.5 : 1,
        }}
      >
        {!audioReady ? '⟳ AUDIO' : isMuted ? '✕ MUTED' : '♪ AUDIO ON'}
      </button>
    </div>
  )
}

export default App