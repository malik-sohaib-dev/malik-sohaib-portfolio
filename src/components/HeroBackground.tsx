import {
  ContactShadows,
  Environment,
  Float,
  MeshDistortMaterial,
  Sparkles,
  Stars,
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import { useRef, useState } from 'react'
import type { Group, Mesh } from 'three'
import { ACESFilmicToneMapping, MathUtils, SRGBColorSpace } from 'three'
import { StaticHeroBackdrop } from './StaticHeroBackdrop'

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    const px = state.pointer.x
    const py = state.pointer.y
    const scrollTilt = Math.min(window.scrollY, 800) * 0.00022
    damp3(group.current.position, [px * 0.5, py * 0.32, 0], 0.55, delta)
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      scrollTilt * 0.25,
      0.05
    )
    group.current.rotation.y += 0.0011
  })

  return <group ref={group}>{children}</group>
}

function CoreCluster() {
  const knot = useRef<Mesh>(null)
  const core = useRef<Mesh>(null)
  const ring = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (knot.current) {
      knot.current.rotation.x += delta * 0.22
      knot.current.rotation.y += delta * 0.18
    }
    if (core.current) {
      core.current.rotation.x -= delta * 0.1
      core.current.rotation.y += delta * 0.14
    }
    if (ring.current) {
      ring.current.rotation.z += delta * 0.08
    }
  })

  return (
    <>
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.5}>
        <mesh ref={knot} position={[0, 0.1, 0]}>
          <torusKnotGeometry args={[0.9, 0.28, 200, 32]} />
          <meshPhysicalMaterial
            color="#0d9488"
            emissive="#4c1d95"
            emissiveIntensity={0.85}
            metalness={0.9}
            roughness={0.2}
            clearcoat={0.4}
            clearcoatRoughness={0.3}
            iridescence={0.5}
            iridescenceIOR={1.1}
            iridescenceThicknessRange={[100, 400]}
          />
        </mesh>
      </Float>
      <Float speed={2.1} rotationIntensity={0.7} floatIntensity={0.7}>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.45, 6]} />
          <MeshDistortMaterial
            color="#5eead4"
            emissive="#312e81"
            emissiveIntensity={0.55}
            roughness={0.12}
            metalness={0.85}
            distort={0.5}
            speed={2.3}
            transparent
            opacity={0.95}
          />
        </mesh>
      </Float>
      <mesh ref={ring} position={[0, -0.2, 0]} rotation={[Math.PI / 2.1, 0, 0]}>
        <torusGeometry args={[1.5, 0.04, 32, 128]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.8}
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>
    </>
  )
}

function OrbitingGems() {
  const g = useRef<Group>(null)
  const seeds = [0, 1, 2, 3, 4] as const

  useFrame((state) => {
    if (!g.current) return
    const t = state.clock.getElapsedTime()
    g.current.children.forEach((ch, i) => {
      const a = t * 0.25 + i * 1.2
      ch.position.x = Math.cos(a) * 2.1
      ch.position.y = Math.sin(a * 0.7) * 0.4
      ch.position.z = Math.sin(a) * 1.1
    })
  })

  return (
    <group ref={g}>
      {seeds.map((i) => (
        <mesh key={i} scale={0.18 + (i % 2) * 0.04}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={i % 2 ? '#a78bfa' : '#2dd4bf'}
            emissive={i % 2 ? '#6d28d9' : '#0f766e'}
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  )
}

function Scene() {
  return (
    <>
      <fog attach="fog" args={['#010409', 4, 22]} />
      <color attach="background" args={['#010409']} />
      <ParallaxRig>
        <ambientLight intensity={0.15} />
        <pointLight
          position={[3, 4, 6]}
          intensity={1.4}
          color="#5eead4"
        />
        <pointLight
          position={[-6, -1, 4]}
          intensity={0.8}
          color="#a78bfa"
        />
        <pointLight
          position={[0, 5, -2]}
          intensity={0.5}
          color="#f0f9ff"
        />
        <spotLight
          position={[0, 8, 2]}
          angle={0.45}
          penumbra={0.4}
          intensity={0.6}
          color="#e0f2fe"
        />
        <CoreCluster />
        <OrbitingGems />
        <Stars
          radius={60}
          depth={40}
          count={2500}
          factor={2.1}
          saturation={0.1}
          fade
          speed={0.25}
        />
        <Sparkles
          count={90}
          scale={6}
          size={1.4}
          speed={0.45}
          color="#7dd3fc"
          opacity={0.75}
        />
        <ContactShadows
          position={[0, -1.45, 0]}
          opacity={0.5}
          scale={8}
          blur={1.5}
          far={2.2}
        />
        <Environment preset="night" environmentIntensity={0.55} />
      </ParallaxRig>
    </>
  )
}

type HeroBackgroundProps = { className?: string }

/**
 * Post-processing (Bloom/Vignette) was removed: when the WebGL context is lost,
 * EffectComposer may read a null context and throw (alpha on null). Scene-only
 * rendering stays stable; ACES filmic tone mapping approximates a punchy look.
 */
export function HeroBackground({ className = '' }: HeroBackgroundProps) {
  const [gpuFailed, setGpuFailed] = useState(false)

  if (gpuFailed) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
        aria-hidden
      >
        <StaticHeroBackdrop />
      </div>
    )
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.1, 6.2], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0)
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
          if ('outputColorSpace' in gl) {
            gl.outputColorSpace = SRGBColorSpace
          }
          const el = gl.domElement
          const onLost = (e: Event) => {
            e.preventDefault()
            setGpuFailed(true)
          }
          el.addEventListener('webglcontextlost', onLost)
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
