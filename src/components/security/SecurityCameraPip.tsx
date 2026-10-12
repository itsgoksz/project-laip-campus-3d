import { useState, useEffect } from 'react';
import { 
  Video, Maximize2, Minimize2, X, Compass, Crosshair, 
  Battery, Eye, Moon, Flame, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Radio, Navigation
} from 'lucide-react';
import { CAMERAS } from './SurveillancePins3D';

interface SecurityCameraPipProps {
  isOpen: boolean;
  onClose: () => void;
  activeCameraId: string;
  onSelectCamera: (camId: string) => void;
  onSyncCameraView: (camId: string) => void;
}

export default function SecurityCameraPip({
  isOpen,
  onClose,
  activeCameraId,
  onSelectCamera,
  onSyncCameraView,
}: SecurityCameraPipProps) {
  const [visionMode, setVisionMode] = useState<'optical' | 'thermal' | 'night'>('optical');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTime, setCurrentTime] = useState('');

  // Live military precision timestamp (UTC)
  useEffect(() => {
    if (!isOpen) return;
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentTime(iso);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCam = CAMERAS.find(c => c.id === activeCameraId) || CAMERAS[0];
  const isDrone = currentCam.id === 'drone-01';

  // Quick PTZ Handlers
  const handlePan = (dx: number, dy: number) => {
    setPanOffset(prev => ({
      x: Math.max(-40, Math.min(40, prev.x + dx)),
      y: Math.max(-30, Math.min(30, prev.y + dy))
    }));
  };

  const handleZoom = (dz: number) => {
    setZoomLevel(prev => Math.max(1, Math.min(3, +(prev + dz).toFixed(1))));
  };

  const handleResetPtz = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div 
        className="pip-minimized-pill"
        onClick={() => setIsMinimized(false)}
        title="Click to expand Security PiP feed"
      >
        <div className="pip-rec-dot"></div>
        <Video size={13} color="#2997ff" />
        <span className="pip-pill-name">{currentCam.name}</span>
        <span className="pip-pill-divider">·</span>
        <span className="pip-pill-status">LIVE 60 FPS</span>
        {isDrone && (
          <span className="pip-pill-sub" style={{ color: '#34c759' }}>88% BAT</span>
        )}
      </div>
    );
  }

  return (
    <div className={`panel pip-container ${isExpanded ? 'pip-expanded' : ''}`}>
      {/* Top Header Bar */}
      <div className="pip-header">
        <div className="pip-title-wrap">
          <div className="pip-rec-dot"></div>
          <Radio size={14} color="#2997ff" />
          <span className="pip-title">{currentCam.name}</span>
          <span className="pip-badge">{currentCam.resolution}</span>
        </div>
        <div className="pip-header-actions">
          <button 
            className="pip-action-btn" 
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Normal Size' : 'Expand Feed'}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button 
            className="pip-action-btn" 
            onClick={() => setIsMinimized(true)}
            title="Minimize to Floating Pill"
          >
            <ChevronDown size={13} />
          </button>
          <button 
            className="pip-action-btn" 
            onClick={onClose}
            title="Close PiP Feed"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Camera Selection Tab Strip */}
      <div className="pip-tabs">
        {CAMERAS.map((cam) => (
          <button
            key={cam.id}
            className={`pip-tab ${activeCameraId === cam.id ? 'active' : ''}`}
            onClick={() => {
              onSelectCamera(cam.id);
              handleResetPtz();
            }}
          >
            {cam.id === 'drone-01' ? '🛸 DRONE-01' : cam.name.replace('CAM-', 'CAM ')}
          </button>
        ))}
      </div>

      {/* Live Video Feed Simulation Viewport */}
      <div className={`pip-viewport vision-${visionMode}`}>
        {/* Pan-Tilt-Zoom Simulated Transform Container */}
        <div 
          className="pip-feed-graphics"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: 'transform 0.15s ease-out'
          }}
        >
          {/* Stylized Synthetic Architectural Rendering */}
          <div className="pip-scene-canvas">
            {/* Grid Horizon & Digital Wireframe Terrain */}
            <div className="pip-wireframe-ground"></div>

            {/* AI Tracking Reticles */}
            {isDrone ? (
              <>
                <div className="pip-ai-box" style={{ top: '38%', left: '42%', width: '70px', height: '60px' }}>
                  <div className="pip-ai-reticle"></div>
                  <div className="pip-ai-label">UAV TRACK · QUAD 99.4%</div>
                </div>
                <div className="pip-ai-box" style={{ top: '60%', left: '68%', width: '50px', height: '40px' }}>
                  <div className="pip-ai-reticle"></div>
                  <div className="pip-ai-label">CART #02 · NOMINAL</div>
                </div>
              </>
            ) : currentCam.id === 'cam-02' ? (
              <div className="pip-ai-box" style={{ top: '45%', left: '35%', width: '90px', height: '70px' }}>
                <div className="pip-ai-reticle"></div>
                <div className="pip-ai-label">PROMENADE GATE 1 · SECURE</div>
              </div>
            ) : currentCam.id === 'cam-03' ? (
              <div className="pip-ai-box" style={{ top: '40%', left: '40%', width: '80px', height: '65px' }}>
                <div className="pip-ai-reticle"></div>
                <div className="pip-ai-label">ARENA 750 LUX · 240 IN</div>
              </div>
            ) : (
              <div className="pip-ai-box" style={{ top: '35%', left: '48%', width: '75px', height: '80px' }}>
                <div className="pip-ai-reticle" style={{ borderColor: '#34c759' }}></div>
                <div className="pip-ai-label" style={{ background: 'rgba(52,199,89,0.85)' }}>EXIT CORRIDOR · CLEAR</div>
              </div>
            )}

            {/* Center Gimbal Crosshair */}
            <div className="pip-crosshair">
              <Crosshair size={26} color="rgba(255,255,255,0.4)" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Scanlines Overlay */}
        <div className="pip-scanlines"></div>

        {/* Real-time Telemetry On-Screen Display (OSD) */}
        <div className="pip-osd-top-left">
          <div className="pip-osd-rec">
            <span className="pip-rec-indicator">● REC</span>
            <span>{currentTime}</span>
          </div>
          <div className="pip-osd-details">
            {currentCam.location} · {currentCam.type}
          </div>
        </div>

        <div className="pip-osd-top-right">
          <div className="pip-osd-stat">
            <span>BITRATE:</span> <strong>8.4 Mbps</strong>
          </div>
          <div className="pip-osd-stat">
            <span>LATENCY:</span> <strong>16ms</strong>
          </div>
          <div className="pip-osd-stat">
            <span>ENCODER:</span> <strong>H.265/WebRTC</strong>
          </div>
        </div>

        {/* Drone Specific Telemetry Banner */}
        {isDrone && (
          <div className="pip-drone-hud">
            <div className="pip-drone-hud-item">
              <Navigation size={12} color="#2997ff" />
              <span>ALT: <strong>42.5m</strong></span>
            </div>
            <div className="pip-drone-hud-item">
              <Compass size={12} color="#2997ff" />
              <span>SPD: <strong>3.8 m/s</strong></span>
            </div>
            <div className="pip-drone-hud-item">
              <Battery size={12} color="#34c759" />
              <span>BAT: <strong style={{ color: '#34c759' }}>88%</strong></span>
            </div>
            <div className="pip-drone-hud-item" style={{ marginLeft: 'auto' }}>
              <span className="pip-drone-tag">AUTOPATROL</span>
            </div>
          </div>
        )}

        {/* Vision Mode Switcher Pills (Top Center overlay) */}
        <div className="pip-vision-switcher">
          <button
            className={`pip-vision-btn ${visionMode === 'optical' ? 'active' : ''}`}
            onClick={() => setVisionMode('optical')}
            title="Optical Color Feed"
          >
            <Eye size={12} /> Optical
          </button>
          <button
            className={`pip-vision-btn ${visionMode === 'thermal' ? 'active' : ''}`}
            onClick={() => setVisionMode('thermal')}
            title="FLIR Ironbow Thermal Heat Signature"
          >
            <Flame size={12} /> FLIR
          </button>
          <button
            className={`pip-vision-btn ${visionMode === 'night' ? 'active' : ''}`}
            onClick={() => setVisionMode('night')}
            title="Gen-3 Night Vision IR"
          >
            <Moon size={12} /> Night IR
          </button>
        </div>
      </div>

      {/* Bottom PTZ & Navigation Quick Actions */}
      <div className="pip-footer">
        <div className="pip-ptz-controls">
          <div className="pip-ptz-dpad">
            <button className="pip-dpad-btn" onClick={() => handlePan(0, 10)} title="Tilt Up">
              <ChevronUp size={12} />
            </button>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button className="pip-dpad-btn" onClick={() => handlePan(10, 0)} title="Pan Left">
                <ChevronLeft size={12} />
              </button>
              <button className="pip-dpad-btn" onClick={handleResetPtz} title="Reset PTZ Center" style={{ fontSize: '9px' }}>
                ●
              </button>
              <button className="pip-dpad-btn" onClick={() => handlePan(-10, 0)} title="Pan Right">
                <ChevronRight size={12} />
              </button>
            </div>
            <button className="pip-dpad-btn" onClick={() => handlePan(0, -10)} title="Tilt Down">
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="pip-zoom-controls">
            <button className="pip-zoom-btn" onClick={() => handleZoom(0.3)} title="Zoom In">
              <ZoomIn size={12} />
            </button>
            <span className="pip-zoom-readout">{zoomLevel}x</span>
            <button className="pip-zoom-btn" onClick={() => handleZoom(-0.3)} title="Zoom Out">
              <ZoomOut size={12} />
            </button>
          </div>
        </div>

        {/* Primary WOW Action: Fly Main Camera to Match Surveillance View */}
        <button 
          className="btn btn-primary pip-sync-btn"
          onClick={() => onSyncCameraView(currentCam.id)}
          title="Fly 3D Camera to this Surveillance Node's exact perspective"
        >
          <Crosshair size={13} /> Sync 3D Scene View
        </button>
      </div>
    </div>
  );
}
