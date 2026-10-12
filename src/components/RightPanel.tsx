import { useState } from 'react';
import { 
  Activity, Thermometer, Zap, AlertTriangle, Wind, BatteryCharging, 
  Lightbulb, Clock, Server, Network, Settings, Map, CheckCircle2, 
  Radio, ArrowRight, Sun, Users, Layers, ShieldCheck, Flame, RefreshCw
} from 'lucide-react';
import ExtinguisherPanel from './fireSafety/ExtinguisherPanel';
import type { FireExtinguisherDetails } from '../types/fireSafety';
import { initialExtinguisherData } from '../data/fireSafetyData';

interface RightPanelProps {
  activeAsset?: string | null;
  setActiveAsset?: (asset: string | null) => void;
  viewMode?: 'campus' | 'classroom';
  setViewMode?: (mode: 'campus' | 'classroom') => void;
  lightsOn?: boolean;
  setLightsOn?: (lights: boolean | ((prev: boolean) => boolean)) => void;
  fireSafetyData?: FireExtinguisherDetails;
  onUpdateFireSafetyData?: (updated: FireExtinguisherDetails) => void;
}

export default function RightPanel({ 
  activeAsset, 
  setActiveAsset = () => {},
  setViewMode = () => {},
  lightsOn = false, 
  setLightsOn = () => {},
  fireSafetyData = initialExtinguisherData, 
  onUpdateFireSafetyData = () => {} 
}: RightPanelProps) {
  // Local interactive states for senior engineering telemetry & controls
  const [selectedFloor, setSelectedFloor] = useState<'ground' | 'lvl2' | 'lvl3'>('ground');
  const [hvacMode, setHvacMode] = useState<'Auto AI' | 'Eco Chill' | 'Comfort Max' | 'Night Purge'>('Auto AI');
  const [fanSpeed, setFanSpeed] = useState<number>(84);
  const [courtLighting, setCourtLighting] = useState<'practice' | 'competition' | 'standby'>('competition');
  const [techDispatched, setTechDispatched] = useState(false);
  const [activeWorkOrder, setActiveWorkOrder] = useState<string | null>('WO-1049');
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticComplete, setDiagnosticComplete] = useState(false);

  const handleRunDiagnostic = () => {
    setDiagnosticRunning(true);
    setDiagnosticComplete(false);
    setTimeout(() => {
      setDiagnosticRunning(false);
      setDiagnosticComplete(true);
      setTimeout(() => setDiagnosticComplete(false), 4000);
    }, 1200);
  };

  // 1. Fire Extinguisher (Life Safety Inspection Panel)
  if (activeAsset === 'fireExtinguisher') {
    return (
      <ExtinguisherPanel 
        data={fireSafetyData} 
        onUpdateData={onUpdateFireSafetyData} 
      />
    );
  }

  // 2. Smoke Detector (Classroom Ceiling Sensor)
  if (activeAsset === 'smokeDetector') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(52, 199, 89, 0.3)' }}>
        <div className="panel-header">
          <Wind size={18} color="#34c759" />
          <span className="panel-title" style={{ color: '#34c759' }}>Ceiling Detector SD-101</span>
          <span className="fs-sidebar-chip" style={{ marginLeft: 'auto', color: '#34c759' }}>Active</span>
        </div>
        <div className="panel-content">
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Particulate Matter (PM2.5)</span>
              <Activity size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              12 <span className="telemetry-unit">µg/m³</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>Air Quality Index: Optimal</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Carbon Monoxide Level</span>
              <AlertTriangle size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.2rem' }}>
              0 PPM
            </div>
            <div className="telemetry-status">
              <div className="status-dot active" style={{ backgroundColor: '#34c759' }}></div>
              <span>No Hazardous Gas Detected</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Photoelectric Chamber</span>
              <BatteryCharging size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.1rem' }}>
              98% Health
            </div>
            <div className="telemetry-status" style={{ color: 'var(--text-muted)' }}>
              <div className="status-dot active"></div>
              <span>PoE Hardwired Primary · Battery Backup Ok</span>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px' }}
            onClick={() => setActiveAsset('fireExtinguisher')}
          >
            <Flame size={15} color="#ff453a" /> Inspect Classroom Fire Extinguisher
          </button>
        </div>
      </div>
    );
  }

  // 3. Main Academic Building
  if (activeAsset === 'mainBuilding') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(41, 151, 255, 0.3)' }}>
        <div className="panel-header">
          <Server size={18} color="var(--accent)" />
          <span className="panel-title">Main Academic Building</span>
          <span className="fs-sidebar-chip" style={{ marginLeft: 'auto', color: '#34c759' }}>Grade A</span>
        </div>
        <div className="panel-content">
          {/* Quick Classroom Fly-In Action */}
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(41, 151, 255, 0.15) 0%, rgba(41, 151, 255, 0.05) 100%)',
              border: '1px solid rgba(41, 151, 255, 0.3)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              setViewMode('classroom');
              setActiveAsset(null);
            }}
          >
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="var(--accent)" /> Enter Classroom 101
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Inspect interior safety beacons & egress path
              </div>
            </div>
            <div style={{ background: 'var(--accent)', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={14} color="#fff" />
            </div>
          </div>

          {/* Occupancy Card */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Occupancy & Space Utilization</span>
              <Users size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              842 <span className="telemetry-unit">/ 1,200</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', margin: '8px 0', overflow: 'hidden' }}>
              <div style={{ width: '70.1%', height: '100%', background: 'linear-gradient(90deg, #2997ff, #34c759)', borderRadius: '100px' }}></div>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>70.1% Density · Normal Capacity</span>
            </div>
          </div>

          {/* Floor Level Selector */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
              Select Floor Zone
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button 
                className={`btn ${selectedFloor === 'ground' ? 'btn-primary' : ''}`}
                style={{ padding: '6px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
                onClick={() => setSelectedFloor('ground')}
              >
                Ground (310)
              </button>
              <button 
                className={`btn ${selectedFloor === 'lvl2' ? 'btn-primary' : ''}`}
                style={{ padding: '6px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
                onClick={() => setSelectedFloor('lvl2')}
              >
                Level 2 (292)
              </button>
              <button 
                className={`btn ${selectedFloor === 'lvl3' ? 'btn-primary' : ''}`}
                style={{ padding: '6px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
                onClick={() => setSelectedFloor('lvl3')}
              >
                Level 3 (240)
              </button>
            </div>
          </div>

          {/* Subsystem Shortcuts */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Building Subsystems</span>
              <Settings size={16} className="icon-muted" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}
                onClick={() => setActiveAsset('hvac')}
              >
                <span style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={13} color="#34c759" /> HVAC Plant
                </span>
                <span className="fs-sidebar-chip" style={{ color: '#34c759' }}>6 AHUs Online</span>
              </div>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}
                onClick={() => setActiveAsset('powerGrid')}
              >
                <span style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Network size={13} color="#ffd60a" /> Main Substation
                </span>
                <span className="fs-sidebar-chip">1.2 MW Draw</span>
              </div>
            </div>
          </div>

          {/* Life Safety Compliance Card */}
          <div className="telemetry-card" style={{ borderColor: 'rgba(52, 199, 89, 0.25)' }}>
            <div className="telemetry-header">
              <span>Egress & Fire Safety Readiness</span>
              <ShieldCheck size={16} color="#34c759" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.1rem', color: '#34c759' }}>
              100% Compliant
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>All 8 Perimeter Fire Exits Operational</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. HVAC System
  if (activeAsset === 'hvac') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(52, 199, 89, 0.3)' }}>
        <div className="panel-header">
          <Activity size={18} color="#34c759" />
          <span className="panel-title">Central HVAC & Plant</span>
          <span className="fs-sidebar-chip" style={{ marginLeft: 'auto', color: '#34c759' }}>Nominal</span>
        </div>
        <div className="panel-content">
          {/* Temperature & Water Loop */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Chilled Water Supply / Return</span>
              <Thermometer size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              6.4°C <span className="telemetry-unit">/ 12.1°C</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>ΔT: 5.7°C · Loop Flow: 820 GPM</span>
            </div>
          </div>

          {/* Airflow Delivery & Fan VFD */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Total Airflow Delivery</span>
              <Wind size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              {Math.round(42800 * (fanSpeed / 84))} <span className="telemetry-unit">CFM</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>VFD Modulation: {fanSpeed}% · Static ΔP: 1.42" w.g.</span>
            </div>
          </div>

          {/* Interactive Mode Pills */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
              Operational Profile
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {(['Auto AI', 'Eco Chill', 'Comfort Max', 'Night Purge'] as const).map(mode => (
                <button
                  key={mode}
                  className={`btn ${hvacMode === mode ? 'btn-primary' : ''}`}
                  style={{ padding: '7px 8px', fontSize: '0.74rem', justifyContent: 'center' }}
                  onClick={() => setHvacMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Fan Speed Presets */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
              Fan Speed Preset ({fanSpeed}%)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              {[25, 50, 84, 100].map(speed => (
                <button
                  key={speed}
                  className={`btn ${fanSpeed === speed ? 'btn-primary' : ''}`}
                  style={{ padding: '6px 4px', fontSize: '0.72rem', justifyContent: 'center' }}
                  onClick={() => setFanSpeed(speed)}
                >
                  {speed === 84 ? 'Nominal' : `${speed}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Air Quality KPI */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Indoor Air Quality (IAQ)</span>
              <Activity size={16} className="icon-muted" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>412 PPM</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CO2 Average</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34c759' }}>8 µg/m³</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PM2.5 Clean</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Power Grid
  if (activeAsset === 'powerGrid') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(255, 214, 10, 0.3)' }}>
        <div className="panel-header">
          <Network size={18} color="#ffd60a" />
          <span className="panel-title">Campus Power Substation</span>
          <span className="fs-sidebar-chip" style={{ marginLeft: 'auto', color: '#ffd60a' }}>60.02 Hz</span>
        </div>
        <div className="panel-content">
          {/* Active Grid Load */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Active Total Campus Load</span>
              <Zap size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              2.41 <span className="telemetry-unit">MW</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', margin: '8px 0', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #ffd60a, #ff9f0a)', borderRadius: '100px' }}></div>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active" style={{ backgroundColor: '#ffd60a' }}></div>
              <span>75.3% Substation Capacity · Power Factor: 0.98</span>
            </div>
          </div>

          {/* Solar Array Infeed */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Photovoltaic Solar Infeed</span>
              <Sun size={16} color="#ffd60a" />
            </div>
            <div className="telemetry-value">
              480 <span className="telemetry-unit">kW</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active" style={{ backgroundColor: '#34c759' }}></div>
              <span>19.9% Clean Solar Offset · Inverters Sync</span>
            </div>
          </div>

          {/* Interactive Streetlight Master Control */}
          <div className="telemetry-card" style={{ borderColor: lightsOn ? 'rgba(255, 214, 10, 0.35)' : 'rgba(255, 255, 255, 0.08)' }}>
            <div className="telemetry-header">
              <span>Campus Lighting Circuit</span>
              <Lightbulb size={16} color={lightsOn ? '#ffd60a' : 'var(--text-muted)'} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                  {lightsOn ? 'Promenade Illuminated' : 'Circuit Standby'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {lightsOn ? '18 Smart Poles Drawing 2.16 kW' : 'Photocell daylight sensor idle'}
                </div>
              </div>
              <button 
                className={`btn ${lightsOn ? 'btn-primary' : ''}`}
                style={{ padding: '7px 12px', fontSize: '0.78rem' }}
                onClick={() => setLightsOn(prev => !prev)}
              >
                {lightsOn ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          </div>

          {/* Backup Generator Status */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Emergency Diesel Genset</span>
              <BatteryCharging size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.15rem' }}>
              100% Ready
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>2,000 Gallon Tank · Auto-Transfer Ready</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Sports Complex
  if (activeAsset === 'sportsComplex') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(255, 159, 10, 0.3)' }}>
        <div className="panel-header">
          <Server size={18} color="#ff9f0a" />
          <span className="panel-title">Sports Complex & Arena</span>
          <span className="fs-sidebar-chip" style={{ marginLeft: 'auto', color: '#ff9f0a' }}>Arena</span>
        </div>
        <div className="panel-content">
          {/* Microclimate Card */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Arena Court Microclimate</span>
              <Thermometer size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              20.8°C <span className="telemetry-unit">· 44% RH</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>Target: 21.0°C · Dehumidification Normal</span>
            </div>
          </div>

          {/* Court Lighting Level */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Court Lighting Illuminance</span>
              <Lightbulb size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              {courtLighting === 'competition' ? '1,000' : courtLighting === 'practice' ? '500' : '100'} <span className="telemetry-unit">Lux</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active" style={{ backgroundColor: '#34c759' }}></div>
              <span>Uniformity: 0.82 · NCAA Div-I Compliant</span>
            </div>
          </div>

          {/* Interactive Lighting Preset Buttons */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
              Court Lighting Preset
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                className={`btn ${courtLighting === 'practice' ? 'btn-primary' : ''}`}
                style={{ padding: '6px 6px', fontSize: '0.72rem', justifyContent: 'center' }}
                onClick={() => setCourtLighting('practice')}
              >
                Practice
              </button>
              <button
                className={`btn ${courtLighting === 'competition' ? 'btn-primary' : ''}`}
                style={{ padding: '6px 6px', fontSize: '0.72rem', justifyContent: 'center' }}
                onClick={() => setCourtLighting('competition')}
              >
                Match
              </button>
              <button
                className={`btn ${courtLighting === 'standby' ? 'btn-primary' : ''}`}
                style={{ padding: '6px 6px', fontSize: '0.72rem', justifyContent: 'center' }}
                onClick={() => setCourtLighting('standby')}
              >
                Eco
              </button>
            </div>
          </div>

          {/* Spectator Occupancy */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Arena Capacity</span>
              <Users size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              240 <span className="telemetry-unit">/ 600</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>Event: Varsity Basketball Practice</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. Maintenance Nodes
  if (activeAsset === 'maintenance') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(255, 69, 58, 0.3)' }}>
        <div className="panel-header">
          <Settings size={18} color="#ff453a" />
          <span className="panel-title">Facilities & IoT Nodes</span>
          <span className="fs-sidebar-chip" style={{ marginLeft: 'auto', color: '#ff9f0a' }}>1 Alert</span>
        </div>
        <div className="panel-content">
          {/* LoRaWAN Mesh Status */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>LoRaWAN Mesh Telemetry</span>
              <Radio size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              14 / 14 <span className="telemetry-unit">Nodes</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>99.8% Packet Delivery · Average Battery: 96.4%</span>
            </div>
          </div>

          {/* Priority Alert Card */}
          <div className="telemetry-card" style={{ borderColor: 'rgba(255, 159, 10, 0.35)', background: 'rgba(255, 159, 10, 0.05)' }}>
            <div className="telemetry-header">
              <span>Active Facility Alert</span>
              <AlertTriangle size={16} color="#ff9f0a" />
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ff9f0a', marginTop: '2px' }}>
              AHU-2 Filter Differential Pressure High
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Pressure drop exceeds 0.38" w.g. Recommended replacement within 48h.
            </div>

            {/* Interactive Dispatch Button */}
            <button 
              className={`btn ${techDispatched ? '' : 'btn-primary'}`}
              style={{ 
                width: '100%', 
                marginTop: '10px', 
                justifyContent: 'center',
                backgroundColor: techDispatched ? 'rgba(52, 199, 89, 0.2)' : undefined,
                color: techDispatched ? '#34c759' : undefined,
                borderColor: techDispatched ? 'rgba(52, 199, 89, 0.4)' : undefined
              }}
              onClick={() => setTechDispatched(true)}
            >
              {techDispatched ? (
                <>
                  <CheckCircle2 size={15} color="#34c759" /> Tech #904 Dispatched (ETA 6m)
                </>
              ) : (
                <>
                  <WrenchIcon size={14} /> Dispatch Field Technician
                </>
              )}
            </button>
          </div>

          {/* Work Orders List */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
              Open Work Orders
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'WO-1049', title: 'Replace AHU-2 HEPA Filter', priority: 'High', status: techDispatched ? 'Dispatched' : 'Pending' },
                { id: 'WO-1048', title: 'Chiller Loop Water Quality Test', priority: 'Medium', status: 'In Progress' },
                { id: 'WO-1047', title: 'West Quad Lamp Fixture LED', priority: 'Low', status: 'Resolved' }
              ].map(wo => (
                <div 
                  key={wo.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: activeWorkOrder === wo.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${activeWorkOrder === wo.id ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => setActiveWorkOrder(wo.id)}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>
                      {wo.id}: {wo.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Priority: {wo.priority}
                    </div>
                  </div>
                  <span 
                    className="fs-sidebar-chip"
                    style={{ 
                      color: wo.status === 'Resolved' ? '#34c759' : wo.status === 'Dispatched' ? '#34c759' : '#ff9f0a' 
                    }}
                  >
                    {wo.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 8. Street Light Node
  if (activeAsset === 'streetlight') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(255, 214, 10, 0.3)' }}>
        <div className="panel-header">
          <Lightbulb size={18} color="#ffd60a" />
          <span className="panel-title" style={{ color: '#ffd60a' }}>Promenade Smart Pole</span>
          <span className="fs-sidebar-chip" style={{ marginLeft: 'auto', color: lightsOn ? '#ffd60a' : 'gray' }}>
            {lightsOn ? 'Active' : 'Standby'}
          </span>
        </div>
        <div className="panel-content">
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Power Draw</span>
              <Zap size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              {lightsOn ? '120' : '0'} <span className="telemetry-unit">W</span>
            </div>
            <div className="telemetry-status">
              <div className={`status-dot ${lightsOn ? 'active' : ''}`} style={{ backgroundColor: lightsOn ? '#ffd60a' : 'gray' }}></div>
              <span>{lightsOn ? 'Active Load · 0.98 PF' : 'Standby Circuit'}</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Luminance Output</span>
              <Activity size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.2rem' }}>
              {lightsOn ? '850' : '0'} <span className="telemetry-unit">lm</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active" style={{ backgroundColor: '#34c759' }}></div>
              <span>Optical Uniformity 92%</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>LED Array Lifespan</span>
              <Clock size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.1rem' }}>
              92% Remaining
            </div>
            <div className="telemetry-status" style={{ color: 'var(--text-muted)' }}>
              <div className="status-dot active"></div>
              <span>Estimated 14 months MTBF</span>
            </div>
          </div>

          <button 
            className={`btn ${lightsOn ? 'btn-primary' : ''}`}
            style={{ width: '100%', marginTop: '6px' }}
            onClick={() => setLightsOn(prev => !prev)}
          >
            <Lightbulb size={15} /> Toggle Smart Lamp ({lightsOn ? 'Turn OFF' : 'Turn ON'})
          </button>
        </div>
      </div>
    );
  }

  // 9. Default: Campus Master Overview
  return (
    <div className="panel right-panel">
      <div className="panel-header">
        <Map size={18} color="var(--accent)" />
        <span className="panel-title">Campus Master Telemetry</span>
        <span className="fs-sidebar-chip" style={{ marginLeft: 'auto', color: '#34c759' }}>Online</span>
      </div>
      <div className="panel-content">
        {/* Total Power Load */}
        <div className="telemetry-card" style={{ cursor: 'pointer' }} onClick={() => setActiveAsset('powerGrid')}>
          <div className="telemetry-header">
            <span>Grid Power Load</span>
            <Zap size={16} color="#ffd60a" />
          </div>
          <div className="telemetry-value">
            2.41 <span className="telemetry-unit">MW</span>
          </div>
          <div className="telemetry-status">
            <div className="status-dot active" style={{ backgroundColor: '#ffd60a' }}></div>
            <span>Nominal Load · 480 kW Solar Offset</span>
          </div>
        </div>

        {/* Average Campus Climate */}
        <div className="telemetry-card" style={{ cursor: 'pointer' }} onClick={() => setActiveAsset('hvac')}>
          <div className="telemetry-header">
            <span>Average Campus Temp</span>
            <Thermometer size={16} color="#34c759" />
          </div>
          <div className="telemetry-value">
            22.4 <span className="telemetry-unit">°C</span>
          </div>
          <div className="telemetry-status">
            <div className="status-dot active"></div>
            <span>Central HVAC Plant Optimal · 6 AHUs</span>
          </div>
        </div>

        {/* Aggregate Occupancy */}
        <div className="telemetry-card" style={{ cursor: 'pointer' }} onClick={() => setActiveAsset('mainBuilding')}>
          <div className="telemetry-header">
            <span>Aggregate Occupancy</span>
            <Users size={16} color="var(--accent)" />
          </div>
          <div className="telemetry-value">
            1,082 <span className="telemetry-unit">/ 1,800</span>
          </div>
          <div className="telemetry-status">
            <div className="status-dot active"></div>
            <span>Main Academic: 842 · Arena: 240</span>
          </div>
        </div>

        {/* System Alerts */}
        <div className="telemetry-card" style={{ borderColor: 'rgba(255, 159, 10, 0.3)', cursor: 'pointer' }} onClick={() => setActiveAsset('maintenance')}>
          <div className="telemetry-header">
            <span>Active Operations Alert</span>
            <AlertTriangle size={16} color="#ff9f0a" />
          </div>
          <div className="telemetry-value" style={{ color: '#ff9f0a', fontSize: '1.2rem' }}>
            1 Maintenance Ticket
          </div>
          <div className="telemetry-status" style={{ color: 'var(--text-muted)' }}>
            <div className="status-dot warning"></div>
            <span>AHU-2 Filter Replacement Scheduled</span>
          </div>
        </div>

        {/* Interactive Diagnostic Action */}
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '4px', justifyContent: 'center' }}
          onClick={handleRunDiagnostic}
          disabled={diagnosticRunning}
        >
          {diagnosticRunning ? (
            <>
              <RefreshCw size={15} className="spin-slow" /> Running Subsystem Scan...
            </>
          ) : diagnosticComplete ? (
            <>
              <CheckCircle2 size={15} color="#34c759" /> All 5 Subsystems Verified
            </>
          ) : (
            <>
              <Activity size={15} /> Run Campus Fleet Diagnostics
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function WrenchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
