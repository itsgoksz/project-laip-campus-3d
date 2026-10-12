import { Database, Map, Network, Server, Settings, Activity, Presentation, Flame, Wind } from 'lucide-react';
import CampusFleetWidget from './fireSafety/CampusFleetWidget';

export default function Sidebar({ viewMode, setViewMode, activeAsset, setActiveAsset, complianceStatus }: any) {
  return (
    <div className="panel sidebar">
      <div className="header-logo" style={{ marginTop: '24px' }}>
        <div className="header-logo-text">CAMPUS OS</div>
      </div>
      <div className="panel-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0' }}>
        <Database size={18} color="var(--text-main)" />
        <span className="panel-title">Asset Hierarchy</span>
      </div>
      <div className="panel-content">
        <div 
          className={`tree-node ${viewMode === 'campus' && !activeAsset ? 'active' : ''}`}
          onClick={() => {
            setViewMode('campus');
            if (setActiveAsset) setActiveAsset(null);
          }}
        >
          <Map size={16} />
          <span style={{ flexGrow: 1 }}>Campus Master</span>
          <span className="fs-sidebar-chip" style={{ color: '#34c759', borderColor: 'rgba(52, 199, 89, 0.3)' }}>Online</span>
        </div>

        <div 
          className={`tree-node ${viewMode === 'campus' && activeAsset === 'mainBuilding' ? 'active' : ''}`}
          style={{ paddingLeft: '28px' }}
          onClick={() => {
            setViewMode('campus');
            if (setActiveAsset) setActiveAsset('mainBuilding');
          }}
        >
          <Server size={16} />
          <span style={{ flexGrow: 1 }}>Main Building</span>
          <span className="fs-sidebar-chip">3 Floors</span>
        </div>

        <div 
          className={`tree-node ${viewMode === 'campus' && activeAsset === 'hvac' ? 'active' : ''}`}
          style={{ paddingLeft: '44px' }}
          onClick={() => {
            setViewMode('campus');
            if (setActiveAsset) setActiveAsset('hvac');
          }}
        >
          <Activity size={16} />
          <span style={{ flexGrow: 1 }}>HVAC System</span>
          <span className="fs-sidebar-chip" style={{ color: '#34c759' }}>21.5°C</span>
        </div>

        <div 
          className={`tree-node ${viewMode === 'campus' && activeAsset === 'powerGrid' ? 'active' : ''}`}
          style={{ paddingLeft: '44px' }}
          onClick={() => {
            setViewMode('campus');
            if (setActiveAsset) setActiveAsset('powerGrid');
          }}
        >
          <Network size={16} />
          <span style={{ flexGrow: 1 }}>Power Grid</span>
          <span className="fs-sidebar-chip">2.4 MW</span>
        </div>

        <div 
          className={`tree-node ${viewMode === 'campus' && activeAsset === 'sportsComplex' ? 'active' : ''}`}
          style={{ paddingLeft: '28px' }}
          onClick={() => {
            setViewMode('campus');
            if (setActiveAsset) setActiveAsset('sportsComplex');
          }}
        >
          <Server size={16} />
          <span style={{ flexGrow: 1 }}>Sports Complex</span>
          <span className="fs-sidebar-chip">Arena</span>
        </div>

        <div 
          className={`tree-node ${viewMode === 'campus' && activeAsset === 'maintenance' ? 'active' : ''}`}
          style={{ paddingLeft: '28px' }}
          onClick={() => {
            setViewMode('campus');
            if (setActiveAsset) setActiveAsset('maintenance');
          }}
        >
          <Settings size={16} />
          <span style={{ flexGrow: 1 }}>Maintenance Nodes</span>
          <span className="fs-sidebar-chip" style={{ color: '#ff9f0a', borderColor: 'rgba(255, 159, 10, 0.3)' }}>1 Alert</span>
        </div>
        
        <div style={{ marginTop: '20px', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}></div>
        
        <div 
          className={`tree-node ${viewMode === 'classroom' && !activeAsset ? 'active' : ''}`}
          onClick={() => {
            setViewMode('classroom');
            if (setActiveAsset) setActiveAsset(null);
          }}
        >
          <Presentation size={16} /> Classroom View
        </div>

        {/* Life & Fire Safety Sub-tree */}
        <div 
          className={`tree-node ${activeAsset === 'fireExtinguisher' ? 'active-fire' : ''}`}
          style={{ paddingLeft: '28px' }}
          onClick={() => {
            setViewMode('classroom');
            if (setActiveAsset) setActiveAsset('fireExtinguisher');
          }}
        >
          <Flame size={16} color="#ff453a" /> 
          <span style={{ flexGrow: 1 }}>Fire Extinguisher</span>
          <span 
            className="fs-sidebar-chip"
            style={{ 
              color: complianceStatus === 'Compliant' ? '#34c759' : '#ff9f0a',
              borderColor: complianceStatus === 'Compliant' ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 159, 10, 0.3)'
            }}
          >
            {complianceStatus || 'Compliant'}
          </span>
        </div>

        <div 
          className={`tree-node ${activeAsset === 'smokeDetector' ? 'active' : ''}`}
          style={{ paddingLeft: '28px' }}
          onClick={() => {
            setViewMode('classroom');
            if (setActiveAsset) setActiveAsset('smokeDetector');
          }}
        >
          <Wind size={16} color="#34c759" /> 
          <span style={{ flexGrow: 1 }}>Smoke Sensor</span>
          <span className="fs-sidebar-chip">SD-101</span>
        </div>

        {/* Campus Life Safety & Fire Protection Fleet Widget */}
        <CampusFleetWidget 
          complianceStatus={complianceStatus}
          onSelectClassroomFE={() => {
            setViewMode('classroom');
            if (setActiveAsset) setActiveAsset('fireExtinguisher');
          }}
        />
      </div>
    </div>
  );
}
