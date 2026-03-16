/**
 * HeroCarModel — loads /models/hero-car.glb when present,
 * silently falls back to whatever `fallback` element is passed.
 *
 * Usage (inside a Canvas):
 *   <HeroCarModel scale={1} fallback={<CarPlaceholder />} />
 *
 * To add the real model: drop a GLB into public/models/hero-car.glb
 * then adjust scale/position/rotation props to taste.
 */
import { useGLTF } from '@react-three/drei'
import { Component, Suspense } from 'react'
import type { ReactNode } from 'react'

// ── Error boundary ────────────────────────────────────────────────────────────
class CarErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

// ── Inner loader (throws via Suspense if model not ready / doesn't exist) ─────
function GlbCar({
  scale,
  position,
  rotation,
}: {
  scale: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const { scene } = useGLTF('/models/hero-car.glb')
  return (
    <primitive
      object={scene}
      scale={scale}
      position={position ?? [0, 0, 0]}
      rotation={rotation ?? [0, 0, 0]}
    />
  )
}

// ── Public component ──────────────────────────────────────────────────────────
export function HeroCarModel({
  scale = 1,
  position,
  rotation,
  fallback,
}: {
  scale?: number
  /** World-space offset applied to the loaded GLB root. */
  position?: [number, number, number]
  /** Euler rotation [x, y, z] in radians applied to the GLB root. */
  rotation?: [number, number, number]
  /** Rendered while loading or if the file is missing. */
  fallback: ReactNode
}) {
  return (
    <CarErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GlbCar scale={scale} position={position} rotation={rotation} />
      </Suspense>
    </CarErrorBoundary>
  )
}

// Kick off network request as soon as this module is imported
useGLTF.preload('/models/hero-car.glb')
