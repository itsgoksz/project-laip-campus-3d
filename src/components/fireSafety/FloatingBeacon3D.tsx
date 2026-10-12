import { memo } from 'react';
import { Html } from '@react-three/drei';
import { Flame, Wind } from 'lucide-react';

interface FloatingBeacon3DProps {
  position: [number, number, number];
  type: 'extinguisher' | 'smokeDetector';
  tag: string;
  subtext: string;
  isActive: boolean;
  onClick: () => void;
}

const FloatingBeacon3D = memo(function FloatingBeacon3D({
  position,
  type,
  tag,
  subtext,
  isActive,
  onClick,
}: FloatingBeacon3DProps) {
  const isExtinguisher = type === 'extinguisher';

  return (
    <Html 
      position={position} 
      center 
      zIndexRange={[60, 0]}
      style={{ pointerEvents: 'auto', userSelect: 'none' }}
    >
      <div 
        className={`fs-3d-beacon ${isExtinguisher ? 'beacon-fire' : 'beacon-smoke'} ${isActive ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {/* Sleek Glassmorphic Pill */}
        <div className="fs-beacon-pill">
          <div className="fs-beacon-icon-wrap">
            {isExtinguisher ? (
              <Flame size={12} color="#ff453a" strokeWidth={2.4} />
            ) : (
              <Wind size={12} color="#34c759" strokeWidth={2.4} />
            )}
          </div>
          <span className="fs-beacon-tag">{tag}</span>
          <span className="fs-beacon-divider">·</span>
          <span className="fs-beacon-sub">{subtext}</span>
        </div>
      </div>
    </Html>
  );
});

export default FloatingBeacon3D;
