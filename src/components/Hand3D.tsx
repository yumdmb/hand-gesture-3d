"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { HandLandmarks } from "@/types/hand";

// Hand connections based on MediaPipe hand model
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],           // Index finger
  [0, 9], [9, 10], [10, 11], [11, 12],      // Middle finger
  [0, 13], [13, 14], [14, 15], [15, 16],    // Ring finger
  [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
  [5, 9], [9, 13], [13, 17],                // Palm
];

// Finger segments that should be rendered as bones (excluding palm connections)
const FINGER_SEGMENTS = [
  [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
  [5, 6], [6, 7], [7, 8],                   // Index finger
  [9, 10], [10, 11], [11, 12],              // Middle finger
  [13, 14], [14, 15], [15, 16],             // Ring finger
  [17, 18], [18, 19], [19, 20],             // Pinky
  [0, 5], [0, 9], [0, 13], [0, 17],         // Wrist to finger bases
];

interface HandModelProps {
  landmarks: HandLandmarks | null;
}

// Component to render a bone (cylinder) between two points
function Bone({ start, end, radius = 0.02 }: { start: THREE.Vector3; end: THREE.Vector3; radius?: number }) {
  const midpoint = useMemo(() => {
    return new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  }, [start.x, start.y, start.z, end.x, end.y, end.z]);

  const length = useMemo(() => start.distanceTo(end), [start.x, start.y, start.z, end.x, end.y, end.z]);

  const quaternion = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const axis = new THREE.Vector3(0, 1, 0);
    return new THREE.Quaternion().setFromUnitVectors(axis, direction);
  }, [start.x, start.y, start.z, end.x, end.y, end.z]);

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color="#ffc0a8" />
    </mesh>
  );
}

// Component to render a joint (sphere) at a landmark
function Joint({ position, radius = 0.03, isWrist = false }: { position: THREE.Vector3; radius?: number; isWrist?: boolean }) {
  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={isWrist ? "#ff6b6b" : "#ffb3a0"} />
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

  return (
    <group>
      {/* Render bones (cylinders between joints) */}
      {FINGER_SEGMENTS.map(([startIdx, endIdx], i) => (
        <Bone
          key={`bone-${i}`}
          start={positions[startIdx]}
          end={positions[endIdx]}
          radius={startIdx === 0 || endIdx === 0 ? 0.025 : 0.018}
        />
      ))}

      {/* Render palm connections with wider bones */}
      {[[5, 9], [9, 13], [13, 17]].map(([startIdx, endIdx], i) => (
        <Bone
          key={`palm-${i}`}
          start={positions[startIdx]}
          end={positions[endIdx]}
          radius={0.03}
        />
      ))}

      {/* Render joints (spheres at landmarks) */}
      {positions.map((pos, i) => (
        <Joint
          key={`joint-${i}`}
          position={pos}
          radius={i === 0 ? 0.04 : i % 4 === 0 ? 0.035 : 0.025}
          isWrist={i === 0}
        />
      ))}
    </group>
  );
}

interface Hand3DProps {
  handLandmarks: HandLandmarks | null;
}

export const Hand3D: React.FC<Hand3DProps> = ({ handLandmarks }) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        {/* Lighting setup for realistic hand rendering */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.4} />

        {/* 3D Hand Model */}
        <HandModel landmarks={handLandmarks} />

        {/* Controls and helpers */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={1}
          maxDistance={5}
        />
        <gridHelper args={[5, 20, '#444444', '#222222']} position={[0, -1, 0]} />
      </Canvas>
    </div>
  );
};
