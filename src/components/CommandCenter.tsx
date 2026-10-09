import { useState } from 'react';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import SceneViewer from './SceneViewer';
import BottomBar from './BottomBar';

export default function CommandCenter() {
  const [viewMode, setViewMode] = useState<'campus' | 'classroom'>('campus');
  const [activeAsset, setActiveAsset] = useState<string | null>(null);
  const [nightMode, setNightMode] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);

  return (
    <div className={`command-center ${nightMode ? 'night-mode' : ''}`}>
      <SceneViewer viewMode={viewMode} setActiveAsset={setActiveAsset} nightMode={nightMode} lightsOn={lightsOn} />
      <Sidebar viewMode={viewMode} setViewMode={setViewMode} />
      <RightPanel activeAsset={activeAsset} lightsOn={lightsOn} />
      <BottomBar nightMode={nightMode} setNightMode={setNightMode} lightsOn={lightsOn} setLightsOn={setLightsOn} />
    </div>
  );
}
