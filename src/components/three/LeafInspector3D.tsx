import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { LazyCanvas } from './LazyCanvas.js';

interface FindingHotspot {
  id: string;
  name: string;
  category: string;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  box_x: number;
  box_y: number;
}

interface LeafInspector3DProps {
  findings?: FindingHotspot[];
  selectedFindingId?: string | null;
  onSelectFinding?: (id: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  none: '#4E8A57',
  low: '#74A87C',
  medium: '#C88A1E',
  high: '#B4532A',
  critical: '#7A2E1B',
};

// Procedural 3D Plant Leaf Shape
function ProceduralLeaf({
  selectedSeverity,
  isHighlighted,
}: {
  selectedSeverity?: string | null;
  isHighlighted: boolean;
}) {
  const leafMesh = useRef<THREE.Mesh>(null);
  const stemMesh = useRef<THREE.Mesh>(null);

  // Procedural leaf shape
  const leafShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -1.4);
    s.bezierCurveTo(0.9, -0.6, 1.2, 0.5, 0, 1.8);
    s.bezierCurveTo(-1.2, 0.5, -0.9, -0.6, 0, -1.4);
    return s;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    }),
    []
  );

  // Gentle auto-rotation when not interacting
  useFrame(({ clock }) => {
    if (leafMesh.current && !isHighlighted) {
      leafMesh.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.25;
    }
  });

  const leafColor = useMemo(() => {
    if (isHighlighted && selectedSeverity) {
      return SEVERITY_COLORS[selectedSeverity] || '#4E8A57';
    }
    return '#3D7349';
  }, [isHighlighted, selectedSeverity]);

  return (
    <group ref={leafMesh as any} rotation={[-0.3, 0, 0]}>
      {/* Central Leaf Blade */}
      <mesh>
        <extrudeGeometry args={[leafShape, extrudeSettings]} />
        <meshStandardMaterial
          color={leafColor}
          roughness={0.85}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main Midrib / Vein */}
      <mesh position={[0, 0.2, 0.03]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 3.2, 6]} />
        <meshStandardMaterial color="#9CC29B" roughness={0.9} />
      </mesh>

      {/* Secondary Lateral Veins */}
      {[-0.6, -0.1, 0.4, 0.9, 1.3].map((y, idx) => (
        <group key={idx} position={[0, y, 0.03]}>
          <mesh position={[0.3, 0.05, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.55, 0.02, 0.015]} />
            <meshStandardMaterial color="#9CC29B" roughness={0.9} opacity={0.8} transparent />
          </mesh>
          <mesh position={[-0.3, 0.05, 0]} rotation={[0, 0, 0.45]}>
            <boxGeometry args={[0.55, 0.02, 0.015]} />
            <meshStandardMaterial color="#9CC29B" roughness={0.9} opacity={0.8} transparent />
          </mesh>
        </group>
      ))}

      {/* Petiole / Stem */}
      <mesh ref={stemMesh} position={[0, -1.9, -0.05]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.1, 6]} />
        <meshStandardMaterial color="#6B5238" roughness={0.9} />
      </mesh>
    </group>
  );
}

// 3D Hotspot pins projected onto the leaf surface
function HotspotMarkers({
  findings,
  selectedFindingId,
  onSelectFinding,
}: {
  findings: FindingHotspot[];
  selectedFindingId?: string | null;
  onSelectFinding?: (id: string) => void;
}) {
  return (
    <group>
      {findings.map((f, idx) => {
        // Map normalized 0..1 coordinates to 3D leaf space
        // box_x: 0..1 -> x: -0.8..0.8
        // box_y: 0..1 -> y: 1.4..-1.0
        const xPos = (f.box_x - 0.5) * 1.5;
        const yPos = (0.5 - f.box_y) * 2.4;
        const isSelected = f.id === selectedFindingId;
        const color = SEVERITY_COLORS[f.severity] || '#B4532A';

        return (
          <group key={f.id || idx} position={[xPos, yPos, 0.12]}>
            {/* Visual 3D marker sphere */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.09 : 0.06, 12, 12]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>

            {/* Interactive HTML Hotspot badge */}
            <Html distanceFactor={6} center>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFinding?.(f.id);
                }}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer shadow-sm ${
                  isSelected
                    ? 'bg-soil-950 text-wheat-300 ring-2 ring-wheat-300 scale-110 z-20'
                    : 'bg-cream-50/95 text-soil-800 hover:bg-cream-100 z-10'
                }`}
                style={{ border: `1.5px solid ${color}` }}
                title={`${f.name} (${f.severity})`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="whitespace-nowrap font-serif">{f.name}</span>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export const LeafInspector3D: React.FC<LeafInspector3DProps> = ({
  findings = [],
  selectedFindingId,
  onSelectFinding,
}) => {
  const selectedFinding = findings.find((f) => f.id === selectedFindingId);

  return (
    <LazyCanvas
      fallbackTitle="Interactive 3D Foliage Inspector"
      fallbackSubtitle="Hotspots mapped to visual pathology findings"
      className="w-full h-[360px] md:h-[420px] rounded-2xl bg-gradient-to-b from-cream-100 via-cream-50 to-sage-100/50 border border-soil-600/15 overflow-hidden warm-shadow relative"
      ariaLabel="3D interactive plant leaf inspector with disease hotspots"
    >
      <div className="absolute top-3 left-4 z-10 pointer-events-none">
        <span className="text-xs font-serif font-medium text-soil-600 uppercase tracking-wider">
          3D Anomaly Inspector
        </span>
        <p className="text-[11px] text-soil-500">Drag to rotate · Click hotspots to inspect</p>
      </div>

      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} color="#FAF6EC" />
        <directionalLight position={[4, 5, 5]} intensity={1.3} color="#FAF6EC" />
        <directionalLight position={[-4, -3, -3]} intensity={0.4} color="#D6E2CF" />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={6.0}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.5}
        />

        <ProceduralLeaf
          selectedSeverity={selectedFinding?.severity}
          isHighlighted={Boolean(selectedFinding)}
        />

        <HotspotMarkers
          findings={findings}
          selectedFindingId={selectedFindingId}
          onSelectFinding={onSelectFinding}
        />
      </Canvas>
    </LazyCanvas>
  );
};
