import { Activity, Thermometer, Zap, AlertTriangle, ShieldCheck, Flame, Info, Wind, BatteryCharging, Lightbulb, Clock } from 'lucide-react';

export default function RightPanel({ activeAsset, lightsOn }: { activeAsset?: string | null, lightsOn?: boolean }) {
  // If Fire Extinguisher is selected, show Fire Safety telemetry
  if (activeAsset === 'fireExtinguisher') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(255, 59, 48, 0.3)' }}>
        <div className="panel-header">
          <Flame size={18} color="#ff3b30" />
          <span className="panel-title" style={{ color: '#ff3b30' }}>Fire Safety System</span>
        </div>
        <div className="panel-content">
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Tank Pressure</span>
              <Info size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              1.2 <span className="telemetry-unit">MPa</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>Pressure Optimal</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Extinguisher Status</span>
              <ShieldCheck size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.2rem' }}>
              Ready for Use
            </div>
            <div className="telemetry-status">
              <div className="status-dot active" style={{ backgroundColor: '#34c759' }}></div>
              <span>Pin Intact</span>
            </div>
          </div>

          <div className="telemetry-card" style={{ borderColor: 'rgba(255, 159, 10, 0.3)' }}>
            <div className="telemetry-header">
              <span>Last Inspected</span>
              <AlertTriangle size={16} color="#ff9f0a" />
            </div>
            <div className="telemetry-value" style={{ color: '#ff9f0a', fontSize: '1.1rem' }}>
              14 Days Ago
            </div>
            <div className="telemetry-status" style={{ color: 'var(--text-muted)' }}>
              <div className="status-dot warning"></div>
              <span>Inspection due in 16 days</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If Smoke Detector is selected, show Air Quality / Smoke telemetry
  if (activeAsset === 'smokeDetector') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(52, 199, 89, 0.3)' }}>
        <div className="panel-header">
          <Wind size={18} color="#34c759" />
          <span className="panel-title" style={{ color: '#34c759' }}>Ceiling Detector</span>
        </div>
        <div className="panel-content">
          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Particulate Matter</span>
              <Activity size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value">
              12 <span className="telemetry-unit">µg/m³</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active"></div>
              <span>Air Quality Good</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>CO Level</span>
              <AlertTriangle size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.2rem' }}>
              0 PPM
            </div>
            <div className="telemetry-status">
              <div className="status-dot active" style={{ backgroundColor: '#34c759' }}></div>
              <span>No Carbon Monoxide</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Battery Status</span>
              <BatteryCharging size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.1rem' }}>
              98%
            </div>
            <div className="telemetry-status" style={{ color: 'var(--text-muted)' }}>
              <div className="status-dot active"></div>
              <span>Wired power active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If Street Light is selected, show Street Light telemetry
  if (activeAsset === 'streetlight') {
    return (
      <div className="panel right-panel" style={{ borderColor: 'rgba(255, 214, 10, 0.3)' }}>
        <div className="panel-header">
          <Lightbulb size={18} color="#ffd60a" />
          <span className="panel-title" style={{ color: '#ffd60a' }}>Street Light Node</span>
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
              <span>{lightsOn ? 'Active Load' : 'Standby'}</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Luminance Level</span>
              <Activity size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.2rem' }}>
              {lightsOn ? '850' : '0'} <span className="telemetry-unit">lm</span>
            </div>
            <div className="telemetry-status">
              <div className="status-dot active" style={{ backgroundColor: '#34c759' }}></div>
              <span>Optimal Output</span>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span>Bulb Lifespan</span>
              <Clock size={16} className="icon-muted" />
            </div>
            <div className="telemetry-value" style={{ fontSize: '1.1rem' }}>
              92%
            </div>
            <div className="telemetry-status" style={{ color: 'var(--text-muted)' }}>
              <div className="status-dot active"></div>
              <span>Estimated 14mo remaining</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Campus Telemetry
  return (
    <div className="panel right-panel">
      <div className="panel-header">
        <Activity size={18} color="var(--text-main)" />
        <span className="panel-title">Telemetry</span>
      </div>
      <div className="panel-content">
        <div className="telemetry-card">
          <div className="telemetry-header">
            <span>Grid Power Load</span>
            <Zap size={16} className="icon-muted" />
          </div>
          <div className="telemetry-value">
            2.4 <span className="telemetry-unit">MW</span>
          </div>
          <div className="telemetry-status">
            <div className="status-dot active"></div>
            <span>Nominal Load</span>
          </div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-header">
            <span>Average Temp</span>
            <Thermometer size={16} className="icon-muted" />
          </div>
          <div className="telemetry-value">
            22.4 <span className="telemetry-unit">°C</span>
          </div>
          <div className="telemetry-status">
            <div className="status-dot active"></div>
            <span>HVAC Optimal</span>
          </div>
        </div>

        <div className="telemetry-card" style={{ borderColor: 'rgba(255, 159, 10, 0.3)' }}>
          <div className="telemetry-header">
            <span>System Alerts</span>
            <AlertTriangle size={16} color="#ff9f0a" />
          </div>
          <div className="telemetry-value" style={{ color: '#ff9f0a', fontSize: '1.4rem' }}>
            Warning
          </div>
          <div className="telemetry-status" style={{ color: 'var(--text-muted)' }}>
            <div className="status-dot warning"></div>
            <span>Maintenance near West Wing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
