import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STATUS_MESSAGES = [
  'Extracting visual feature maps…',
  'Analyzing leaf texture & venation pattern…',
  'Detecting visible lesion boundaries…',
  'Evaluating nutrient chlorosis & water stress…',
  'Scoring severity & differential look-alikes…',
  'Formulating organic & cultural treatment plan…',
];

function ScanningLeaf() {
  const leafRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (leafRef.current) {
      leafRef.current.rotation.y = t * 0.8;
      leafRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    }
    if (scanLineRef.current) {
      // Soft vertical sweeping scan bar
      scanLineRef.current.position.y = Math.sin(t * 2) * 1.5;
    }
  });

  return (
    <group ref={leafRef}>
      {/* Central stylized leaf shape */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.9, 2.6, 6]} />
        <meshStandardMaterial color="#4E8A57" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.05]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.3, 1.3, 0.02]} />
        <meshStandardMaterial color="#3D7349" roughness={0.85} />
      </mesh>
      {/* Golden wheat scan plane */}
      <mesh ref={scanLineRef} position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.08, 0.8]} />
        <meshStandardMaterial
          color="#E3C98A"
          roughness={0.5}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
}

export const ScanLoader3D: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-cream-50 rounded-2xl border border-soil-600/15 warm-shadow max-w-md mx-auto text-center">
      <div className="w-56 h-56 relative">
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.2} color="#FAF6EC" />
          <directionalLight position={[3, 4, 3]} intensity={1.5} color="#FAF6EC" />
          <ScanningLeaf />
        </Canvas>
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="font-serif text-lg font-semibold text-soil-800">
          Running Computer Vision Pathology Diagnosis
        </h3>
        <p className="text-sm font-medium text-leaf-700 min-h-[24px] transition-opacity duration-300">
          {STATUS_MESSAGES[msgIndex]}
        </p>
        <p className="text-xs text-soil-600">
          Google Gemini is analyzing visual pathology and mapping normalized lesion bounding boxes.
        </p>
      </div>

      {/* Earthy Progress Bar */}
      <div className="w-full bg-cream-200 h-1.5 rounded-full mt-5 overflow-hidden">
        <div className="bg-leaf-600 h-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full" />
      </div>
    </div>
  );
};
