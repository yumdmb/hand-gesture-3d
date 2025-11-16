"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { HandLandmarks } from "@/types/hand";

// Finger segments for realistic rendering
const FINGER_SEGMENTS = [
  [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
  [5, 6], [6, 7], [7, 8],                   // Index finger
  [9, 10], [10, 11], [11, 12],              // Middle finger
  [13, 14], [14, 15], [15, 16],             // Ring finger
  [17, 18], [18, 19], [19, 20],             // Pinky
];

// Metacarpal bones (from wrist to finger bases)
const METACARPALS = [
  [0, 5], [0, 9], [0, 13], [0, 17],
];

// Palm quad connections for mesh
const PALM_QUADS = [
  [0, 5, 9], [0, 9, 13], [0, 13, 17],       // Palm triangles
  [5, 9, 13], [9, 13, 17],                   // Inner palm
];

interface HandModelProps {
  landmarks: HandLandmarks | null;
}

// Realistic tapered bone with smooth capsule shape
function RealisticBone({ start, end, startRadius, endRadius }: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  startRadius: number;
  endRadius: number;
}) {
  const geometry = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const segments = 12;

    // Create capsule-like geometry
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const radius = THREE.MathUtils.lerp(startRadius, endRadius, t);
      points.push(new THREE.Vector2(radius, t * length));
    }

    return new THREE.LatheGeometry(points, 16);
  }, [start.x, start.y, start.z, end.x, end.y, end.z, startRadius, endRadius]);

  const { position, quaternion } = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const position = start.clone();

    const quaternion = new THREE.Quaternion();
    const axis = new THREE.Vector3(0, 1, 0);
    const normalizedDirection = direction.clone().normalize();
    quaternion.setFromUnitVectors(axis, normalizedDirection);

    return { position, quaternion };
  }, [start.x, start.y, start.z, end.x, end.y, end.z]);

  return (
    <mesh position={position} quaternion={quaternion} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#f4c2a8"
        roughness={0.7}
        metalness={0.1}
        emissive="#ff9a76"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

// Realistic joint with subsurface scattering look
function RealisticJoint({ position, radius, isTip = false }: {
  position: THREE.Vector3;
  radius: number;
  isTip?: boolean;
}) {
  return (
    <mesh position={[position.x, position.y, position.z]} castShadow receiveShadow>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial
        color={isTip ? "#f5d0b8" : "#f4c2a8"}
        roughness={0.65}
        metalness={0.05}
        emissive="#ff9a76"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

// Palm mesh for realistic hand appearance
function PalmMesh({ positions }: { positions: THREE.Vector3[] }) {
  const palmGeometry = useMemo(() => {
    if (positions.length === 0) return null;

    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];

    // Create vertices for palm area
    PALM_QUADS.forEach((quad) => {
      quad.forEach(idx => {
        const pos = positions[idx];
        vertices.push(pos.x, pos.y, pos.z);
      });
    });

    // Create triangles
    for (let i = 0; i < PALM_QUADS.length; i++) {
      const baseIdx = i * 3;
      indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [positions]);

  if (!palmGeometry) return null;

  return (
    <mesh geometry={palmGeometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#f4c2a8"
        roughness={0.75}
        metalness={0.1}
        side={THREE.DoubleSide}
        emissive="#ff9a76"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

function HandModel({ landmarks }: HandModelProps) {
  const positions = useMemo(() => {
    if (!landmarks?.landmarks) return [];

    return landmarks.landmarks.map((landmark) => {
      return new THREE.Vector3(
        (landmark.x - 0.5) * 2,
        -(landmark.y - 0.5) * 2,
        -landmark.z * 2
      );
    });
  }, [landmarks]);

  if (!landmarks || positions.length === 0) {
    return null;
  }

  // Helper to get bone radius based on finger type
  const getBoneRadius = (startIdx: number, endIdx: number): { start: number; end: number } => {
    const isTip = endIdx % 4 === 0 && endIdx !== 0;
    const isBase = startIdx % 4 === 1 || startIdx === 0;

    let startRadius = 0.022;
    let endRadius = 0.018;

    if (isBase) startRadius = 0.028;
    if (isTip) endRadius = 0.015;

    // Thumb is thicker
    if (startIdx <= 4 && endIdx <= 4) {
      startRadius *= 1.2;
      endRadius *= 1.2;
    }

    return { start: startRadius, end: endRadius };
  };

  return (
    <group>
      {/* Palm mesh for realistic appearance */}
      <PalmMesh positions={positions} />

      {/* Render finger bones with tapered shape */}
      {FINGER_SEGMENTS.map(([startIdx, endIdx], i) => {
        const { start, end } = getBoneRadius(startIdx, endIdx);
        return (
          <RealisticBone
            key={`finger-${i}`}
            start={positions[startIdx]}
            end={positions[endIdx]}
            startRadius={start}
            endRadius={end}
          />
        );
      })}

      {/* Render metacarpal bones (wrist to fingers) */}
      {METACARPALS.map(([startIdx, endIdx], i) => (
        <RealisticBone
          key={`meta-${i}`}
          start={positions[startIdx]}
          end={positions[endIdx]}
          startRadius={0.032}
          endRadius={0.028}
        />
      ))}

      {/* Render joints with realistic appearance */}
      {positions.map((pos, i) => {
        const isTip = i % 4 === 0 && i !== 0;
        const isBase = i % 4 === 1;
        const isWrist = i === 0;

        let radius = 0.022;
        if (isWrist) radius = 0.038;
        else if (isBase) radius = 0.030;
        else if (isTip) radius = 0.024;

        // Thumb is thicker
        if (i <= 4) radius *= 1.15;

        return (
          <RealisticJoint
            key={`joint-${i}`}
            position={pos}
            radius={radius}
            isTip={isTip}
          />
        );
      })}
    </group>
  );
}

interface Hand3DProps {
  handLandmarks: HandLandmarks | null;
}

export const Hand3D: React.FC<Hand3DProps> = ({ handLandmarks }) => {
  return (
    <div className="w-full h-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        {/* Sophisticated lighting setup for realistic skin rendering */}
        <ambientLight intensity={0.4} />

        {/* Main key light */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Fill light */}
        <directionalLight position={[-3, 2, -5]} intensity={0.4} />

        {/* Rim light for depth */}
        <pointLight position={[0, 3, -3]} intensity={0.5} color="#ffeedd" />

        {/* Bottom bounce light */}
        <pointLight position={[0, -2, 2]} intensity={0.2} color="#e6f3ff" />

        {/* 3D Hand Model */}
        <HandModel landmarks={handLandmarks} />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={1.5}
          maxDistance={5}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Subtle grid */}
        <gridHelper args={[5, 25, '#334155', '#1e293b']} position={[0, -1, 0]} />

        {/* Subtle fog for depth */}
        <fog attach="fog" args={['#0f172a', 4, 8]} />
      </Canvas>
    </div>
  );
};
