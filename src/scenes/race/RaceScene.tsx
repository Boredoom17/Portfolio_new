import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { HeroCarModel } from '../../components/CarModel'

export type Telemetry = {
  speedKmh: number
  elapsedSec: number
  progress: number
  trackOffsetNorm: number
}

type Props = {
  onTelemetry: (t: Telemetry) => void
  onFinish: (elapsedSec: number) => void
  onPickup: (skill: string) => void
}

type Keys = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

const TRACK_LENGTH = 2200
const MAX_SPEED = 78
const TRACK_WIDTH = 18
const SEGMENT_LENGTH = 10
const SKILL_ORDER = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'React Native',
  'Expo',
  'PHP',
  'C',
  'HTML/CSS',
  'Tailwind CSS',
  'Supabase',
  'Firebase',
  'MongoDB',
  'Git',
  'AWS',
  'Docker',
]

function smoothStep(a: number, b: number, t: number) {
  const x = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1)
  return x * x * (3 - 2 * x)
}

function bendSection(s: number, start: number, end: number, amount: number) {
  return smoothStep(start, end, s) * amount
}

// Lightweight Dubai-inspired layout: long straights + hard direction changes.
function trackCenterX(z: number) {
  const s = -z
  let x = 0
  x += bendSection(s, 60, 180, 4.2)
  x += bendSection(s, 240, 420, -9.8)
  x += bendSection(s, 500, 670, 6.9)
  x += bendSection(s, 760, 940, -5.2)
  x += bendSection(s, 1040, 1260, 8.8)
  x += bendSection(s, 1360, 1610, -8.2)
  x += bendSection(s, 1710, 1950, 5.6)
  x += bendSection(s, 2010, 2180, -3.4)
  x += Math.sin(s * 0.005 + 1.3) * 0.5
  return x
}

function trackHeading(z: number) {
  const dz = 2
  const x1 = trackCenterX(z - dz)
  const x2 = trackCenterX(z + dz)
  return Math.atan2(x2 - x1, 2 * dz)
}

function FloatingPickup({ x, z, phase }: { x: number; z: number; phase: number }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    g.position.y = 1.0 + Math.sin(state.clock.elapsedTime * 2.2 + phase) * 0.18
    g.rotation.y = state.clock.elapsedTime * 1.8 + phase
  })

  return (
    <group ref={ref} position={[x, 1.0, z]}>
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

function CarExhaust({ carPos, carSpeed }: { carPos: THREE.Vector3; carSpeed: number }) {
  const particles = useRef<Array<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number }>>([])

  useFrame((_, dt) => {
    if (carSpeed < 20) {
      particles.current = []
      return
    }

    // Emit new particles at high speed
    if (carSpeed > 50) {
      const exhaustCount = Math.floor(carSpeed / 15)
      for (let i = 0; i < exhaustCount; i++) {
        if (particles.current.length < 32) {
          particles.current.push({
            pos: new THREE.Vector3(carPos.x + (Math.random() - 0.5) * 1.2, carPos.y - 0.3, carPos.z + 2),
            vel: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 1.5 + 0.5, Math.random() * 2 - 1),
            life: 0,
            maxLife: 0.8,
          })
        }
      }
    }

    // Update particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i]
      p.life += dt
      if (p.life > p.maxLife) {
        particles.current.splice(i, 1)
        continue
      }

      p.pos.add(p.vel.clone().multiplyScalar(dt))
      p.vel.y += 2 * dt
    }
  })

  return (
    <group>
      {particles.current.map((p, i) => {
        const alpha = 1 - (p.life / p.maxLife) ** 1.5
        return (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.15 + p.life * 0.3, 4, 4]} />
            <meshStandardMaterial
              color="#444"
              emissive="#222"
              transparent
              opacity={alpha * 0.4}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function RaceWorld({ onTelemetry, onFinish, onPickup }: Props) {
  const car = useRef<THREE.Group>(null)
  const cameraTarget = useRef(new THREE.Vector3(0, 1.1, 0))
  const speed = useRef(0)
  const zPos = useRef(0)
  const lateral = useRef(0)
  const lateralVel = useRef(0)
  const throttle = useRef(0)
  const brakePressure = useRef(0)
  const steer = useRef(0)
  const driftAmount = useRef(0)
  const finished = useRef(false)
  const startMs = useRef(performance.now())
  const keys = useRef<Keys>({ up: false, down: false, left: false, right: false })
  const pickupData = useRef(
    SKILL_ORDER.map((name, i) => ({
      name,
      lane: ((i % 4) - 1.5) * 3.2,
      z: -120 - i * 95,
      phase: i * 0.75,
      hit: false,
    }))
  )
  const roadSegmentZ = useMemo(
    () => Array.from({ length: Math.ceil(TRACK_LENGTH / SEGMENT_LENGTH) + 1 }, (_, i) => -i * SEGMENT_LENGTH),
    []
  )
  const centerDashZ = useMemo(
    () => Array.from({ length: Math.ceil(TRACK_LENGTH / 20) }, (_, i) => -20 - i * 20),
    []
  )
  const kerbZ = useMemo(
    () => Array.from({ length: Math.ceil(TRACK_LENGTH / 12) }, (_, i) => -6 - i * 12),
    []
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') keys.current.up = true
      if (e.key === 's' || e.key === 'ArrowDown') keys.current.down = true
      if (e.key === 'a' || e.key === 'ArrowLeft') keys.current.left = true
      if (e.key === 'd' || e.key === 'ArrowRight') keys.current.right = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') keys.current.up = false
      if (e.key === 's' || e.key === 'ArrowDown') keys.current.down = false
      if (e.key === 'a' || e.key === 'ArrowLeft') keys.current.left = false
      if (e.key === 'd' || e.key === 'ArrowRight') keys.current.right = false
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((state, dt) => {
    const c = car.current
    if (!c) return

    // Inputs are damped so acceleration/steer ramps feel game-like, not instant.
    const throttleTarget = keys.current.up ? 1 : 0
    const brakeTarget = keys.current.down ? 1 : 0
    const steerTarget = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0)

    throttle.current = THREE.MathUtils.lerp(throttle.current, throttleTarget, Math.min(1, 4.6 * dt))
    brakePressure.current = THREE.MathUtils.lerp(brakePressure.current, brakeTarget, Math.min(1, 7.5 * dt))
    steer.current = THREE.MathUtils.lerp(steer.current, steerTarget, Math.min(1, 8.2 * dt))

    const speedRatio = speed.current / MAX_SPEED
    const engineForce = 36 * throttle.current * (1 - speedRatio ** 0.9)
    const brakeForce = 52 * brakePressure.current
    const aeroDrag = 0.016 * speed.current * speed.current
    const rolling = 1.9 + speed.current * 0.024

    speed.current += (engineForce - brakeForce - aeroDrag - rolling) * dt
    speed.current = THREE.MathUtils.clamp(speed.current, 0, MAX_SPEED)

    const driftingTarget =
      brakePressure.current > 0.5 && Math.abs(steer.current) > 0.38 && speed.current > 34
        ? 1
        : 0
    driftAmount.current = THREE.MathUtils.lerp(
      driftAmount.current,
      driftingTarget,
      Math.min(1, (driftingTarget ? 6.2 : 3.8) * dt)
    )

    // Steering has reduced authority at high speed and includes lateral inertia.
    const steerAuthority = THREE.MathUtils.lerp(1.35, 0.46, speedRatio)
    const driftSlip = THREE.MathUtils.lerp(1, 1.95, driftAmount.current)
    lateralVel.current += steer.current * steerAuthority * 8.1 * driftSlip * dt
    lateralVel.current *= Math.exp(-THREE.MathUtils.lerp(4.4, 2.5, driftAmount.current) * dt)
    lateralVel.current = THREE.MathUtils.clamp(lateralVel.current, -6.8, 6.8)
    lateral.current += lateralVel.current * dt * 5.2

    const laneLimit = TRACK_WIDTH * 0.5 - 2.2
    lateral.current = THREE.MathUtils.clamp(lateral.current, -laneLimit, laneLimit)

    // Off-track edge scrub keeps gameplay believable and stable.
    if (Math.abs(lateral.current) > laneLimit * 0.9) {
      speed.current = Math.max(speed.current - 18 * dt, 0)
    }

    zPos.current += speed.current * dt * 1.95
    const carZ = -zPos.current
    const centerX = trackCenterX(carZ)
    c.position.x = centerX + lateral.current
    c.position.z = carZ

    const heading = trackHeading(carZ)
    const steerYaw = steer.current * THREE.MathUtils.lerp(0.22, 0.08, speedRatio)
    const driftYaw = steer.current * driftAmount.current * THREE.MathUtils.lerp(0.42, 0.2, speedRatio)
    c.rotation.y = THREE.MathUtils.lerp(c.rotation.y, heading + steerYaw + driftYaw, 7.2 * dt)

    c.rotation.z = THREE.MathUtils.lerp(c.rotation.z, -steer.current * THREE.MathUtils.lerp(0.16, 0.25, driftAmount.current), 7.4 * dt)
    c.rotation.x = THREE.MathUtils.lerp(c.rotation.x, -throttle.current * 0.03 + brakePressure.current * 0.02, 4.5 * dt)

    for (const p of pickupData.current) {
      if (p.hit) continue
      const pX = trackCenterX(p.z) + p.lane
      const dx = c.position.x - pX
      const dz = c.position.z - p.z
      if (Math.hypot(dx, dz) < 1.35) {
        p.hit = true
        onPickup(p.name)
      }
    }

    // Camera behavior: stable and slightly tighter as speed rises.
    const camHeight = THREE.MathUtils.lerp(2.05, 2.35, speedRatio)
    const camDistance = THREE.MathUtils.lerp(6.6, 7.4, speedRatio)
    const desired = new THREE.Vector3(c.position.x, camHeight, c.position.z + camDistance)
    const camFollow = THREE.MathUtils.lerp(8.6, 11.2, speedRatio)
    state.camera.position.lerp(desired, camFollow * dt)
    cameraTarget.current.set(c.position.x, 0.98, c.position.z - 9.6)
    state.camera.lookAt(cameraTarget.current)

    const elapsedSec = (performance.now() - startMs.current) / 1000
    const progress = THREE.MathUtils.clamp(zPos.current / TRACK_LENGTH, 0, 1)

    // Subtle cinematic slowdown just before finish.
    if (progress > 0.97) {
      speed.current = Math.max(speed.current - 22 * dt, 14)
    }

    const speedKmh = Math.round(speed.current * 3.6)

    onTelemetry({
      speedKmh,
      elapsedSec,
      progress,
      trackOffsetNorm: THREE.MathUtils.clamp(lateral.current / laneLimit, -1, 1),
    })

    if (!finished.current && progress >= 1) {
      finished.current = true
      onFinish(elapsedSec)
    }
  })

  return (
    <>
      <group ref={car} position={[0, 0.5, 0]}>
        <HeroCarModel
          scale={1}
          rotation={[0, Math.PI, 0]}
          fallback={
            <>
              <mesh>
                <boxGeometry args={[2.4, 0.45, 4.4]} />
                <meshStandardMaterial color="#EDEAE4" metalness={0.85} roughness={0.22} />
              </mesh>
              <mesh position={[0, 0.35, 0.2]}>
                <boxGeometry args={[1.5, 0.3, 2.2]} />
                <meshStandardMaterial color="#f4f2ed" metalness={0.85} roughness={0.2} />
              </mesh>
            </>
          }
        />
      </group>

      <CarExhaust carPos={car.current?.position || new THREE.Vector3()} carSpeed={speed.current} />

      {roadSegmentZ.map((z) => {
        const x = trackCenterX(z)
        const yaw = trackHeading(z)
        return (
          <mesh
            key={`road-${z}`}
            position={[x, -0.01, z]}
            rotation={[0, yaw, 0]}
          >
            <boxGeometry args={[TRACK_WIDTH, 0.02, SEGMENT_LENGTH + 0.4]} />
            <meshStandardMaterial color="#111216" metalness={0.16} roughness={0.9} />
          </mesh>
        )
      })}

      {centerDashZ.map((z) => {
        const x = trackCenterX(z)
        const yaw = trackHeading(z)
        return (
          <mesh key={`dash-${z}`} position={[x, 0.015, z]} rotation={[0, yaw, 0]}>
            <boxGeometry args={[0.4, 0.03, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.15} />
          </mesh>
        )
      })}

      {roadSegmentZ.map((z, i) => {
        if (i % 3 !== 0) return null
        const x = trackCenterX(z)
        const yaw = trackHeading(z)
        return (
          <group key={`edge-${z}`} position={[x, 0.01, z]} rotation={[0, yaw, 0]}>
            <mesh position={[-8.8, 0, 0]}>
              <boxGeometry args={[0.8, 0.02, 3]} />
              <meshStandardMaterial color="#f3f3f3" emissive="#f3f3f3" emissiveIntensity={0.06} />
            </mesh>
            <mesh position={[8.8, 0, 0]}>
              <boxGeometry args={[0.8, 0.02, 3]} />
              <meshStandardMaterial color="#f3f3f3" emissive="#f3f3f3" emissiveIntensity={0.06} />
            </mesh>
          </group>
        )
      })}

      {/* Professional F1-style kerbs */}
      {kerbZ.map((z, i) => {
        const color = i % 2 === 0 ? '#e8001d' : '#f0f0f0'
        const centerX = trackCenterX(z)
        const yaw = trackHeading(z)
        return (
          <group key={`kerb-${z}`} position={[centerX, 0, z]} rotation={[0, yaw, 0]}>
            {/* Left kerb */}
            <mesh position={[-8.85, 0.08, 0]}>
              <boxGeometry args={[0.3, 0.16, SEGMENT_LENGTH]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Right kerb */}
            <mesh position={[8.85, 0.08, 0]}>
              <boxGeometry args={[0.3, 0.16, SEGMENT_LENGTH]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
            </mesh>
          </group>
        )
      })}
      {roadSegmentZ.map((z, idx) => {
        if (idx % 2 !== 0) return null
        const centerX = trackCenterX(z)
        const yaw = trackHeading(z)
        return (
          <group key={`barrier-${z}`} position={[centerX, 0, z]} rotation={[0, yaw, 0]}>
            <mesh position={[-9.5, 0.55, 0]}>
              <boxGeometry args={[0.15, 1.1, SEGMENT_LENGTH + 0.2]} />
              <meshStandardMaterial color="#1a1a1f" metalness={0.25} roughness={0.72} />
            </mesh>
            <mesh position={[-9.4, 0.62, 0]}>
              <boxGeometry args={[0.08, 0.12, SEGMENT_LENGTH + 0.2]} />
              <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[9.5, 0.55, 0]}>
              <boxGeometry args={[0.15, 1.1, SEGMENT_LENGTH + 0.2]} />
              <meshStandardMaterial color="#1a1a1f" metalness={0.25} roughness={0.72} />
            </mesh>
            <mesh position={[9.4, 0.62, 0]}>
              <boxGeometry args={[0.08, 0.12, SEGMENT_LENGTH + 0.2]} />
              <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        )
      })}

      {pickupData.current.map((p) =>
        p.hit ? null : (
          <FloatingPickup
            key={p.name}
            x={trackCenterX(p.z) + p.lane}
            z={p.z}
            phase={p.phase}
          />
        )
      )}

      {/* Finish-line complex */}
      {(() => {
        const finishZ = -TRACK_LENGTH + 14
        const finishX = trackCenterX(finishZ)
        const finishYaw = trackHeading(finishZ)
        const checkerRows = 2
        const checkerCols = 16
        const stripDepth = 1.2
        const cellW = (TRACK_WIDTH - 0.6) / checkerCols
        const cellD = stripDepth / checkerRows
        return (
          <group position={[finishX, 0, finishZ]} rotation={[0, finishYaw, 0]}>
            <mesh position={[-6.7, 2.05, 0]}>
              <boxGeometry args={[0.38, 4.1, 0.38]} />
              <meshStandardMaterial color="#2f333b" metalness={0.45} roughness={0.45} />
            </mesh>
            <mesh position={[6.7, 2.05, 0]}>
              <boxGeometry args={[0.38, 4.1, 0.38]} />
              <meshStandardMaterial color="#2f333b" metalness={0.45} roughness={0.45} />
            </mesh>
            <mesh position={[0, 3.95, 0]}>
              <boxGeometry args={[13.8, 0.45, 0.55]} />
              <meshStandardMaterial color="#49505d" metalness={0.55} roughness={0.34} />
            </mesh>
            {Array.from({ length: checkerRows * checkerCols }, (_, i) => {
              const col = i % checkerCols
              const row = Math.floor(i / checkerCols)
              const isBlack = (col + row) % 2 === 0
              const x = -((TRACK_WIDTH - 0.6) * 0.5) + cellW * 0.5 + col * cellW
              const z = -stripDepth * 0.5 + cellD * 0.5 + row * cellD
              return (
                <mesh key={`finish-check-${i}`} position={[x, 0.023, z]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[cellW, cellD]} />
                  <meshStandardMaterial
                    color={isBlack ? '#121212' : '#f0f0f0'}
                    emissive={isBlack ? '#000000' : '#1b1b1b'}
                    emissiveIntensity={0.14}
                  />
                </mesh>
              )
            })}
            {[-4.2, -1.4, 1.4, 4.2].map((x) => (
              <mesh key={`gantry-light-${x}`} position={[x, 3.92, 0.34]}>
                <boxGeometry args={[1.3, 0.14, 0.1]} />
                <meshStandardMaterial color="#dce6ff" emissive="#6f96ff" emissiveIntensity={0.45} />
              </mesh>
            ))}
          </group>
        )
      })()}

      {/* Professional night track lighting */}
      <ambientLight intensity={0.17} color="#5a6f82" />
      <directionalLight position={[6, 11, 8]} intensity={0.9} color="#f0dfcb" />
      <spotLight position={[0, 7.5, 12]} intensity={20} angle={0.5} penumbra={0.58} color="#d0e0ff" />
      <pointLight position={[-15, 5.5, 0]} intensity={6.5} color="#ffaa55" distance={36} />
      <pointLight position={[15, 5.5, 0]} intensity={6.5} color="#ffaa55" distance={36} />
      <Environment preset="night" />
    </>
  )
}

export default function RaceScene({ onTelemetry, onFinish, onPickup }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas camera={{ position: [0, 2.2, 8.2], fov: 50 }} gl={{ antialias: false, powerPreference: 'default', toneMappingExposure: 0.9 }}>
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 30, 200]} />
        <RaceWorld onTelemetry={onTelemetry} onFinish={onFinish} onPickup={onPickup} />
      </Canvas>
    </div>
  )
}