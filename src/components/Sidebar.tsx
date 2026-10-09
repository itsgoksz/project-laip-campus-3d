import { Database, Map, Network, Server, Settings, Activity, Presentation } from 'lucide-react';

export default function Sidebar({ viewMode, setViewMode }: any) {
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
          className={`tree-node ${viewMode === 'campus' ? 'active' : ''}`}
          onClick={() => setViewMode('campus')}
        >
          <Map size={16} /> Campus Master
        </div>
        <div className="tree-node" style={{ paddingLeft: '28px' }}>
          <Server size={16} /> Main Building
        </div>
        <div className="tree-node" style={{ paddingLeft: '44px' }}>
          <Activity size={16} /> HVAC System
        </div>
        <div className="tree-node" style={{ paddingLeft: '44px' }}>
          <Network size={16} /> Power Grid
        </div>
        <div className="tree-node" style={{ paddingLeft: '28px' }}>
          <Server size={16} /> Sports Complex
        </div>
        <div className="tree-node" style={{ paddingLeft: '28px' }}>
          <Settings size={16} /> Maintenance Nodes
        </div>
        
        <div style={{ marginTop: '24px', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}></div>
        
        <div 
          className={`tree-node ${viewMode === 'classroom' ? 'active' : ''}`}
          onClick={() => setViewMode('classroom')}
        >
          <Presentation size={16} /> Classroom View
        </div>
      </div>
    </div>
  );
}
