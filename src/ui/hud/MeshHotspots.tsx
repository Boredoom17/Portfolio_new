/**
 * MeshHotspots.tsx
 *
 * ── POSITION TUNING GUIDE ────────────────────────────────────────────────────
 * Enable `debug` on <HeroCarModel> in GarageScene.tsx, open console.
 * It prints every mesh name + world [x, y, z].
 * Find nodes containing "wheel" / "tire" for WHEEL_* constants.
 * Find nodes containing "seat" for the driver seat box.
 *
 * Car is LHD (Left-Hand Drive) — driver seat is on the LEFT (negative X).
 *
 * Wheels: rotation=[0,0,π/2] → cylinder axis along X = wheel axle direction ✓
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Html } from '@react-three/drei'
import { useState } from 'react'
import { useHotspotStore } from './GarageHotspots'

const label = (vis: boolean): React.CSSProperties => ({
  background: 'rgba(0,8,4,0.95)',
  color: '#00ffe7',
  fontFamily: 'Orbitron, monospace',
  fontWeight: 700,
  fontSize: 11,
  borderRadius: 5,
  padding: '4px 13px',
  border: '1px solid rgba(0,255,231,0.4)',
  boxShadow: '0 0 16px rgba(0,255,231,0.3), inset 0 0 6px rgba(0,255,231,0.05)',
  letterSpacing: '0.14em',
  whiteSpace: 'nowrap' as const,
  pointerEvents: 'none' as const,
  opacity: vis ? 1 : 0,
  transition: 'opacity 0.12s',
  textTransform: 'uppercase' as const,
  textShadow: '0 0 8px rgba(0,255,231,0.8)',
})

// ── Wheel constants ───────────────────────────────────────────────────────────
// Adjust these from console debug output to match your exact GLB.
// Y = wheel-centre height above world origin (roughly = tyre radius from floor)
// FZ = front axle Z,  RZ = rear axle Z
// X  = half track-width (centre of car → centre of wheel)
const WHEEL_Y  = 0.34   // tyre centre height
const WHEEL_FZ = 1.40   // front axle Z  (positive = front of car)
const WHEEL_RZ = -1.32  // rear axle Z
const WHEEL_X  = 0.93   // half track

// Tyre geometry: radius ≈ tyre outer radius, width ≈ tyre section width
const TYRE_R = 0.30   // slightly smaller than visual so it sits inside the rim
const TYRE_W = 0.24

const wheels = [
  { id: 'fl', pos: [-WHEEL_X, WHEEL_Y, WHEEL_FZ]  as [number,number,number] },
  { id: 'fr', pos: [ WHEEL_X, WHEEL_Y, WHEEL_FZ]  as [number,number,number] },
  { id: 'rl', pos: [-WHEEL_X, WHEEL_Y, WHEEL_RZ]  as [number,number,number] },
  { id: 'rr', pos: [ WHEEL_X, WHEEL_Y, WHEEL_RZ]  as [number,number,number] },
]

export default function MeshHotspots() {
  const setActive = useHotspotStore((s) => s.setActive)
  const [hovered, setHovered] = useState<string | null>(null)

  const over  = (id: string) => (e: any) => { e.stopPropagation(); setHovered(id) }
  const out   = () => setHovered(null)
  const click = (panel: string) => (e: any) => { e.stopPropagation(); setActive(panel) }

  const matProps = (id: string) => ({
    color: '#00ffe7' as const,
    opacity: hovered === id ? 0.20 : 0,
    transparent: true,
    depthWrite: false,
  })

  return (
    <>
      {/* ── WHEELS → TECH STACK ──────────────────────────────────────────── */}
      {/*  rotation [0,0,π/2]: cylinder axis → X axis = wheel axle direction  */}
      {wheels.map((w) => (
        <mesh
          key={w.id}
          position={w.pos}
          rotation={[0, 0, Math.PI / 2]}
          onPointerOver={over(w.id)}
          onPointerOut={out}
          onClick={click('stack')}
        >
          <cylinderGeometry args={[TYRE_R, TYRE_R, TYRE_W, 40]} />
          <meshBasicMaterial {...matProps(w.id)} />
          {hovered === w.id && (
            <Html center position={[0, TYRE_R + 0.18, 0]} zIndexRange={[200, 0]}>
              <span style={label(true)}>Tech Stack</span>
            </Html>
          )}
        </mesh>
      ))}

      {/* ── DRIVER SEAT → PROFILE ────────────────────────────────────────── */}
      {/*
       *  LHD car: driver is on the LEFT (negative X).
       *  Seat cushion sits lower than the window line.
       *
       *  x: -0.38 (left/driver side — adjust toward -0.5 if still off)
       *  y:  0.50  (seat cushion height — well below the window/windshield line)
       *  z:  0.10  (mid-cockpit, slightly forward of B-pillar)
       *
       *  Box is generous (0.45 wide × 0.28 tall × 0.50 deep) so it's easy to click.
       *
       *  If the label still appears in the windshield area you need to lower Y.
       *  Log says seat mesh Y in world space — use that directly.
       */}
      <mesh
        position={[-0.38, 0.50, 0.10]}
        onPointerOver={over('profile')}
        onPointerOut={out}
        onClick={click('profile')}
      >
        <boxGeometry args={[0.45, 0.28, 0.50]} />
        <meshBasicMaterial {...matProps('profile')} />
        {hovered === 'profile' && (
          <Html center position={[0, 0.26, 0]} zIndexRange={[200, 0]}>
            <span style={label(true)}>Driver Profile</span>
          </Html>
        )}
      </mesh>

      {/* ── REAR WING → SOCIALS ──────────────────────────────────────────── */}
      {/*
       *  Wing blade: wide, flat, high at the rear.
       *  y ≈ 1.05–1.12  z ≈ -1.9 to -2.1
       *  Box spans the full wing width (1.72) with thin height (0.09).
       */}
      <mesh
        position={[0, 1.08, -2.02]}
        onPointerOver={over('links')}
        onPointerOut={out}
        onClick={click('links')}
      >
        <boxGeometry args={[1.72, 0.09, 0.22]} />
        <meshBasicMaterial {...matProps('links')} />
        {hovered === 'links' && (
          <Html center position={[0, 0.16, 0]} zIndexRange={[200, 0]}>
            <span style={label(true)}>Socials</span>
          </Html>
        )}
      </mesh>

      {/* ── FRONT HOOD → PROJECTS ────────────────────────────────────────── */}
      {/*
       *  Hood surface: y ≈ 0.70-0.76, forward Z.
       *  Wide box matching hood width, very flat (0.09 tall).
       */}
      <mesh
        position={[0, 0.72, 1.72]}
        onPointerOver={over('projects')}
        onPointerOut={out}
        onClick={click('projects')}
      >
        <boxGeometry args={[1.20, 0.09, 0.52]} />
        <meshBasicMaterial {...matProps('projects')} />
        {hovered === 'projects' && (
          <Html center position={[0, 0.16, 0]} zIndexRange={[200, 0]}>
            <span style={label(true)}>Projects</span>
          </Html>
        )}
      </mesh>
    </>
  )
}