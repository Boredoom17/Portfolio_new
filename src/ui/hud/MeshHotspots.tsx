import { Html } from '@react-three/drei'
import { useState } from 'react'
import { useHotspotStore } from './GarageHotspots'

export default function MeshHotspots() {
  const setActive = useHotspotStore((s) => s.setActive)
  const [hovered, setHovered] = useState<string | null>(null)

  // Wheel positions (approximate, tune as needed)
  const wheels = [
    { pos: [-1.18, 0.38, 1.18], code: 'OBJ·04A' }, // front left
    { pos: [1.18, 0.38, 1.18], code: 'OBJ·04B' }, // front right
    { pos: [-1.18, 0.38, -1.18], code: 'OBJ·04C' }, // rear left
    { pos: [1.18, 0.38, -1.18], code: 'OBJ·04D' }, // rear right
  ]
  // Other parts


  return (
    <>
      {/* Wheels: clickable torus */}
      {wheels.map((w) => (
        <mesh
          key={w.code}
          position={w.pos as [number, number, number]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerOver={() => setHovered(w.code)}
          onPointerOut={() => setHovered(null)}
          onClick={() => setActive('stack')}
        >
          <torusGeometry args={[0.38, 0.18, 16, 32]} />
          <meshBasicMaterial color={hovered === w.code ? '#7ee787' : '#23272e'} opacity={hovered === w.code ? 0.32 : 0.12} transparent />
          {hovered === w.code && (
            <Html center position={[0, 0.45, 0]} zIndexRange={[200, 0]}>
              <span style={{
                background: 'rgba(20,32,20,0.92)',
                color: '#7ee787',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 8,
                padding: '4px 14px',
                boxShadow: '0 2px 12px #23272e',
                letterSpacing: '0.1em',
              }}>TECH STACK</span>
            </Html>
          )}
        </mesh>
      ))}
      {/* Other parts: clickable planes/boxes */}
      {/* Driver seat (window area) */}
      <mesh
        position={[0, 0.85, 0.25]}
        rotation={[-Math.PI / 2.2, 0, 0]}
        onPointerOver={() => setHovered('profile')}
        onPointerOut={() => setHovered(null)}
        onClick={() => setActive('profile')}
      >
        <planeGeometry args={[0.7, 0.38]} />
        <meshBasicMaterial color={hovered === 'profile' ? '#7ee787' : '#23272e'} opacity={hovered === 'profile' ? 0.22 : 0.09} transparent />
        {hovered === 'profile' && (
          <Html center position={[0, 0.22, 0]} zIndexRange={[200, 0]}>
            <span style={{
              background: 'rgba(20,32,20,0.92)',
              color: '#7ee787',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 8,
              padding: '4px 14px',
              boxShadow: '0 2px 12px #23272e',
              letterSpacing: '0.1em',
            }}>DRIVER SEAT</span>
          </Html>
        )}
      </mesh>
      {/* Socials (back wing) */}
      <mesh
        position={[0, 1.05, -2.05]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => setHovered('links')}
        onPointerOut={() => setHovered(null)}
        onClick={() => setActive('links')}
      >
        <boxGeometry args={[1.1, 0.18, 0.22]} />
        <meshBasicMaterial color={hovered === 'links' ? '#7ee787' : '#23272e'} opacity={hovered === 'links' ? 0.22 : 0.09} transparent />
        {hovered === 'links' && (
          <Html center position={[0, 0.18, 0]} zIndexRange={[200, 0]}>
            <span style={{
              background: 'rgba(20,32,20,0.92)',
              color: '#7ee787',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 8,
              padding: '4px 14px',
              boxShadow: '0 2px 12px #23272e',
              letterSpacing: '0.1em',
            }}>SOCIALS</span>
          </Html>
        )}
      </mesh>
      {/* Projects (front booth/hood) */}
      <mesh
        position={[0, 0.75, 2.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => setHovered('projects')}
        onPointerOut={() => setHovered(null)}
        onClick={() => setActive('projects')}
      >
        <planeGeometry args={[0.9, 0.32]} />
        <meshBasicMaterial color={hovered === 'projects' ? '#7ee787' : '#23272e'} opacity={hovered === 'projects' ? 0.22 : 0.09} transparent />
        {hovered === 'projects' && (
          <Html center position={[0, 0.18, 0]} zIndexRange={[200, 0]}>
            <span style={{
              background: 'rgba(20,32,20,0.92)',
              color: '#7ee787',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 8,
              padding: '4px 14px',
              boxShadow: '0 2px 12px #23272e',
              letterSpacing: '0.1em',
            }}>PROJECTS</span>
          </Html>
        )}
      </mesh>
    </>
  )
}