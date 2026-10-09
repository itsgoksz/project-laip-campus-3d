import { Canvas } from '@react-three/fiber';
import { CameraControls, Environment, useGLTF, Clone, Instances, Instance, MeshDistortMaterial, Sky, Stars } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState, useMemo } from 'react';

// --- (SchoolModel and other specific models remain the same) ---
function SchoolModel() {
  const { scene } = useGLTF('/school.glb');
  return <primitive object={scene} scale={1} />;
}

// 1. PERFORMANCE: Instanced Trees
// We compute all tree positions once, then render them in a single draw call.
function TreeInstances() {
  const treeData = useMemo(() => {
    const data: any[] = [];
    // Main Promenade (Organic clustering)
    [-14, -10, 10, 14].forEach(x => {
      for (let z = 10; z <= 90; z += 8) {
        if (Math.random() > 0.2) {
          data.push({
            position: [x + (Math.random() - 0.5) * 3, -4.5, z + (Math.random() - 0.5) * 3],
            scale: 0.8 + Math.random() * 0.6,
            rot: Math.random() * Math.PI
          });
        }
      }
    });
    // Back Quad (Organic clustering)
    [-14, -10, 10, 14].forEach(x => {
      for (let z = -80; z <= -10; z += 8) {
        if (Math.random() > 0.2) {
          data.push({
            position: [x + (Math.random() - 0.5) * 3, -4.5, z + (Math.random() - 0.5) * 3],
            scale: 0.8 + Math.random() * 0.6,
            rot: Math.random() * Math.PI
          });
        }
      }
    });
    // Cross Paths
    [50, 75, -50].forEach(z => {
      for (let x = -60; x <= 60; x += 10) {
        if (Math.abs(x) < 20) continue; // Skip center promenade
        if (Math.random() > 0.3) {
          data.push({
            position: [x + (Math.random() - 0.5) * 4, -4.5, z + 8 + (Math.random() - 0.5) * 4],
            scale: 0.8 + Math.random() * 0.6,
            rot: Math.random() * Math.PI
          });
        }
      }
    });
    // Residential Area (East)
    for(let i=0; i<15; i++) {
       data.push({
         position: [50 + Math.random() * 40, -4.5, Math.random() * 80 - 40],
         scale: 0.9 + Math.random() * 0.5,
         rot: Math.random() * Math.PI
       });
    }
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

function StreetLamp({ position, rotation = [0,0,0], lightsOn, onClick }: any) {
  const { scene } = useGLTF('/street_lamp.glb') as any;
  const [hovered, setHover] = useState(false);
  const groupRef = useRef<any>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Target the internal bulb mesh/material
        if (child.material.name.toLowerCase().includes('bulb') || child.name.toLowerCase().includes('bulb')) {
          child.material = child.material.clone();
          if (lightsOn) {
            child.material.emissive.set('#ffebb5');
            child.material.emissiveIntensity = 5;
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
      {/* Actual light emitted from the bulb height */}
      {lightsOn && (
        <pointLight position={[0, 3.5, 0]} intensity={2} distance={15} color="#ffebb5" />
      )}
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

function CampusAsset({ type, position, rotation = [0,0,0], scale = 1 }: any) {
  const path = MODELS[type as keyof typeof MODELS];
  const { scene } = useGLTF(path) as any;
  const groupRef = useRef<any>(null);

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
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
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
      
      {/* 1. FRONT QUAD ZONING */}
      <mesh position={[0, -4.48, 50]}>
        <boxGeometry args={[110, 0.05, 90]} />
        <meshStandardMaterial color="#101f16" />
      </mesh>

      {/* 2. BACK ACADEMIC QUAD ZONING */}
      <mesh position={[0, -4.48, -50]}>
        <boxGeometry args={[140, 0.05, 80]} />
        <meshStandardMaterial color="#101f16" />
      </mesh>
      
      {/* 3. LIBRARY PLAZA (Circular Concrete Hub) */}
      <mesh position={[0, -4.47, -40]}>
        <cylinderGeometry args={[25, 25, 0.05, 64]} />
        <meshStandardMaterial color="#171b24" />
      </mesh>

      {/* 4. ATHLETICS SECTOR (Terracotta Base) */}
      <mesh position={[-75, -4.49, 10]}>
        <boxGeometry args={[60, 0.05, 80]} />
        <meshStandardMaterial color="#3a1e1e" roughness={0.9} />
      </mesh>

      {/* Main Promenade Path */}
      <mesh position={[0, -4.45, 45]}>
        <boxGeometry args={[16, 0.1, 90]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      
      {/* Cross Paths in the Front Quad */}
      <mesh position={[0, -4.45, 50]}>
        <boxGeometry args={[110, 0.1, 10]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[0, -4.45, 75]}>
        <boxGeometry args={[110, 0.1, 10]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>

      {/* DESIRE PATHS (Diagonal Shortcuts) */}
      {/* From Fountain to Front Left/Right Corners */}
      <mesh position={[-22.5, -4.45, 50]} rotation={[0, Math.atan2(-50, 45), 0]}>
        <boxGeometry args={[6, 0.1, 68]} />
        <meshStandardMaterial color="#11151c" />
      </mesh>
      <mesh position={[22.5, -4.45, 50]} rotation={[0, Math.atan2(50, 45), 0]}>
        <boxGeometry args={[6, 0.1, 68]} />
        <meshStandardMaterial color="#11151c" />
      </mesh>
      
      {/* Walkways connecting left and right wings of main building */}
      <mesh position={[-30, -4.45, 10]}>
        <boxGeometry args={[60, 0.1, 8]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[30, -4.45, 10]}>
        <boxGeometry args={[60, 0.1, 8]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>

      {/* Back Academic Quad Paths */}
      <mesh position={[0, -4.45, -50]}>
        <boxGeometry args={[16, 0.1, 80]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[0, -4.45, -50]}>
        <boxGeometry args={[140, 0.1, 10]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>

      {/* East & West Arterial Roads */}
      <mesh position={[-100, -4.45, 0]}>
        <boxGeometry args={[16, 0.1, 350]} />
        <meshStandardMaterial color="#0c0e14" />
      </mesh>
      <mesh position={[100, -4.45, 0]}>
        <boxGeometry args={[16, 0.1, 350]} />
        <meshStandardMaterial color="#0c0e14" />
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

      {/* ---- CAMPUS BUILDINGS ---- */}

      {/* 1. FRONT QUAD (Open area) */}
      {/* (Buildings moved to back quad) */}

      {/* 2. BACK QUAD (Library & Academics) */}
      <CampusAsset type="library" position={[0, -12, -55]} rotation={[0, 0, 0]} scale={3.5} />
      {/* College buildings flanking the Library */}
      <CampusAsset type="college" position={[-45, -4.6, -55]} rotation={[0, Math.PI / 2, 0]} scale={2.5} />
      <CampusAsset type="college" position={[45, -4.6, -55]} rotation={[0, -Math.PI / 2, 0]} scale={2.5} />

      {/* 3. EAST RESIDENTIAL SECTOR */}
      <CampusAsset type="apartment" position={[55, -4.6, 10]} rotation={[0, -Math.PI / 2, 0]} scale={2.5} />

      {/* 4. WEST ATHLETICS SECTOR */}
      <CampusAsset type="basketball" position={[-55, -4.6, 10]} rotation={[0, Math.PI / 2, 0]} scale={1.2} />

      {/* Central Reflection Pool / Fountain */}
      <group position={[0, -4.4, 25]}>
        <mesh>
          <cylinderGeometry args={[10, 10, 0.2, 64]} />
          <meshStandardMaterial color="#141923" />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[9.5, 9.5, 0.1, 64]} />
          {/* Liveliness: Animated GPU Water Shader */}
          <MeshDistortMaterial 
            color="#3a6b8c" 
            roughness={0.1} 
            metalness={0.8} 
            distort={0.15} 
            speed={2} 
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

function JapaneseClassroom({ position, setActiveAsset }: { position: [number, number, number], setActiveAsset: any }) {
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
      {/* Fire Extinguisher mounted on the wall near the chalkboard */}
      <FireExtinguisher 
        position={[-1.5, 1.75, -7.8]} 
        scale={0.022} 
        onClick={() => setActiveAsset('fireExtinguisher')} 
      />
      {/* Smoke Detector mounted on the ceiling */}
      <SmokeDetector 
        position={[-6, 2.85, -4]} 
        onClick={() => setActiveAsset('smokeDetector')} 
      />
    </group>
  );
}

export default function SceneViewer({ viewMode = 'campus', setActiveAsset, nightMode, lightsOn }: any) {
  const cameraControlsRef = useRef<any>(null);

  useEffect(() => {
    if (!cameraControlsRef.current) return;
    const cc = cameraControlsRef.current;
    
    if (viewMode === 'campus') {
      // Cinematic fly-out to exterior
      cc.setLookAt(
        -30, 20, 60, // Camera Position
        0, 0, 0,     // Target Position
        true         // Animate transition
      );
    } else {
      // Cinematic fly-in to interior (Left Classroom)
      cc.setLookAt(
        -12, -2.5, 4,  // Camera Position
        -12, -3.5, -3, // Target Position
        true           // Animate transition
      );
    }
  }, [viewMode]);

  return (
    <div className="scene-container">
      <Canvas camera={{ fov: 45 }} onPointerMissed={() => setActiveAsset(null)}>
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
          <SchoolModel />
          <CampusGrounds lightsOn={lightsOn} setActiveAsset={setActiveAsset} />
          
          {/* Left Wing Classroom */}
          <JapaneseClassroom position={[-12, -4.50, -2]} setActiveAsset={setActiveAsset} />
          
          {/* Right Wing Classroom (Symmetrical) */}
          {/* Mathematical offset calculation: 19.15 perfectly mirrors the -12 left-side placement 
              accounting for the GLTF model's internal asymmetrical center offset. */}
          <JapaneseClassroom position={[19.15, -4.50, -2]} setActiveAsset={setActiveAsset} />
          
          <Environment preset="city" />
        </Suspense>
        
        <CameraControls ref={cameraControlsRef} makeDefault />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/school.glb');
useGLTF.preload('/japanese_classroom.glb');
Object.values(MODELS).forEach(path => useGLTF.preload(path));
