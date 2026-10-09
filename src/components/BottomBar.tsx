import { Shield, Radio, Locate, Clock, Moon, Sun, Lightbulb, LightbulbOff } from 'lucide-react';

export default function BottomBar({ nightMode, setNightMode, lightsOn, setLightsOn }: any) {
  return (
    <div className="panel bottom-bar">
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary" onClick={() => setNightMode(!nightMode)}>
          {nightMode ? <Sun size={16} /> : <Moon size={16} />} 
          {nightMode ? 'Day Mode' : 'Night Mode'}
        </button>
        <button className={`btn ${lightsOn ? 'btn-primary' : ''}`} onClick={() => setLightsOn(!lightsOn)}>
          {lightsOn ? <Lightbulb size={16} /> : <LightbulbOff size={16} />}
          {lightsOn ? 'Lights: ON' : 'Lights: OFF'}
        </button>
        <button className="btn">
          <Locate size={16} /> Reset View
        </button>
        <button className="btn">
          <Radio size={16} /> Live Data
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
