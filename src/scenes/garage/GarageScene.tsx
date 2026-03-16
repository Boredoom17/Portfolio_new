import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { HeroCarModel } from '../../components/CarModel'

// Placeholder car — box until real model is in
function CarPlaceholder() {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[4, 0.6, 1.8]} />
        <meshStandardMaterial color="#EDEAE4" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2, 0.5, 1.6]} />
        <meshStandardMaterial color="#EDEAE4" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Wheels */}
      {([-1.4, 1.4] as number[]).flatMap((x) =>
        ([-0.95, 0.95] as number[]).map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.35, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.28, 24]} />
            <meshStandardMaterial color="#111" metalness={0.4} roughness={0.6} />
          </mesh>
        ))
      )}
      {/* Race number plate */}
      <mesh position={[2.01, 0.1, 0]}>
        <planeGeometry args={[0.6, 0.35]} />
        <meshStandardMaterial color="#E8001D" />
      </mesh>
    </group>
  )
}

// Professional showroom lighting with luxury photography feel
function ShowroomLights() {
  return (
    <>
      {/* Key light — front-right, warm and shaped */}
      <directionalLight
        position={[4.5, 6, 5]}
        intensity={0.95}
        color="#f5e8da"
      />
      {/* Fill light — blue rim left rear */}
      <pointLight position={[-6, 3.2, -3]} intensity={22} color="#1e5aff" distance={20} decay={2} />
      {/* Accent light — red/magenta rim right rear */}
      <pointLight position={[6.5, 3.2, -4]} intensity={18} color="#d92652" distance={20} decay={2} />
      {/* Subtle top ambient */}
      <pointLight position={[0, 7.5, 0]} intensity={14} color="#e8f4f0" distance={16} decay={2} />
      {/* Front fill — soft */}
      <pointLight position={[0, 2, 5]} intensity={8} color="#c8dce8" distance={12} decay={2} />
    </>
  )
}

export default function GarageScene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows={false}
        camera={{ position: [5, 2.5, 6], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 0.92, powerPreference: 'default' }}
        frameloop="demand"
      >
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 18, 40]} />

        <ambientLight intensity={0.2} color="#b5c8d8" />
        <ShowroomLights />

        <HeroCarModel
          scale={1}
          position={[0, 0, 0]}
          fallback={<CarPlaceholder />}
        />

        {/* Display plinth under the car to create a pro showroom stage. */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[2.45, 2.7, 0.22, 44]} />
          <meshStandardMaterial color="#101117" metalness={0.62} roughness={0.42} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, 0]}>
          <ringGeometry args={[2.55, 2.68, 48]} />
          <meshBasicMaterial color="#2a4cff" transparent opacity={0.32} />
        </mesh>

        {/* Premium black floor with subtle texture */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[32, 32]} />
          <meshStandardMaterial
            color="#050508"
            metalness={0.5}
            roughness={0.6}
          />
        </mesh>

        <Grid
          position={[0, 0, 0]}
          args={[30, 30]}
          cellSize={1}
          cellThickness={0.25}
          cellColor="#0f0f14"
          sectionSize={5}
          sectionThickness={0.4}
          sectionColor="#151518"
          fadeDistance={16}
          fadeStrength={2.5}
          infiniteGrid={false}
        />

        <Environment preset="city" />
        <pointLight position={[0, 0.2, -7]} intensity={3} distance={15} color="#203047" />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 0.4, 0]}
        />

        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.52} luminanceSmoothing={0.92} intensity={0.75} />
          <Vignette eskil={false} offset={0.3} darkness={0.68} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}