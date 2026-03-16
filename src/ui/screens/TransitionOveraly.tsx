import { useEffect, useState } from 'react'

interface Props {
  trigger: boolean
  onDone?: () => void
}

export default function TransitionOverlay({ trigger, onDone }: Props) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (!trigger) return
    setOpacity(1)
    const t = setTimeout(() => {
      setOpacity(0)
      onDone?.()
    }, 400)
    return () => clearTimeout(t)
  }, [trigger, onDone])

  if (opacity === 0) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      opacity,
      transition: 'opacity 0.35s ease',
      zIndex: 500,
      pointerEvents: 'none',
    }} />
  )
}