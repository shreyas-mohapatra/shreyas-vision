import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LazyCanvas } from './LazyCanvas.js';

// Procedural Crop Stalks component
function CropField() {
  const count = 70;
  const stalks = useMemo(() => {
    const data: Array<{ pos: [number, number, number]; scale: number; rot: number; speed: number }> = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 10);
      const col = i % 10;
      const x = (col - 4.5) * 0.9 + (Math.random() - 0.5) * 0.2;
      const z = (row - 3.5) * 0.8 + (Math.random() - 0.5) * 0.2;
      // Step terraces: higher at back
      const y = -row * 0.25;
      data.push({
        pos: [x, y, z],
        scale: 0.85 + Math.random() * 0.35,
        rot: Math.random() * Math.PI,
        speed: 1.5 + Math.random() * 0.8,
      });
    }
    return data;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, idx) => {
      const stalk = stalks[idx];
      if (stalk) {
        // Gentle wind sway
        child.rotation.z = Math.sin(t * stalk.speed + stalk.pos[0]) * 0.08;
        child.rotation.x = Math.cos(t * stalk.speed * 0.8 + stalk.pos[2]) * 0.06;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {stalks.map((s, i) => (
        <group key={i} position={s.pos} scale={s.scale}>
          {/* Stalk */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.035, 0.8, 5]} />
            <meshStandardMaterial color="#4E8A57" roughness={0.9} />
          </mesh>
          {/* Wheat / Seed Head */}
          <mesh position={[0, 0.8, 0]}>
            <coneGeometry args={[0.07, 0.3, 5]} />
            <meshStandardMaterial color="#E3C98A" roughness={0.8} />
          </mesh>
          {/* Small side leaf */}
          <mesh position={[0.06, 0.35, 0]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.15, 0.02, 0.04]} />
            <meshStandardMaterial color="#2F5D3A" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Low-poly Terraced Earth Steps
function FarmlandTerrain() {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Terraced layer 1 (Highest, furthest back) */}
      <mesh position={[0, 0.4, -2.5]}>
        <boxGeometry args={[11, 0.6, 2.5]} />
        <meshStandardMaterial color="#9CC29B" roughness={0.95} />
      </mesh>
      {/* Terraced layer 2 */}
      <mesh position={[0, 0.15, -0.8]}>
        <boxGeometry args={[11, 0.5, 2.2]} />
        <meshStandardMaterial color="#4E8A57" roughness={0.9} />
      </mesh>
      {/* Terraced layer 3 */}
      <mesh position={[0, -0.1, 0.8]}>
        <boxGeometry args={[11, 0.5, 2.2]} />
        <meshStandardMaterial color="#3D7349" roughness={0.9} />
      </mesh>
      {/* Soil Foundation */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[12, 0.6, 7]} />
        <meshStandardMaterial color="#3B2F22" roughness={0.98} />
      </mesh>
    </group>
  );
}

// Drifting Low-Poly Earthy Clouds
function SoftClouds() {
  const cloud1 = useRef<THREE.Group>(null);
  const cloud2 = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.12;
    if (cloud1.current) cloud1.current.position.x = ((t * 1.5) % 16) - 8;
    if (cloud2.current) cloud2.current.position.x = (((t + 4) * 1.2) % 16) - 8;
  });

  return (
    <>
      <group ref={cloud1} position={[-4, 2.4, -3]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.7, 7, 6]} />
          <meshStandardMaterial color="#FAF6EC" roughness={0.8} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.6, -0.1, 0]}>
          <sphereGeometry args={[0.5, 6, 6]} />
          <meshStandardMaterial color="#FAF6EC" roughness={0.8} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-0.5, -0.1, 0]}>
          <sphereGeometry args={[0.45, 6, 6]} />
          <meshStandardMaterial color="#FAF6EC" roughness={0.8} transparent opacity={0.85} />
        </mesh>
      </group>

      <group ref={cloud2} position={[2, 2.8, -4]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 7, 6]} />
          <meshStandardMaterial color="#FAF6EC" roughness={0.8} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.7, 0.05, 0]}>
          <sphereGeometry args={[0.55, 6, 6]} />
          <meshStandardMaterial color="#FAF6EC" roughness={0.8} transparent opacity={0.8} />
        </mesh>
      </group>
    </>
  );
}

// Mouse Parallax Controller
function SceneParallaxRig() {
  useFrame(({ camera, pointer }) => {
    // Soft camera tilt with pointer, capped
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.8, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.2 + pointer.y * 0.4, 0.05);
    camera.lookAt(0, 0.2, 0);
  });
  return null;
}

export const HeroFieldScene: React.FC = () => {
  return (
    <LazyCanvas
      fallbackTitle="Terraced Crop Monitoring"
      fallbackSubtitle="AI Visual Diagnostic Intelligence for Smallholder Fields"
      className="w-full h-[440px] md:h-[520px] rounded-2xl overflow-hidden warm-shadow border border-soil-600/15"
      ariaLabel="3D interactive terraced farmland scene with swaying crops"
    >
      <Canvas
        camera={{ position: [0, 2.4, 4.8], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Warm daylight lighting - strictly no neon / no glow */}
        <ambientLight intensity={0.9} color="#FAF6EC" />
        <directionalLight
          position={[6, 8, 4]}
          intensity={1.4}
          color="#FAF6EC"
          castShadow={false}
        />
        <directionalLight
          position={[-6, 4, -4]}
          intensity={0.4}
          color="#CFDDE0"
        />

        <SceneParallaxRig />
        <SoftClouds />
        <FarmlandTerrain />
        <CropField />
      </Canvas>
    </LazyCanvas>
  );
};
