


import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';


import { HeroCarModel } from '../../components/CarModel';
import MeshHotspots from '../../ui/hud/MeshHotspots';

export default function GarageScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2.2, 7.5], fov: 44 }} shadows dpr={[1, 1.5]}>
        {/* Car, plinth, and environment setup here */}
        <HeroCarModel
          scale={1}
          fallback={<mesh position={[0,0.45,0]}><boxGeometry args={[2.2,0.5,4.2]} /><meshStandardMaterial color="#222" metalness={0.3} roughness={0.7} /></mesh>}
        />
        <MeshHotspots />
        {/* Plinth */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[2.45, 2.7, 0.22, 52]} />
          <meshStandardMaterial color="#07070d" metalness={0.82} roughness={0.28} />
        </mesh>
        {/* <PlinthRing /> */}
        {/* Dark reflective floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.27, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#030308" metalness={0.88} roughness={0.18} />
        </mesh>
        <Environment preset="night" />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.15}
          target={[0, 0.4, 0]}
        />
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.28} luminanceSmoothing={0.82} intensity={1.35} />
          <Vignette eskil={false} offset={0.24} darkness={0.88} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
