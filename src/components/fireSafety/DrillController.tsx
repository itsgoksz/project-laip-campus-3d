import { memo } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface DrillControllerProps {
  isActive: boolean;
  elapsedSeconds: number;
  onCompleteDrill: () => void;
  onCancelDrill: () => void;
}

const DrillController = memo(function DrillController({
  isActive,
  elapsedSeconds,
  onCompleteDrill,
  onCancelDrill,
}: DrillControllerProps) {
  if (!isActive) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fs-drill-banner">
      {/* 1. Status Indicator & Name */}
      <div className="fs-drill-left">
        <div className="fs-drill-live-indicator">
          <span className="fs-drill-pulse-ring"></span>
          <span className="fs-drill-pulse-core"></span>
        </div>
        <div className="fs-drill-info">
          <span className="fs-drill-title">EVACUATION DRILL</span>
          <span className="fs-drill-sub">Classroom 101</span>
        </div>
      </div>

      <div className="fs-drill-divider" />

      {/* 2. Stopwatch & NFPA Benchmark Target */}
      <div className="fs-drill-center">
        <span className="fs-drill-timer">{formattedTime}</span>
        <span className="fs-drill-benchmark">&lt; 90s target</span>
      </div>

      <div className="fs-drill-divider" />

      {/* 3. Actions: Complete & Abort */}
      <div className="fs-drill-actions">
        <button 
          className="fs-drill-complete-btn" 
          onClick={onCompleteDrill}
          title="Complete drill and log compliance audit"
        >
          <CheckCircle2 size={13} />
          <span>Complete Audit</span>
        </button>
        <button 
          className="fs-drill-cancel-btn" 
          onClick={onCancelDrill}
          title="Abort evacuation drill"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
});

export default DrillController;
