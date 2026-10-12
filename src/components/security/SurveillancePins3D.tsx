import { memo } from 'react';
import { Html } from '@react-three/drei';
import { Video } from 'lucide-react';

interface SurveillancePins3DProps {
  activeCameraId: string;
  onSelectCamera: (camId: string) => void;
  visible: boolean;
}

export const CAMERAS = [
  {
    id: 'drone-01',
    name: 'DRONE-01 PATROL',
    type: 'Aerial UAV',
    location: 'Central Academic Quad',
    position: [0, 24, 15] as [number, number, number],
    fps: 60,
    resolution: '4K HDR',
    cameraLookAt: {
      position: [0, 30, 50],
      target: [0, 0, 20]
    }
  },
  {
    id: 'cam-02',
    name: 'CAM-02 PROMENADE',
    type: 'Optical PTZ',
    location: 'Main North Promenade',
    position: [0, 4.2, 50] as [number, number, number],
    fps: 60,
    resolution: '4K 60FPS',
    cameraLookAt: {
      position: [0, 6, 68],
      target: [0, 0, 25]
    }
  },
  {
    id: 'cam-03',
    name: 'CAM-03 ARENA',
    type: 'Wide Fisheye',
    location: 'Athletics Sector Gate',
    position: [-55, 6.0, 18] as [number, number, number],
    fps: 60,
    resolution: '1440p Wide',
    cameraLookAt: {
      position: [-55, 12, 36],
      target: [-55, -2, 10]
    }
  },
  {
    id: 'cam-04',
    name: 'CAM-04 EGRESS 101',
    type: 'Life Safety IR',
    location: 'Classroom Hallway',
    position: [-12, 1.2, 0] as [number, number, number],
    fps: 30,
    resolution: '1080p Thermal/IR',
    cameraLookAt: {
      position: [-12, -2.2, 4],
      target: [-12, -3.2, -4]
    }
  }
];

const SurveillancePins3D = memo(function SurveillancePins3D({
  activeCameraId,
  onSelectCamera,
  visible
}: SurveillancePins3DProps) {
  if (!visible) return null;

  return (
    <group>
      {CAMERAS.filter(c => c.id !== 'drone-01').map((cam) => {
        const isSelected = activeCameraId === cam.id;
        return (
          <Html
            key={cam.id}
            position={cam.position}
            center
            zIndexRange={[50, 0]}
            style={{ pointerEvents: 'auto', userSelect: 'none' }}
          >
            <div
              className={`surveillance-pin ${isSelected ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCamera(cam.id);
              }}
              title={`Switch PiP Feed to ${cam.name}`}
            >
              <div className="surveillance-pin-pill">
                <div className="surveillance-pin-rec"></div>
                <Video size={11} color="#ffffff" />
                <span className="surveillance-pin-tag">{cam.id.toUpperCase()}</span>
              </div>
            </div>
          </Html>
        );
      })}
    </group>
  );
});

export default SurveillancePins3D;
