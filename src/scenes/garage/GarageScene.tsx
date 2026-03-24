/**
 * GarageScene.tsx — Neon Futuristic Cyberpunk Garage
 */
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, ContactShadows, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useRef } from 'react'
import * as THREE from 'three'
import { HeroCarModel } from '../../components/CarModel'
import MeshHotspots from '../../ui/hud/MeshHotspots'

// Pulsing neon underglow beneath car
function NeonUnderglow() {
  const ref = useRef<THREE.PointLight>(null!)
  useFrame(({ clock }) => {
    ref.current.intensity = 3.8 + Math.sin(clock.getElapsedTime() * 1.4) * 1.4
  })
  return <pointLight ref={ref} position={[0, 0.06, 0]} color="#b400ff" distance={5} decay={2} />
}

// Orbiting accent — drives live body reflections
function OrbitingAccent() {
  const ref = useRef<THREE.PointLight>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.22
    ref.current.position.set(Math.sin(t) * 5, 1.8, Math.cos(t) * 5)
  })
  return <pointLight ref={ref} color="#00ffe7" intensity={5} distance={14} decay={2} />
}

// Plinth with pulsing dual neon rings
function Plinth() {
  const cyanRing = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const mat = cyanRing.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 2.8 + Math.sin(clock.getElapsedTime() * 0.9) * 1.0
  })
  return (
    <>
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <cylinderGeometry args={[2.45, 2.7, 0.22, 72]} />
        <meshStandardMaterial color="#04040e" metalness={0.96} roughness={0.07} />
      </mesh>
      {/* Cyan outer rim */}
      <mesh ref={cyanRing} position={[0, -0.048, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.44, 0.024, 16, 128]} />
        <meshStandardMaterial color="#00ffe7" emissive="#00ffe7" emissiveIntensity={2.8} toneMapped={false} />
      </mesh>
      {/* Purple inner ring */}
      <mesh position={[0, -0.048, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.88, 0.014, 16, 128]} />
        <meshStandardMaterial color="#b400ff" emissive="#b400ff" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
    </>
  )
}

// Decorative floor rings
function FloorRings() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.244, 0]}>
        <ringGeometry args={[4.0, 4.14, 128]} />
        <meshBasicMaterial color="#00ffe7" transparent opacity={0.09} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.244, 0]}>
        <ringGeometry args={[6.0, 6.1, 128]} />
        <meshBasicMaterial color="#b400ff" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

export default function GarageScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 2.2, 7.5], fov: 44 }}
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
      >
        {/* ── Car ──────────────────────────────────────────────────────────── */}
        <HeroCarModel
          scale={1}
          fallback={
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[2.2, 0.5, 4.2]} />
              <meshStandardMaterial color="#222" metalness={0.3} roughness={0.7} />
            </mesh>
          }
          // debug  ← uncomment once to log exact bbox & node positions
        />
        <MeshHotspots />

        {/* ── Lighting ─────────────────────────────────────────────────────── */}
        <ambientLight intensity={0.05} color="#06001a" />

        {/* Cold white key — front right above */}
        <spotLight
          position={[4.5, 7.5, 4]}
          angle={0.3}
          penumbra={0.85}
          intensity={90}
          color="#d0e8ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Magenta fill — left */}
        <pointLight position={[-5, 2.5, 0.5]} color="#ff00bb" intensity={14} distance={16} decay={2} />

        {/* Cyan fill — right rear */}
        <pointLight position={[4.5, 1.8, -2.5]} color="#00ffe7" intensity={11} distance={14} decay={2} />

        {/* Purple backlight — deep rear */}
        <pointLight position={[0, 1.0, -6]} color="#7700ff" intensity={16} distance={12} decay={2} />

        {/* Neon underglow pulse */}
        <NeonUnderglow />

        {/* Orbiting body accent */}
        <OrbitingAccent />

        {/* ── Geometry ─────────────────────────────────────────────────────── */}
        <Plinth />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.27, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#01010d" metalness={0.97} roughness={0.07} />
        </mesh>

        <Grid
          position={[0, -0.265, 0]}
          args={[60, 60]}
          cellSize={1.2}
          cellThickness={0.4}
          cellColor="#0a0a28"
          sectionSize={6}
          sectionThickness={0.7}
          sectionColor="#18004a"
          fadeDistance={30}
          fadeStrength={2.8}
          infiniteGrid
        />

        <FloorRings />

        <ContactShadows
          position={[0, -0.155, 0]}
          opacity={0.88}
          scale={12}
          blur={3.0}
          far={1.4}
          color="#000018"
        />

        <Environment preset="night" />

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.15}
          target={[0, 0.4, 0]}
        />

        {/* ── Post FX ──────────────────────────────────────────────────────── */}
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.14} luminanceSmoothing={0.62} intensity={2.6} mipmapBlur />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.0014, 0.0014)}
          />
          <Vignette eskil={false} offset={0.16} darkness={0.96} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}