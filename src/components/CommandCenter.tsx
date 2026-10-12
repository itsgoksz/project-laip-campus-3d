import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import SceneViewer from './SceneViewer';
import BottomBar from './BottomBar';
import DrillController from './fireSafety/DrillController';
import SecurityCameraPip from './security/SecurityCameraPip';
import { CAMERAS } from './security/SurveillancePins3D';
import { initialExtinguisherData } from '../data/fireSafetyData';
import type { FireExtinguisherDetails, InspectionRecord } from '../types/fireSafety';

export default function CommandCenter() {
  const [viewMode, setViewMode] = useState<'campus' | 'classroom'>('campus');
  const [activeAsset, setActiveAsset] = useState<string | null>(null);
  const [nightMode, setNightMode] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [fireSafetyData, setFireSafetyData] = useState<FireExtinguisherDetails>(initialExtinguisherData);
  const [showCoverage, setShowCoverage] = useState(true);
  const [isDrillActive, setIsDrillActive] = useState(false);
  const [drillSeconds, setDrillSeconds] = useState(0);

  // Smart Security Surveillance PiP State (Only activated in Security Feeds mode)
  const [showSecurityPip, setShowSecurityPip] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState('drone-01');
  const [cameraFlyOverride, setCameraFlyOverride] = useState<any>(null);

  const handleSyncCameraView = (camId: string) => {
    const cam = CAMERAS.find(c => c.id === camId);
    if (!cam) return;
    if (cam.id === 'cam-04') {
      setViewMode('classroom');
      setActiveAsset(null);
    } else {
      setViewMode('campus');
      setActiveAsset(null);
    }
    setCameraFlyOverride({
      position: cam.cameraLookAt.position,
      target: cam.cameraLookAt.target,
      timestamp: Date.now()
    });
  };

  // Zero-lag 1-second interval timer that only runs during active drill
  useEffect(() => {
    let interval: any = null;
    if (isDrillActive) {
      interval = setInterval(() => {
        setDrillSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setDrillSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDrillActive]);

  const handleToggleDrill = () => {
    if (!isDrillActive) {
      setIsDrillActive(true);
      setViewMode('classroom'); // Fly directly to classroom inspection zone
    } else {
      setIsDrillActive(false);
    }
  };

  const handleCompleteDrill = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const drillRecord: InspectionRecord = {
      id: `drill-${Date.now()}`,
      date: formattedDate,
      timestamp: formattedTime,
      inspector: 'Campus Life Safety Command (Evacuation Drill Team)',
      type: 'Evacuation Drill',
      status: 'Passed',
      notes: `Annual Campus Evacuation Drill successfully completed in ${drillSeconds} seconds (< 90s benchmark). All exit paths, beacons, and egress corridors cleared and verified.`,
      checklist: {
        pressureGaugeOk: true,
        tamperSealIntact: true,
        noCorrosionOrDamage: true,
        mountingAndSignageOk: true,
        nozzleClear: true,
      },
    };

    setFireSafetyData(prev => ({
      ...prev,
      complianceStatus: 'Compliant',
      lastInspectedDate: formattedDate,
      lastInspectedDaysAgo: 0,
      inspectionDueInDays: 30,
      history: [drillRecord, ...prev.history],
    }));

    setIsDrillActive(false);
    setActiveAsset('fireExtinguisher');
  };

  return (
    <div className={`command-center ${nightMode ? 'night-mode' : ''} ${isDrillActive ? 'drill-mode-active' : ''}`}>
      {/* Emergency Evacuation Simulation Banner */}
      <DrillController 
        isActive={isDrillActive}
        elapsedSeconds={drillSeconds}
        onCompleteDrill={handleCompleteDrill}
        onCancelDrill={() => setIsDrillActive(false)}
      />

      <SceneViewer 
        viewMode={viewMode} 
        activeAsset={activeAsset}
        setActiveAsset={setActiveAsset} 
        nightMode={nightMode} 
        lightsOn={lightsOn} 
        showCoverage={showCoverage}
        isDrillActive={isDrillActive}
        activeCameraId={activeCameraId}
        setActiveCameraId={setActiveCameraId}
        showSecurityPip={showSecurityPip}
        cameraFlyOverride={cameraFlyOverride}
      />
      <Sidebar 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        activeAsset={activeAsset} 
        setActiveAsset={setActiveAsset}
        complianceStatus={fireSafetyData.complianceStatus}
      />
      <RightPanel 
        activeAsset={activeAsset} 
        setActiveAsset={setActiveAsset}
        viewMode={viewMode}
        setViewMode={setViewMode}
        lightsOn={lightsOn} 
        setLightsOn={setLightsOn}
        fireSafetyData={fireSafetyData}
        onUpdateFireSafetyData={setFireSafetyData}
      />
      <BottomBar 
        nightMode={nightMode} 
        setNightMode={setNightMode} 
        lightsOn={lightsOn} 
        setLightsOn={setLightsOn} 
        onResetView={() => {
          setActiveAsset(null);
          setViewMode('campus');
          setShowSecurityPip(false);
          setCameraFlyOverride(null);
        }}
        showCoverage={showCoverage}
        setShowCoverage={setShowCoverage}
        isDrillActive={isDrillActive}
        onToggleDrill={handleToggleDrill}
        showSecurityPip={showSecurityPip}
        setShowSecurityPip={setShowSecurityPip}
      />

      {/* Picture-in-Picture Smart Security & Drone Surveillance HUD */}
      <SecurityCameraPip 
        isOpen={showSecurityPip}
        onClose={() => setShowSecurityPip(false)}
        activeCameraId={activeCameraId}
        onSelectCamera={setActiveCameraId}
        onSyncCameraView={handleSyncCameraView}
      />
    </div>
  );
}
