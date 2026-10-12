import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SecurityDrone3DProps {
  onSelectDrone?: () => void;
  activeCameraId?: string;
}

export default function SecurityDrone3D({ onSelectDrone, activeCameraId }: SecurityDrone3DProps) {
  const droneGroupRef = useRef<THREE.Group>(null);
  const rotorRefs = useRef<THREE.Mesh[]>([]);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // Smooth autonomous orbit around the campus central quad
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.25; // Gentle patrol speed
    const radiusX = 32;
    const radiusZ = 38;
    const altitude = 24 + Math.sin(t * 2) * 1.5; // Slight atmospheric bobbing

    const posX = Math.sin(t) * radiusX;
    const posZ = 15 + Math.cos(t) * radiusZ;

    if (droneGroupRef.current) {
      droneGroupRef.current.position.set(posX, altitude, posZ);
      
      // Face forward along trajectory with subtle banking angle
      const tangentX = Math.cos(t) * radiusX;
      const tangentZ = -Math.sin(t) * radiusZ;
      const heading = Math.atan2(tangentX, tangentZ);
      droneGroupRef.current.rotation.y = heading;
      droneGroupRef.current.rotation.z = -Math.sin(t) * 0.12; // Bank into the turn
      droneGroupRef.current.rotation.x = 0.05; // Slight forward tilt
    }

    // Spin rotors rapidly
    rotorRefs.current.forEach((rotor, idx) => {
      if (rotor) {
        rotor.rotation.y += (idx % 2 === 0 ? 0.45 : -0.45);
      }
    });
  });

  const isSelected = activeCameraId === 'drone-01';

  return (
    <group 
      ref={droneGroupRef} 
      position={[0, 24, 15]}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectDrone) onSelectDrone();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Central Aerodynamic Fuselage */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.4, 1.8]} />
        <meshStandardMaterial 
          color="#16181f" 
          roughness={0.2} 
          metalness={0.8} 
        />
      </mesh>

      {/* Top GPS / Avionics Dome */}
      <mesh position={[0, 0.25, -0.1]}>
        <cylinderGeometry args={[0.35, 0.4, 0.2, 16]} />
        <meshStandardMaterial color="#222530" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* High-tech Glowing Status Strip */}
      <mesh position={[0, 0.22, 0.8]}>
        <boxGeometry args={[0.8, 0.08, 0.08]} />
        <meshStandardMaterial 
          color={isSelected ? '#2997ff' : '#34c759'} 
          emissive={isSelected ? '#2997ff' : '#34c759'} 
          emissiveIntensity={3} 
        />
      </mesh>

      {/* 4 Carbon Fiber Motor Arms */}
      {[
        { x: 1.2, z: 1.2, rot: Math.PI / 4, idx: 0 },
        { x: -1.2, z: 1.2, rot: -Math.PI / 4, idx: 1 },
        { x: 1.2, z: -1.2, rot: -Math.PI / 4, idx: 2 },
        { x: -1.2, z: -1.2, rot: Math.PI / 4, idx: 3 },
      ].map((arm, i) => (
        <group key={`arm-${i}`} position={[arm.x * 0.7, 0, arm.z * 0.7]}>
          {/* Arm Tube */}
          <mesh rotation={[0, arm.rot, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 1.4, 8]} />
            <meshStandardMaterial color="#0c0e14" metalness={0.9} roughness={0.3} />
          </mesh>

          {/* Motor Pod at Arm Tip */}
          <mesh position={[arm.x * 0.45, 0.15, arm.z * 0.45]}>
            <cylinderGeometry args={[0.2, 0.22, 0.35, 16]} />
            <meshStandardMaterial color="#2c303d" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Propeller Blades */}
          <mesh 
            ref={(el) => { if (el) rotorRefs.current[arm.idx] = el; }}
            position={[arm.x * 0.45, 0.35, arm.z * 0.45]}
          >
            <boxGeometry args={[1.6, 0.02, 0.16]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.2} transparent opacity={0.8} />
          </mesh>

          {/* Strobe Navigation Light under motor */}
          <mesh position={[arm.x * 0.45, -0.1, arm.z * 0.45]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial 
              color={i < 2 ? '#34c759' : '#ff453a'} 
              emissive={i < 2 ? '#34c759' : '#ff453a'} 
              emissiveIntensity={4} 
            />
          </mesh>
        </group>
      ))}

      {/* Underside 3-Axis Gimbal Sensor Sphere */}
      <group position={[0, -0.35, 0.5]}>
        <mesh>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#0a0a0f" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Optical Sensor Aperture */}
        <mesh position={[0, -0.05, 0.22]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial 
            color="#2997ff" 
            emissive="#2997ff" 
            emissiveIntensity={2} 
            roughness={0.1} 
          />
        </mesh>
      </group>

      {/* Downward Patrol Scanning Spotlight */}
      <spotLight 
        ref={spotLightRef}
        position={[0, -0.5, 0]}
        target-position={[0, -24, 5]}
        angle={0.4}
        penumbra={0.6}
        intensity={isSelected ? 4.5 : 2.0}
        color={isSelected ? '#2997ff' : '#e0f2fe'}
        distance={45}
      />
    </group>
  );
}
