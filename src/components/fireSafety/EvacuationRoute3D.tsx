import { memo, useMemo } from 'react';
import { CanvasTexture } from 'three';

interface EvacuationRoute3DProps {
  visible?: boolean;
  isDrillActive?: boolean;
}

const EvacuationRoute3D = memo(function EvacuationRoute3D({ 
  visible = true,
  isDrillActive = false 
}: EvacuationRoute3DProps) {
  if (!visible) return null;

  // Real NFPA illuminated emergency exit sign texture (Baked on GPU CanvasTexture)
  const exitTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Deep Emergency Sign Green Background
    ctx.fillStyle = '#0a5c2c';
    ctx.fillRect(0, 0, 512, 256);

    // 2. High-Visibility Illuminated Perimeter Border
    ctx.strokeStyle = '#30d158';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 236);

    // 3. Directional Egress Arrow pointing towards the exit threshold
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(85, 128);
    ctx.lineTo(150, 75);
    ctx.lineTo(150, 105);
    ctx.lineTo(215, 105);
    ctx.lineTo(215, 151);
    ctx.lineTo(150, 151);
    ctx.lineTo(150, 181);
    ctx.closePath();
    ctx.fill();

    // 4. Bold, Crisp NFPA Standard "EXIT" Typography
    ctx.font = '900 100px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', 240, 132);

    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // High-visibility illuminated chevron arrow marker texture for emergency floor guidance
  const arrowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 256, 256);

    // Glowing Green Chevron Arrows pointing forward (^ direction)
    ctx.shadowColor = '#30d158';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#30d158';

    // Lead Chevron
    ctx.beginPath();
    ctx.moveTo(128, 36);
    ctx.lineTo(216, 114);
    ctx.lineTo(190, 138);
    ctx.lineTo(128, 82);
    ctx.lineTo(66, 138);
    ctx.lineTo(40, 114);
    ctx.closePath();
    ctx.fill();

    // Trailing Chevron
    ctx.beginPath();
    ctx.moveTo(128, 118);
    ctx.lineTo(216, 196);
    ctx.lineTo(190, 220);
    ctx.lineTo(128, 164);
    ctx.lineTo(66, 220);
    ctx.lineTo(40, 196);
    ctx.closePath();
    ctx.fill();

    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Egress steps with exact positions and directional rotations (pointing towards exit door PUERTA_1)
  const pathSteps: { pos: [number, number, number]; rotZ: number }[] = [
    { pos: [-8.0, 0.05, -3.2], rotZ: -Math.PI / 2 }, // moving +X along aisle
    { pos: [-6.0, 0.05, -3.2], rotZ: -Math.PI / 2 },
    { pos: [-4.0, 0.05, -3.2], rotZ: -Math.PI / 2 },
    { pos: [-2.0, 0.05, -3.2], rotZ: -Math.PI / 2 },
    { pos: [-0.6, 0.05, -3.2], rotZ: -Math.PI / 2 },
    { pos: [0.0, 0.05, -2.6], rotZ: 3 * Math.PI / 4 }, // 45° corner turn towards door
    { pos: [0.36, 0.05, -1.8], rotZ: Math.PI },        // straight +Z towards exit door
    { pos: [0.36, 0.05, -1.0], rotZ: Math.PI },
    { pos: [0.36, 0.05, -0.3], rotZ: Math.PI },        // threshold directly under exit sign
  ];

  return (
    <group>
      {/* 1. Dynamic Floor Chevron Arrow Markers (ONLY present when running the fire evacuation drill) */}
      {isDrillActive && arrowTexture && (
        <group>
          {pathSteps.map((step, idx) => (
            <mesh 
              key={`egress-arrow-${idx}`} 
              position={step.pos} 
              rotation={[-Math.PI / 2, 0, step.rotZ]}
            >
              <planeGeometry args={[0.36, 0.36]} />
              <meshBasicMaterial 
                map={arrowTexture} 
                transparent 
                opacity={0.92} 
                depthWrite={false} 
              />
            </mesh>
          ))}
        </group>
      )}

      {/* 2. Illuminated Overhead Emergency Exit Sign mounted above classroom door PUERTA_1 */}
      <group position={[0.36, 2.25, -0.06]} rotation={[0, Math.PI, 0]}>
        {/* Die-cast Sign Housing Box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.84, 0.40, 0.08]} />
          <meshStandardMaterial color="#1a1c22" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Illuminated Acrylic Face Plate */}
        {exitTexture && (
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[0.80, 0.36]} />
            <meshStandardMaterial 
              map={exitTexture} 
              emissive="#30d158" 
              emissiveMap={exitTexture} 
              emissiveIntensity={isDrillActive ? 1.4 : 0.85} 
              roughness={0.15}
            />
          </mesh>
        )}
      </group>
    </group>
  );
});

export default EvacuationRoute3D;
