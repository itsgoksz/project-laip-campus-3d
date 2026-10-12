import { Shield, Locate, Clock, Moon, Sun, Lightbulb, LightbulbOff, ShieldAlert, Video } from 'lucide-react';

export default function BottomBar({ 
  nightMode, 
  setNightMode, 
  lightsOn, 
  setLightsOn,
  onResetView,
  showCoverage,
  setShowCoverage,
  isDrillActive,
  onToggleDrill,
  showSecurityPip,
  setShowSecurityPip
}: any) {
  return (
    <div className="panel bottom-bar">
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => setNightMode(!nightMode)}>
          {nightMode ? <Sun size={16} /> : <Moon size={16} />} 
          {nightMode ? 'Day Mode' : 'Night Mode'}
        </button>
        <button className={`btn ${lightsOn ? 'btn-primary' : ''}`} onClick={() => setLightsOn(!lightsOn)}>
          {lightsOn ? <Lightbulb size={16} /> : <LightbulbOff size={16} />}
          {lightsOn ? 'Lights: ON' : 'Lights: OFF'}
        </button>
        <button 
          className={`btn ${showCoverage ? 'btn-primary' : ''}`}
          onClick={() => setShowCoverage(!showCoverage)}
          title="Toggle NFPA 10 Travel Coverage Zones"
        >
          <Shield size={16} /> {showCoverage ? 'Coverage: ON' : 'Coverage: OFF'}
        </button>
        <button 
          className={`btn ${showSecurityPip ? 'btn-primary' : ''}`}
          onClick={() => setShowSecurityPip(!showSecurityPip)}
          title="Toggle Smart Drone & CCTV Security PiP Feed"
        >
          <Video size={16} /> {showSecurityPip ? 'Surveillance: ON' : 'Security Feeds'}
        </button>
        <button 
          className={`btn ${isDrillActive ? 'fs-btn-drill-active' : 'fs-btn-drill'}`} 
          onClick={onToggleDrill}
          title="Simulate Campus Emergency Fire Evacuation Drill"
        >
          <ShieldAlert size={16} color={isDrillActive ? '#fff' : '#ff453a'} /> 
          {isDrillActive ? 'Drill Active' : 'Run Drill'}
        </button>
        <button className="btn" onClick={onResetView}>
          <Locate size={16} /> Reset View
        </button>
      </div>
      <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="#34c759" />
          <span>System Secure</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} />
          <span>Sync: Just now</span>
        </div>
      </div>
    </div>
  );
}
