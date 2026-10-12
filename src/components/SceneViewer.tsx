import { Canvas } from '@react-three/fiber';
import { CameraControls, Environment, useGLTF, Clone, Instances, Instance, MeshDistortMaterial, Sky, Stars, Html } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState, useMemo, memo } from 'react';
import SafetyCoverageZone from './fireSafety/SafetyCoverageZone';
import FloatingBeacon3D from './fireSafety/FloatingBeacon3D';
import EvacuationRoute3D from './fireSafety/EvacuationRoute3D';
import SecurityDrone3D from './security/SecurityDrone3D';
import SurveillancePins3D from './security/SurveillancePins3D';

function SchoolModel({ onClick }: any) {
  const { scene } = useGLTF('/school.glb');
  const [hovered, setHover] = useState(false);
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHover(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <primitive object={scene} scale={hovered ? 1.008 : 1} />
    </group>
  );
}

// Obstacle bounding boxes to prevent trees and props from clipping into building geometry
const BUILDING_OBSTACLES = [
  // School central building
  { minX: -38, maxX: 38, minZ: -18, maxZ: 18 },
  // Central Fountain & Reflection pool
  { minX: -14, maxX: 14, minZ: 11, maxZ: 39 },
  // Library (Back quad center)
  { minX: -30, maxX: 30, minZ: -80, maxZ: -30 },
  // West College (Back quad left)
  { minX: -65, maxX: -25, minZ: -75, maxZ: -35 },
  // East College (Back quad right)
  { minX: 25, maxX: 65, minZ: -75, maxZ: -35 },
  // East Apartment (Modern residential)
  { minX: 38, maxX: 75, minZ: -10, maxZ: 30 },
  // West Athletics / Basketball
  { minX: -75, maxX: -38, minZ: -10, maxZ: 30 },
];

function isInsideObstacle(x: number, z: number, padding = 1.5) {
  return BUILDING_OBSTACLES.some(
    obs => x >= obs.minX - padding && x <= obs.maxX + padding && z >= obs.minZ - padding && z <= obs.maxZ + padding
  );
}

// 1. PERFORMANCE: Instanced Trees with Deterministic Collision Checks
function TreeInstances() {
  const treeData = useMemo(() => {
    const data: any[] = [];
    
    // Main Promenade (Organic clustering, strictly avoiding the fountain)
    [-14, -10, 10, 14].forEach(x => {
      for (let z = 10; z <= 90; z += 8) {
        const posX = x + (Math.sin(z * 13) * 1.5);
        const posZ = z + (Math.cos(x * 17) * 1.5);
        if (!isInsideObstacle(posX, posZ, 2.0)) {
          data.push({
            position: [posX, -4.5, posZ],
            scale: 0.85 + (Math.abs(Math.sin(z + x)) * 0.4),
            rot: (z * 0.7) % Math.PI
          });
        }
      }
    });

    // Back Quad (Organic clustering, strictly avoiding library & colleges)
    [-14, -10, 10, 14].forEach(x => {
      for (let z = -80; z <= -10; z += 8) {
        const posX = x + (Math.sin(z * 11) * 1.5);
        const posZ = z + (Math.cos(x * 19) * 1.5);
        if (!isInsideObstacle(posX, posZ, 2.0)) {
          data.push({
            position: [posX, -4.5, posZ],
            scale: 0.85 + (Math.abs(Math.sin(z - x)) * 0.4),
            rot: (z * 0.9) % Math.PI
          });
        }
      }
    });

    // Cross Paths (Front Quad)
    [50, 75].forEach(z => {
      for (let x = -60; x <= 60; x += 10) {
        if (Math.abs(x) < 18) continue; // Skip center promenade
        const posX = x + (Math.sin(x * 7) * 2);
        const posZ = z + 8 + (Math.cos(z * 5) * 2);
        if (!isInsideObstacle(posX, posZ, 2.0)) {
          data.push({
            position: [posX, -4.5, posZ],
            scale: 0.85 + (Math.abs(Math.sin(posX)) * 0.4),
            rot: (posX * 0.5) % Math.PI
          });
        }
      }
    });

    // Residential Park Perimeter (Strictly outside apartment building)
    const residentialCoords = [
      [36, -30], [42, -35], [48, -25], [78, -30], [82, -20],
      [78, 28], [84, 15], [82, 0], [78, -10], [86, 32],
      [42, 32], [48, 36], [76, 36]
    ];
    residentialCoords.forEach(([rx, rz], idx) => {
      if (!isInsideObstacle(rx, rz, 2.0)) {
        data.push({
          position: [rx, -4.5, rz],
          scale: 0.9 + ((idx % 3) * 0.18),
          rot: (idx * 1.1) % Math.PI
        });
      }
    });

    return data;
  }, []);

  return (
    <group>
      {/* Trunks */}
      <Instances limit={1000} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 5]} />
        <meshStandardMaterial color="#2d1e16" roughness={0.9} />
        {treeData.map((t, i) => (
          <Instance key={`trunk-${i}`} position={[t.position[0], t.position[1] + 1 * t.scale, t.position[2]]} scale={t.scale} />
        ))}
      </Instances>
      {/* Leaves */}
      <Instances limit={1000} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#1c3b2b" roughness={0.7} flatShading />
        {treeData.map((t, i) => (
          <Instance key={`leaf-${i}`} position={[t.position[0], t.position[1] + 3 * t.scale, t.position[2]]} scale={t.scale} rotation={[0, t.rot, 0]} />
        ))}
      </Instances>
    </group>
  );
}

// Optimized StreetLamp: Emissive glow on bulbs without 18 individual point lights
function StreetLamp({ position, rotation = [0,0,0], lightsOn, onClick }: any) {
  const { scene } = useGLTF('/street_lamp.glb') as any;
  const [hovered, setHover] = useState(false);
  const groupRef = useRef<any>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (child.material.name.toLowerCase().includes('bulb') || child.name.toLowerCase().includes('bulb')) {
          child.material = child.material.clone();
          if (lightsOn) {
            child.material.emissive.set('#ffebb5');
            child.material.emissiveIntensity = 4.5;
          } else {
            child.material.emissive.set('#000000');
            child.material.emissiveIntensity = 0;
          }
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene, lightsOn]);

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
    >
      <Clone object={scene} scale={hovered ? 1.05 : 1} />
    </group>
  );
}

const MODELS = {
  college: '/college_velikiy_ustug_vumk.glb',
  library: '/library.glb',
  apartment: '/modern_apartment.glb',
  villa: '/modern_villa_apartment_house_home_building.glb',
  stadium: '/al_wakrah_stadium_worldcup_2022.glb',
  basketball: '/indoor_basketball_court.glb'
};

function CampusAsset({ type, position, rotation = [0,0,0], scale = 1, onClick }: any) {
  const path = MODELS[type as keyof typeof MODELS];
  const { scene } = useGLTF(path) as any;
  const groupRef = useRef<any>(null);
  const [hovered, setHover] = useState(false);

  useEffect(() => {
    if (!groupRef.current) return;
    // Traverse the cloned instance in the DOM
    groupRef.current.traverse((child: any) => {
      if (child.isMesh) {
        // Handle skybox removal for the college
        if (type === 'college') {
          child.geometry.computeBoundingBox();
          const bbox = child.geometry.boundingBox;
          if (bbox) {
            const sizeX = bbox.max.x - bbox.min.x;
            const sizeY = bbox.max.y - bbox.min.y;
            const sizeZ = bbox.max.z - bbox.min.z;
            // Hide excessively large flat planes (baked-in skyboxes)
            // Use > 150 to ensure we only catch massive covers and not the building mesh itself
            if (sizeX > 150 || sizeY > 150 || sizeZ > 150) {
              child.visible = false;
            }
          }
        }
        
        // Handle custom coloring for the apartment
        if (type === 'apartment' && child.material) {
           child.material = child.material.clone();
           // Make the exterior light brown to match the campus buildings
           child.material.color.set('#c19a79');
           child.material.needsUpdate = true;
        }
      }
    });
  }, [scene, type]);

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation} 
      scale={hovered ? scale * 1.02 : scale}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      onPointerOver={(e) => {
        if (onClick) {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        if (onClick) {
          e.stopPropagation();
          setHover(false);
          document.body.style.cursor = 'auto';
        }
      }}
    >
      <Clone object={scene} />
    </group>
  );
}

function CampusGrounds({ lightsOn, setActiveAsset }: any) {
  return (
    <group>
      {/* Massive Campus Ground Plate */}
      <mesh position={[0, -4.60, 0]}>
        <boxGeometry args={[450, 0.2, 450]} />
        <meshStandardMaterial color="#0b0f19" />
      </mesh>
      
      {/* 1. FRONT QUAD ZONING (Elevation: -4.48) */}
      <mesh position={[0, -4.48, 55]}>
        <boxGeometry args={[86, 0.05, 78]} />
        <meshStandardMaterial color="#101f16" />
      </mesh>

      {/* 2. BACK ACADEMIC QUAD ZONING (Elevation: -4.48) */}
      <mesh position={[0, -4.48, -50]}>
        <boxGeometry args={[140, 0.05, 80]} />
        <meshStandardMaterial color="#101f16" />
      </mesh>
      
      {/* 3. LIBRARY PLAZA (Circular Concrete Hub, Elevation: -4.47) */}
      <mesh position={[0, -4.47, -40]}>
        <cylinderGeometry args={[25, 25, 0.05, 64]} />
        <meshStandardMaterial color="#171b24" />
      </mesh>

      {/* 4. ATHLETICS SECTOR (Dedicated Sports Plaza, cleanly elevated at -4.45 with zero overlap) */}
      <group position={[-55, -4.45, 10]}>
        <mesh receiveShadow>
          <boxGeometry args={[44, 0.06, 38]} />
          <meshStandardMaterial color="#141822" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.032, 0]}>
          <boxGeometry args={[40, 0.02, 34]} />
          <meshStandardMaterial color="#221616" roughness={0.7} />
        </mesh>
      </group>

      {/* 5. EAST RESIDENTIAL & OPERATIONS SECTOR PLAZA (Elevation: -4.45) */}
      <group position={[55, -4.45, 10]}>
        <mesh receiveShadow>
          <boxGeometry args={[44, 0.06, 38]} />
          <meshStandardMaterial color="#141822" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.032, 0]}>
          <boxGeometry args={[40, 0.02, 34]} />
          <meshStandardMaterial color="#1c202a" roughness={0.7} />
        </mesh>
      </group>

      {/* East & West Arterial Roads (Tier 1: Elevation -4.44, height 0.08) */}
      <mesh position={[-100, -4.44, 0]}>
        <boxGeometry args={[16, 0.08, 350]} />
        <meshStandardMaterial color="#0c0e14" />
      </mesh>
      <mesh position={[100, -4.44, 0]}>
        <boxGeometry args={[16, 0.08, 350]} />
        <meshStandardMaterial color="#0c0e14" />
      </mesh>

      {/* Main Promenade Path (North-South arterial, Tier 2: Elevation -4.42, height 0.08) */}
      <mesh position={[0, -4.42, 45]}>
        <boxGeometry args={[16, 0.08, 90]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>

      {/* Back Academic Quad North-South Path (Tier 2: Elevation -4.42, height 0.08) */}
      <mesh position={[0, -4.42, -50]}>
        <boxGeometry args={[16, 0.08, 80]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      
      {/* Cross Paths in Front Quad (Tier 3: Elevation -4.40, height 0.08, cleanly above promenade) */}
      <mesh position={[0, -4.40, 50]}>
        <boxGeometry args={[110, 0.08, 10]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[0, -4.40, 75]}>
        <boxGeometry args={[110, 0.08, 10]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>

      {/* Back Academic Quad East-West Path (Tier 3: Elevation -4.40, height 0.08) */}
      <mesh position={[0, -4.40, -50]}>
        <boxGeometry args={[140, 0.08, 10]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>

      {/* Walkways connecting wings of main building (Tier 3: Elevation -4.40, height 0.08) */}
      <mesh position={[-30, -4.40, 10]}>
        <boxGeometry args={[60, 0.08, 8]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[30, -4.40, 10]}>
        <boxGeometry args={[60, 0.08, 8]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>

      {/* DESIRE PATHS (Diagonal Shortcuts: Tier 4: Elevation -4.38, height 0.08, zero Z-fighting) */}
      <mesh position={[-22.5, -4.38, 50]} rotation={[0, Math.atan2(-50, 45), 0]}>
        <boxGeometry args={[6, 0.08, 68]} />
        <meshStandardMaterial color="#11151c" />
      </mesh>
      <mesh position={[22.5, -4.38, 50]} rotation={[0, Math.atan2(50, 45), 0]}>
        <boxGeometry args={[6, 0.08, 68]} />
        <meshStandardMaterial color="#11151c" />
      </mesh>

      {/* ORGANIC TREES (Single Draw Call via InstancedMesh) */}
      <TreeInstances />

      {/* Street Lamps along the Promenade */}
      {[-8, 8].map(x => (
        [15, 35, 55, 75, 95, -25, -45, -65, -85].map(z => (
          <StreetLamp 
            key={`lamp-${x}-${z}`} 
            position={[x, -4.6, z]} 
            lightsOn={lightsOn}
            onClick={() => setActiveAsset('streetlight')}
          />
        ))
      ))}

      {/* Strategic Promenade Lighting: 4 area lights instead of 18 individual point lights */}
      {lightsOn && (
        <group>
          <pointLight position={[0, 4.5, 75]} intensity={3.5} distance={40} color="#ffebb5" />
          <pointLight position={[0, 4.5, 35]} intensity={3.5} distance={40} color="#ffebb5" />
          <pointLight position={[0, 4.5, -25]} intensity={3.5} distance={40} color="#ffebb5" />
          <pointLight position={[0, 4.5, -65]} intensity={3.5} distance={40} color="#ffebb5" />
        </group>
      )}

      {/* ---- CAMPUS BUILDINGS ---- */}

      {/* 1. FRONT QUAD (Open area) */}
      {/* (Buildings moved to back quad) */}

      {/* 2. BACK QUAD (Library & Academics) */}
      <CampusAsset 
        type="library" 
        position={[0, -12, -55]} 
        rotation={[0, 0, 0]} 
        scale={3.5} 
        onClick={() => setActiveAsset('mainBuilding')} 
      />
      {/* College buildings flanking the Library */}
      <CampusAsset 
        type="college" 
        position={[-45, -4.6, -55]} 
        rotation={[0, Math.PI / 2, 0]} 
        scale={2.5} 
        onClick={() => setActiveAsset('mainBuilding')} 
      />
      <CampusAsset 
        type="college" 
        position={[45, -4.6, -55]} 
        rotation={[0, -Math.PI / 2, 0]} 
        scale={2.5} 
        onClick={() => setActiveAsset('mainBuilding')} 
      />

      {/* 3. EAST RESIDENTIAL SECTOR */}
      <CampusAsset 
        type="apartment" 
        position={[55, -4.6, 10]} 
        rotation={[0, -Math.PI / 2, 0]} 
        scale={2.5} 
        onClick={() => setActiveAsset('maintenance')} 
      />

      {/* 4. WEST ATHLETICS SECTOR */}
      <CampusAsset 
        type="basketball" 
        position={[-55, -4.6, 10]} 
        rotation={[0, Math.PI / 2, 0]} 
        scale={1.2} 
        onClick={() => setActiveAsset('sportsComplex')} 
      />

      {/* Central Reflection Pool / Fountain */}
      <group position={[0, -4.4, 25]}>
        <mesh>
          <cylinderGeometry args={[10, 10, 0.2, 64]} />
          <meshStandardMaterial color="#141923" />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[9.5, 9.5, 0.1, 32]} />
          {/* Liveliness: Optimized GPU Water Shader */}
          <MeshDistortMaterial 
            color="#3a6b8c" 
            roughness={0.15} 
            metalness={0.6} 
            distort={0.06} 
            speed={1.2} 
          />
        </mesh>
        {/* Modern Art Centerpiece in the fountain */}
        <mesh position={[0, 2, 0]}>
          <octahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={1} />
        </mesh>
      </group>
    </group>
  );
}

function CampusBeacon3D({ 
  position, 
  title, 
  subtitle, 
  color = '#2997ff',
  onClick 
}: { 
  position: [number, number, number]; 
  title: string; 
  subtitle: string; 
  color?: string;
  onClick: () => void;
}) {
  return (
    <Html 
      position={position} 
      center 
      zIndexRange={[60, 0]} 
      style={{ pointerEvents: 'auto', userSelect: 'none' }}
    >
      <div 
        className="campus-3d-beacon active"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <div className="campus-beacon-pill" style={{ borderColor: `${color}40` }}>
          <div className="campus-beacon-dot" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
          <div className="campus-beacon-meta">
            <span className="campus-beacon-title" style={{ color: '#fff' }}>{title}</span>
            <span className="campus-beacon-divider">·</span>
            <span className="campus-beacon-sub" style={{ color: color }}>{subtitle}</span>
          </div>
        </div>
      </div>
    </Html>
  );
}

function FireExtinguisher({ position, rotation = [0,0,0], scale = 1, onClick }: any) {
  const [hovered, setHover] = useState(false);
  const { scene } = useGLTF('/firefighter_vision_fire_extinguisher.glb') as any;
  return (
    <group 
      position={position} 
      rotation={rotation} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
      scale={hovered ? scale * 1.1 : scale}
    >
      <Clone object={scene} />
    </group>
  );
}

function SmokeDetector({ position, rotation = [0,0,0], onClick }: any) {
  const [hovered, setHover] = useState(false);
  return (
    <group 
      position={position} 
      rotation={rotation} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
      scale={hovered ? 1.2 : 1}
    >
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#f2f2f7" roughness={0.2} />
      </mesh>
      {/* Sensor bump */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#1c1c1e" />
      </mesh>
      {/* Blinking light indicator */}
      <mesh position={[0.2, -0.05, 0]}>
        <sphereGeometry args={[0.04]} />
        <meshStandardMaterial color="#34c759" emissive="#34c759" emissiveIntensity={hovered ? 2 : 0.5} />
      </mesh>
    </group>
  );
}

function JapaneseClassroom({ 
  position, 
  setActiveAsset, 
  activeAsset, 
  showCoverage = true, 
  isLeftWing = true,
  isDrillActive = false,
  isClassroomView = false
}: { 
  position: [number, number, number]; 
  setActiveAsset: any; 
  activeAsset?: string | null; 
  showCoverage?: boolean; 
  isLeftWing?: boolean; 
  isDrillActive?: boolean;
  isClassroomView?: boolean;
}) {
  const { scene, materials } = useGLTF('/japanese_classroom.glb') as any;
  
  // Apply uniform flat colors to the classroom to match the main campus textures
  useEffect(() => {
    const wallColor = '#c19a79'; // Sandy tan
    const roofColor = '#c2c2c2'; // Slightly darker grey to match campus roof
    const windowColor = '#729cbd'; // Glass blue
    const doorColor = '#8c98a3'; // Darker grey for doors
    
    if (materials) {
      if (materials.PARED) {
        materials.PARED.map = null;
        materials.PARED.color.set(roofColor);
        materials.PARED.needsUpdate = true;
      }
      if (materials.StingrayPBS2) {
        materials.StingrayPBS2.map = null;
        materials.StingrayPBS2.color.set(wallColor);
        materials.StingrayPBS2.needsUpdate = true;
      }
      if (materials.StingrayPBS1) {
        materials.StingrayPBS1.map = null;
        materials.StingrayPBS1.color.set(windowColor); 
        materials.StingrayPBS1.needsUpdate = true;
      } 
      if (materials.StingrayPBS9) {
        materials.StingrayPBS9.map = null;
        materials.StingrayPBS9.color.set(doorColor); 
        materials.StingrayPBS9.needsUpdate = true;
      } 
    }
  }, [materials]);

  return (
    <group position={position} scale={0.75}>
      {/* We use Clone so we can render multiple instances of the same GLTF scene */}
      <Clone object={scene} />

      {/* Emergency Drill Strobe / Siren Light */}
      {isDrillActive && isLeftWing && (
        <pointLight position={[-1.5, 2.7, -4]} intensity={4.5} distance={18} color="#ff3b30" />
      )}

      {/* 1. NFPA 10 Travel Coverage Disc on Floor (Only when inspecting classroom or active) */}
      {isLeftWing && (isClassroomView || activeAsset === 'fireExtinguisher') && (
        <SafetyCoverageZone 
          position={[-1.5, 0.02, -7.8]} 
          active={activeAsset === 'fireExtinguisher' || isDrillActive} 
          visible={showCoverage} 
        />
      )}

      {/* 2. Fire Extinguisher mounted on the wall near chalkboard */}
      <FireExtinguisher 
        position={[-1.5, 1.75, -7.8]} 
        scale={0.022} 
        onClick={() => setActiveAsset('fireExtinguisher')} 
      />

      {/* 3. Floating 3D Beacon for Fire Extinguisher (Shown in classroom inspection or drill) */}
      {isLeftWing && (isClassroomView || activeAsset === 'fireExtinguisher' || isDrillActive) && (
        <FloatingBeacon3D 
          position={[-1.5, 2.25, -7.6]}
          type="extinguisher"
          tag="FE-101"
          subtext={isDrillActive ? 'EVAC READY' : '1.2 MPa'}
          isActive={activeAsset === 'fireExtinguisher' || isDrillActive}
          onClick={() => setActiveAsset('fireExtinguisher')}
        />
      )}

      {/* 4. Smoke Detector mounted on the ceiling */}
      <SmokeDetector 
        position={[-6, 2.85, -4]} 
        onClick={() => setActiveAsset('smokeDetector')} 
      />

      {/* 5. Floating 3D Beacon for Smoke Detector */}
      {isLeftWing && (isClassroomView || activeAsset === 'smokeDetector' || isDrillActive) && (
        <FloatingBeacon3D 
          position={[-6, 2.50, -4]}
          type="smokeDetector"
          tag="SD-101"
          subtext={isDrillActive ? 'ALARM PULSE' : 'ONLINE'}
          isActive={activeAsset === 'smokeDetector' || isDrillActive}
          onClick={() => setActiveAsset('smokeDetector')}
        />
      )}

      {/* 6. Evacuation Wayfinding Egress Route */}
      {isLeftWing && (isClassroomView || isDrillActive) && (
        <EvacuationRoute3D visible={true} isDrillActive={isDrillActive} />
      )}
    </group>
  );
}

const SceneViewer = memo(function SceneViewer({ 
  viewMode = 'campus', 
  activeAsset, 
  setActiveAsset, 
  nightMode, 
  lightsOn,
  showCoverage = true,
  isDrillActive = false,
  activeCameraId = 'drone-01',
  setActiveCameraId,
  showSecurityPip = true,
  cameraFlyOverride
}: any) {
  const cameraControlsRef = useRef<any>(null);

  useEffect(() => {
    if (!cameraControlsRef.current) return;
    const cc = cameraControlsRef.current;

    // Handle high-priority PiP surveillance camera fly-through override
    if (cameraFlyOverride) {
      cc.setLookAt(
        cameraFlyOverride.position[0], cameraFlyOverride.position[1], cameraFlyOverride.position[2],
        cameraFlyOverride.target[0], cameraFlyOverride.target[1], cameraFlyOverride.target[2],
        true
      );
      return;
    }
    
    if (viewMode === 'campus') {
      if (activeAsset === 'mainBuilding') {
        // Focus directly on Main Academic Building
        cc.setLookAt(
          0, 10, 44,
          0, 2, 0,
          true
        );
      } else if (activeAsset === 'hvac') {
        // Angle looking down at the rooftop AHU / mechanical penthouse
        cc.setLookAt(
          -14, 18, 20,
          0, 5, 0,
          true
        );
      } else if (activeAsset === 'powerGrid' || activeAsset === 'streetlight') {
        // Promenade power infrastructure & substation corridor
        cc.setLookAt(
          28, 22, 50,
          0, 0, 20,
          true
        );
      } else if (activeAsset === 'sportsComplex') {
        // West athletics & indoor basketball arena
        cc.setLookAt(
          -55, 14, 42,
          -55, -2, 10,
          true
        );
      } else if (activeAsset === 'maintenance') {
        // East facilities & residential operations hub
        cc.setLookAt(
          55, 16, 45,
          55, 0, 10,
          true
        );
      } else {
        // Full campus exterior overview
        cc.setLookAt(
          -30, 20, 60, // Camera Position
          0, 0, 0,     // Target Position
          true         // Animate transition
        );
      }
    } else {
      if (activeAsset === 'fireExtinguisher') {
        // Smooth close-up inspection angle right in front of the fire extinguisher
        cc.setLookAt(
          -13.0, -3.1, -6.1,      // Camera Position
          -13.125, -3.19, -7.85,  // Target Position
          true
        );
      } else if (activeAsset === 'smokeDetector') {
        // Smooth inspection angle looking up at ceiling smoke detector
        cc.setLookAt(
          -16.0, -3.2, -4.5,     // Camera Position
          -16.5, -2.4, -4.0,     // Target Position
          true
        );
      } else {
        // Cinematic fly-in to interior (Left Classroom overview)
        cc.setLookAt(
          -12, -2.5, 4,  // Camera Position
          -12, -3.5, -3, // Target Position
          true           // Animate transition
        );
      }
    }
  }, [viewMode, activeAsset, cameraFlyOverride]);

  return (
    <div className="scene-container">
      <Canvas 
        camera={{ fov: 45 }} 
        onPointerMissed={() => setActiveAsset(null)}
        dpr={[1, 1.5]}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          stencil: false,
          depth: true
        }}
      >
        {/* Environmental Sky & Atmospheric Depth (Zero-Lag Game Dev Tricks) */}
        <color attach="background" args={[nightMode ? '#05070a' : '#87ceeb']} />
        <fog attach="fog" args={[nightMode ? '#05070a' : '#87ceeb', 0.003]} />
        
        <Sky 
          distance={450000} 
          sunPosition={nightMode ? [0, -1, 0] : [1, 0.5, 0]} // Pushes sun below horizon at night
          inclination={0} 
          azimuth={0.25} 
        />
        
        {nightMode && (
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        )}

        {/* Dynamic lighting based on view mode and night mode */}
        <ambientLight intensity={nightMode ? 0.05 : (viewMode === 'campus' ? 0.5 : 1.2)} />
        <directionalLight position={[10, 20, 10]} intensity={nightMode ? 0.1 : (viewMode === 'campus' ? 1.5 : 0.3)} />
        
        <Suspense fallback={null}>
          <SchoolModel onClick={() => setActiveAsset('mainBuilding')} />
          <CampusGrounds lightsOn={lightsOn} setActiveAsset={setActiveAsset} />

          {/* Autonomous Security Patrol Drone & Ground Surveillance Markers (Only in Security Feeds Mode) */}
          {viewMode === 'campus' && showSecurityPip && (
            <>
              <SecurityDrone3D 
                activeCameraId={activeCameraId} 
                onSelectDrone={() => {
                  if (setActiveCameraId) setActiveCameraId('drone-01');
                }} 
              />
              <SurveillancePins3D 
                activeCameraId={activeCameraId}
                onSelectCamera={(id) => {
                  if (setActiveCameraId) setActiveCameraId(id);
                }}
                visible={showSecurityPip}
              />
            </>
          )}

          {/* Dynamic 3D Beacons for Selected Campus Assets */}
          {viewMode === 'campus' && activeAsset === 'mainBuilding' && (
            <CampusBeacon3D 
              position={[0, 9.5, 0]}
              title="MAIN ACADEMIC BUILDING"
              subtitle="842 IN · 3 FLOORS"
              color="#2997ff"
              onClick={() => setActiveAsset('mainBuilding')}
            />
          )}
          {viewMode === 'campus' && activeAsset === 'hvac' && (
            <CampusBeacon3D 
              position={[0, 8.2, 0]}
              title="ROOFTOP HVAC PLANT"
              subtitle="21.5°C · 6 CHILLERS"
              color="#34c759"
              onClick={() => setActiveAsset('hvac')}
            />
          )}
          {viewMode === 'campus' && (activeAsset === 'powerGrid' || activeAsset === 'streetlight') && (
            <CampusBeacon3D 
              position={[0, 6.0, 25]}
              title="SUBSTATION GRID"
              subtitle="2.41 MW · 480 kW SOLAR"
              color="#ffd60a"
              onClick={() => setActiveAsset('powerGrid')}
            />
          )}
          {viewMode === 'campus' && activeAsset === 'sportsComplex' && (
            <CampusBeacon3D 
              position={[-55, 9.5, 10]}
              title="SPORTS COMPLEX"
              subtitle="ARENA · 750 LUX"
              color="#ff9f0a"
              onClick={() => setActiveAsset('sportsComplex')}
            />
          )}
          {viewMode === 'campus' && activeAsset === 'maintenance' && (
            <CampusBeacon3D 
              position={[55, 13.5, 10]}
              title="FACILITIES & OPERATIONS"
              subtitle="14 NODES · 1 ALERT"
              color="#ff453a"
              onClick={() => setActiveAsset('maintenance')}
            />
          )}
          
          {/* Left Wing Classroom (Primary Inspection Wing - Visible at all times) */}
          <JapaneseClassroom 
            position={[-12, -4.50, -2]} 
            setActiveAsset={setActiveAsset}
            activeAsset={activeAsset}
            showCoverage={showCoverage}
            isLeftWing={true}
            isDrillActive={isDrillActive}
            isClassroomView={viewMode === 'classroom'}
          />
          
          {/* Right Wing Classroom (Symmetrical Architectural Wing - Visible at all times) */}
          <JapaneseClassroom 
            position={[19.15, -4.50, -2]} 
            setActiveAsset={setActiveAsset}
            activeAsset={activeAsset}
            showCoverage={showCoverage}
            isLeftWing={false}
            isDrillActive={isDrillActive}
            isClassroomView={viewMode === 'classroom'}
          />
          
          <Environment preset="city" />
        </Suspense>
        
        <CameraControls ref={cameraControlsRef} makeDefault />
      </Canvas>
    </div>
  );
});

export default SceneViewer;

useGLTF.preload('/school.glb');
useGLTF.preload('/japanese_classroom.glb');
useGLTF.preload('/street_lamp.glb');
useGLTF.preload('/firefighter_vision_fire_extinguisher.glb');
Object.values(MODELS).forEach(path => useGLTF.preload(path));
