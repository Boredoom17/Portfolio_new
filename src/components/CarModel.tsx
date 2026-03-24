/**
 * CarModel.tsx
 *
 * Loads /models/hero-car.glb.
 *
 * ── DEBUG MODE ───────────────────────────────────────────────────────────────
 * Add `debug` prop to <HeroCarModel> to print to console:
 *   • Bounding box (min, max, size, center)
 *   • Every mesh node name + world position
 * Use those world positions to calibrate MeshHotspots.tsx constants.
 * Remove `debug` before shipping.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useGLTF } from '@react-three/drei'
import { useEffect, Component, Suspense } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'

class CarErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function BBoxDebug({ scene }: { scene: THREE.Group }) {
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    console.groupCollapsed('[CarModel] Bounding Box')
    console.log('min   :', box.min)
    console.log('max   :', box.max)
    console.log('size  :', size)
    console.log('center:', center)
    console.groupEnd()

    console.groupCollapsed('[CarModel] Mesh nodes → world position')
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const wp = new THREE.Vector3()
        obj.getWorldPosition(wp)
        console.log(
          `  ${obj.name || '(unnamed)'}`.padEnd(40),
          `[${wp.x.toFixed(3)}, ${wp.y.toFixed(3)}, ${wp.z.toFixed(3)}]`
        )
      }
    })
    console.groupEnd()
  }, [scene])
  return null
}

function GlbCar({
  scale,
  position,
  rotation,
  debug,
}: {
  scale: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  debug?: boolean
}) {
  const { scene } = useGLTF('/models/hero-car.glb')
  return (
    <group>
      <primitive
        object={scene}
        scale={scale}
        position={position ?? [0, 0, 0]}
        rotation={rotation ?? [0, 0, 0]}
      />
      {debug && <BBoxDebug scene={scene} />}
    </group>
  )
}

export function HeroCarModel({
  scale = 1,
  position,
  rotation,
  fallback,
  debug = false,
}: {
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  fallback: ReactNode
  debug?: boolean
}) {
  return (
    <CarErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GlbCar scale={scale} position={position} rotation={rotation} debug={debug} />
      </Suspense>
    </CarErrorBoundary>
  )
}

useGLTF.preload('/models/hero-car.glb')