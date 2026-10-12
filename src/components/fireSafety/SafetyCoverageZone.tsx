import { memo } from 'react';
import { Html } from '@react-three/drei';
import { Shield } from 'lucide-react';

interface SafetyCoverageZoneProps {
  position?: [number, number, number];
  radius?: number;
  active?: boolean;
  visible?: boolean;
}

const SafetyCoverageZone = memo(function SafetyCoverageZone({
  position = [-1.5, 0.02, -7.8],
  radius = 4.8,
  active = false,
  visible = true,
}: SafetyCoverageZoneProps) {
  if (!visible) return null;

  return (
    <group position={position}>
      {/* 1. Floor Zone Disc Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[radius, 36]} />
        <meshBasicMaterial 
          color="#34c759" 
          transparent 
          opacity={active ? 0.14 : 0.06} 
          depthWrite={false} 
        />
      </mesh>

      {/* 2. Outer Boundary Perimeter Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[radius - 0.08, radius, 48]} />
        <meshBasicMaterial 
          color={active ? '#34c759' : '#30d158'} 
          transparent 
          opacity={active ? 0.65 : 0.3} 
          depthWrite={false} 
        />
      </mesh>

      {/* 3. Mid-Radius Guidance Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[radius * 0.5 - 0.04, radius * 0.5, 36]} />
        <meshBasicMaterial 
          color="#34c759" 
          transparent 
          opacity={active ? 0.35 : 0.15} 
          depthWrite={false} 
        />
      </mesh>

      {/* 4. NFPA 10 Travel Distance Floating Badge on the boundary */}
      {active && (
        <Html position={[0, 0.05, radius * 0.7]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div className="fs-3d-zone-badge">
            <Shield size={11} color="#30d158" strokeWidth={2.4} />
            <span className="fs-zone-tag">NFPA 10</span>
            <span className="fs-zone-divider">·</span>
            <span className="fs-zone-text">75 FT COVERAGE</span>
          </div>
        </Html>
      )}
    </group>
  );
});

export default SafetyCoverageZone;
