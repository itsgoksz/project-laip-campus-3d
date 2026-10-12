import { memo } from 'react';
import { Flame, Wind, Droplet, LogOut, CheckCircle2 } from 'lucide-react';

interface CampusFleetWidgetProps {
  onSelectClassroomFE: () => void;
  complianceStatus: string;
}

const CampusFleetWidget = memo(function CampusFleetWidget({
  onSelectClassroomFE,
  complianceStatus,
}: CampusFleetWidgetProps) {
  const isCompliant = complianceStatus === 'Compliant';

  return (
    <div className="fs-fleet-widget">
      <div className="fs-fleet-header">
        <div>
          <span className="fs-fleet-caption">CAMPUS FLEET HEALTH</span>
          <h4 className="fs-fleet-title">Life Safety &amp; Fire Protection</h4>
        </div>
        <div className={`fs-fleet-score-badge ${isCompliant ? 'score-ok' : 'score-warn'}`}>
          <CheckCircle2 size={13} />
          <span>{isCompliant ? '98% Compliant' : '92% Review'}</span>
        </div>
      </div>

      {/* Equipment Inventory Grid */}
      <div className="fs-fleet-grid">
        <div className="fs-fleet-stat-card" onClick={onSelectClassroomFE} title="Click to inspect Classroom 101">
          <div className="fs-fleet-stat-icon-wrap icon-fe">
            <Flame size={14} color="#ff453a" />
          </div>
          <div>
            <strong className="fs-fleet-stat-num">48</strong>
            <span className="fs-fleet-stat-label">Extinguishers</span>
          </div>
          <span className="fs-fleet-sub-ok">45 Ready</span>
        </div>

        <div className="fs-fleet-stat-card">
          <div className="fs-fleet-stat-icon-wrap icon-sd">
            <Wind size={14} color="#34c759" />
          </div>
          <div>
            <strong className="fs-fleet-stat-num">120</strong>
            <span className="fs-fleet-stat-label">Smoke Sensors</span>
          </div>
          <span className="fs-fleet-sub-ok">119 Online</span>
        </div>

        <div className="fs-fleet-stat-card">
          <div className="fs-fleet-stat-icon-wrap icon-hose">
            <Droplet size={14} color="#2997ff" />
          </div>
          <div>
            <strong className="fs-fleet-stat-num">16</strong>
            <span className="fs-fleet-stat-label">Hose Reels</span>
          </div>
          <span className="fs-fleet-sub-ok">100% Tested</span>
        </div>

        <div className="fs-fleet-stat-card">
          <div className="fs-fleet-stat-icon-wrap icon-exit">
            <LogOut size={14} color="#ffd60a" />
          </div>
          <div>
            <strong className="fs-fleet-stat-num">8</strong>
            <span className="fs-fleet-stat-label">Exit Routes</span>
          </div>
          <span className="fs-fleet-sub-ok">Unobstructed</span>
        </div>
      </div>

      {/* Next Marshal Inspection info */}
      <div className="fs-fleet-footer">
        <span>Annual Fire Marshal Audit:</span>
        <strong>Nov 15, 2026</strong>
      </div>
    </div>
  );
});

export default CampusFleetWidget;
