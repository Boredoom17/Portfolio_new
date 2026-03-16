import { useCallback, useEffect, useRef } from 'react'

type EngineNodes = {
  osc: OscillatorNode
  gain: GainNode
}

export function useRaceAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const engineRef = useRef<EngineNodes | null>(null)
  const mutedRef = useRef(false)

  const ensureReady = useCallback(async () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext()
      const master = ctx.createGain()
      master.gain.value = mutedRef.current ? 0 : 0.2
      master.connect(ctx.destination)
      ctxRef.current = ctx
      masterRef.current = master
    }
    if (ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume()
    }
  }, [])

  const oneShot = useCallback(
    (type: OscillatorType, fromHz: number, toHz: number, duration: number, gain = 0.08) => {
      const ctx = ctxRef.current
      const master = masterRef.current
      if (!ctx || !master) return

      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(fromHz, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, toHz), ctx.currentTime + duration)

      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

      osc.connect(g)
      g.connect(master)
      osc.start()
      osc.stop(ctx.currentTime + duration + 0.02)
    },
    []
  )

  const playUiClick = useCallback(() => {
    oneShot('square', 420, 300, 0.06, 0.045)
  }, [oneShot])

  const playPickup = useCallback(() => {
    oneShot('triangle', 540, 920, 0.12, 0.06)
  }, [oneShot])

  const playFinish = useCallback(() => {
    oneShot('sine', 520, 860, 0.2, 0.08)
    setTimeout(() => oneShot('sine', 700, 1100, 0.22, 0.07), 90)
  }, [oneShot])

  const playEngineStart = useCallback(() => {
    oneShot('sawtooth', 110, 210, 0.36, 0.08)
  }, [oneShot])

  const startEngineLoop = useCallback(() => {
    const ctx = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master || engineRef.current) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(95, ctx.currentTime)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.2)

    osc.connect(gain)
    gain.connect(master)
    osc.start()

    engineRef.current = { osc, gain }
  }, [])

  const updateEngineFromSpeed = useCallback((speedKmh: number) => {
    const ctx = ctxRef.current
    const engine = engineRef.current
    if (!ctx || !engine) return

    const rpmFactor = Math.min(1, speedKmh / 320)
    const hz = 95 + rpmFactor * 170
    const vol = 0.03 + rpmFactor * 0.035

    engine.osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.06)
    engine.gain.gain.setTargetAtTime(vol, ctx.currentTime, 0.08)
  }, [])

  const stopEngineLoop = useCallback(() => {
    const ctx = ctxRef.current
    const engine = engineRef.current
    if (!ctx || !engine) return

    engine.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05)
    setTimeout(() => {
      try {
        engine.osc.stop()
      } catch {
        // Ignore if already stopped.
      }
      engineRef.current = null
    }, 180)
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted
    const ctx = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master) return
    master.gain.setTargetAtTime(muted ? 0.0001 : 0.2, ctx.currentTime, 0.03)
  }, [])

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next

    const ctx = ctxRef.current
    const master = masterRef.current
    if (ctx && master) {
      master.gain.setTargetAtTime(next ? 0.0001 : 0.2, ctx.currentTime, 0.03)
    }
    return next
  }, [])

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        try {
          engineRef.current.osc.stop()
        } catch {
          // Ignore if already stopped.
        }
      }
      if (ctxRef.current) {
        void ctxRef.current.close()
      }
    }
  }, [])

  return {
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
    isMuted: () => mutedRef.current,
  }
}
