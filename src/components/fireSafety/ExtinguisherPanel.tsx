import { useState } from 'react';
import { 
  Flame, 
  ShieldCheck, 
  Calendar, 
  ClipboardCheck, 
  Wrench, 
  FileText, 
  QrCode, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Gauge, 
  MapPin, 
  Droplet
} from 'lucide-react';
import type { FireExtinguisherDetails, InspectionRecord, WorkOrder } from '../../types/fireSafety';
import InspectionModal from './InspectionModal';
import WorkOrderModal from './WorkOrderModal';
import ReportModal from './ReportModal';

interface ExtinguisherPanelProps {
  data: FireExtinguisherDetails;
  onUpdateData: (updated: FireExtinguisherDetails) => void;
  onClose?: () => void;
}

export default function ExtinguisherPanel({ data, onUpdateData }: ExtinguisherPanelProps) {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'specs' | 'history' | 'workorders'>('telemetry');
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  const handleInspectionSubmit = (record: Omit<InspectionRecord, 'id'>) => {
    const newRecord: InspectionRecord = {
      ...record,
      id: `insp-${Date.now()}`,
    };

    const isAllOk = Object.values(record.checklist).every(Boolean);

    const updated: FireExtinguisherDetails = {
      ...data,
      lastInspectedDate: record.date,
      lastInspectedDaysAgo: 0,
      inspectionDueInDays: 30,
      complianceStatus: isAllOk ? 'Compliant' : 'Due Soon',
      pressureMPa: record.checklist.pressureGaugeOk ? 1.25 : data.pressureMPa,
      pinIntact: record.checklist.tamperSealIntact,
      tamperSealIntact: record.checklist.tamperSealIntact,
      history: [newRecord, ...data.history],
    };

    onUpdateData(updated);
    triggerToast('Inspection certified & logged into compliance ledger!');
  };

  const handleWorkOrderSubmit = (order: Omit<WorkOrder, 'id'>) => {
    const newOrder: WorkOrder = {
      ...order,
      id: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
    };

    const updated: FireExtinguisherDetails = {
      ...data,
      workOrders: [newOrder, ...data.workOrders],
    };

    onUpdateData(updated);
    triggerToast(`Work order ${newOrder.id} dispatched!`);
  };

  return (
    <div className="panel right-panel fs-panel">
      {/* Toast Notification */}
      {successToast && (
        <div className="fs-toast">
          <CheckCircle2 size={16} color="#34c759" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Panel Header */}
      <div className="panel-header fs-header">
        <div className="fs-header-top">
          <div className="fs-header-left">
            <div className="fs-header-icon-box">
              <Flame size={20} color="#ff453a" />
            </div>
            <div>
              <div className="fs-header-tag-row">
                <span className="fs-tag-badge">{data.tag}</span>
                <button 
                  className="fs-qr-btn" 
                  title="View Asset QR Passport" 
                  onClick={() => setShowQrModal(!showQrModal)}
                >
                  <QrCode size={13} /> QR
                </button>
              </div>
              <h2 className="fs-header-title">{data.name}</h2>
            </div>
          </div>
          <div className={`fs-compliance-pill ${data.complianceStatus.toLowerCase().replace(' ', '-')}`}>
            <span className="fs-status-dot"></span>
            {data.complianceStatus}
          </div>
        </div>

        {/* Location Subtext */}
        <div className="fs-header-location">
          <MapPin size={13} className="icon-muted" />
          <span>{data.location}</span>
        </div>

        {/* Navigation Tabs */}
        <div className="fs-tabs">
          <button 
            className={`fs-tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setActiveTab('telemetry')}
          >
            <Gauge size={14} /> Telemetry
          </button>
          <button 
            className={`fs-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            <Layers size={14} /> Passport
          </button>
          <button 
            className={`fs-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={14} /> History ({data.history.length})
          </button>
          <button 
            className={`fs-tab-btn ${activeTab === 'workorders' ? 'active' : ''}`}
            onClick={() => setActiveTab('workorders')}
          >
            <Wrench size={14} /> Orders ({data.workOrders.length})
          </button>
        </div>
      </div>

      {/* Panel Scrollable Content */}
      <div className="panel-content fs-content">
        {/* TAB 1: TELEMETRY & LIVE IOT */}
        {activeTab === 'telemetry' && (
          <div className="fs-tab-content">
            {/* Pressure Gauge Card */}
            <div className="telemetry-card fs-card">
              <div className="telemetry-header">
                <div className="fs-card-label-wrap">
                  <Activity size={14} color="#2997ff" />
                  <span>IoT Chamber Pressure</span>
                </div>
                <span className="fs-metric-chip green">Operating Band</span>
              </div>
              <div className="telemetry-value">
                {data.pressureMPa.toFixed(2)} <span className="telemetry-unit">MPa</span>
              </div>
              {/* Pressure Bar Scale */}
              <div className="fs-pressure-bar-container">
                <div className="fs-pressure-bar">
                  <div className="fs-bar-zone red"></div>
                  <div className="fs-bar-zone green"></div>
                  <div className="fs-bar-zone red"></div>
                  {/* Gauge indicator needle position */}
                  <div 
                    className="fs-bar-needle" 
                    style={{ left: `${Math.min(100, Math.max(0, ((data.pressureMPa - 0.5) / 1.5) * 100))}%` }}
                  ></div>
                </div>
                <div className="fs-pressure-scale-labels">
                  <span>0.5 Recharge</span>
                  <span>1.2 Nominal</span>
                  <span>2.0 Overcharged</span>
                </div>
              </div>
              <div className="telemetry-status">
                <div className="status-dot active"></div>
                <span>Sensor calibrated • Tolerance ±0.02 MPa</span>
              </div>
            </div>

            {/* Safety Pin & Tamper Seal Status */}
            <div className="telemetry-card fs-card">
              <div className="telemetry-header">
                <div className="fs-card-label-wrap">
                  <ShieldCheck size={14} color="#34c759" />
                  <span>Physical Integrity Sensors</span>
                </div>
                <span className="fs-metric-chip green">Ready</span>
              </div>
              <div className="fs-sensor-row">
                <div className="fs-sensor-badge">
                  <span className="fs-sensor-dot active"></span>
                  <div>
                    <span className="fs-sensor-name">Pull Pin</span>
                    <span className="fs-sensor-sub">{data.pinIntact ? 'Sealed & Locked' : 'Removed'}</span>
                  </div>
                </div>
                <div className="fs-sensor-badge">
                  <span className="fs-sensor-dot active"></span>
                  <div>
                    <span className="fs-sensor-name">Tamper Seal</span>
                    <span className="fs-sensor-sub">{data.tamperSealIntact ? 'Intact Breakaway' : 'Broken'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Due Countdown Card */}
            <div className="telemetry-card fs-card" style={{ borderColor: 'rgba(255, 159, 10, 0.25)' }}>
              <div className="telemetry-header">
                <div className="fs-card-label-wrap">
                  <Calendar size={14} color="#ff9f0a" />
                  <span>NFPA 10 Monthly Inspection</span>
                </div>
                <span className="fs-metric-chip orange">30-Day Cycle</span>
              </div>
              <div className="fs-due-row">
                <div>
                  <div className="fs-due-days" style={{ color: data.inspectionDueInDays < 5 ? '#ff453a' : '#ff9f0a' }}>
                    {data.inspectionDueInDays} Days
                  </div>
                  <span className="fs-subtext">Remaining until due</span>
                </div>
                <div className="fs-last-inspected-box">
                  <span className="fs-last-label">Last Inspected</span>
                  <strong className="fs-last-val">{data.lastInspectedDate}</strong>
                  <span className="fs-subtext">({data.lastInspectedDaysAgo}d ago)</span>
                </div>
              </div>
            </div>

            {/* Mounting Compliance */}
            <div className="telemetry-card fs-card">
              <div className="telemetry-header">
                <div className="fs-card-label-wrap">
                  <CheckCircle2 size={14} color="#34c759" />
                  <span>Mounting & Accessibility</span>
                </div>
                <span className="fs-metric-chip green">Compliant</span>
              </div>
              <div className="fs-spec-grid-compact">
                <div className="fs-spec-item">
                  <span className="fs-spec-label">Mounting Height</span>
                  <span className="fs-spec-val">{data.mountingHeightInches}" from floor (&lt; 60" NFPA)</span>
                </div>
                <div className="fs-spec-item">
                  <span className="fs-spec-label">Obstruction Check</span>
                  <span className="fs-spec-val">Clear (36" Radius Free)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PASSPORT / SPECS */}
        {activeTab === 'specs' && (
          <div className="fs-tab-content">
            {/* Fire Classification Ratings */}
            <div className="telemetry-card fs-card">
              <div className="telemetry-header">
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>UL Fire Rating & Classes</span>
                <span className="fs-metric-chip blue">{data.ulRating}</span>
              </div>
              <p className="fs-spec-desc">{data.classification}</p>
              
              <div className="fs-fire-classes">
                <div className="fs-class-card class-a">
                  <div className="fs-class-badge">A</div>
                  <div>
                    <strong>Ordinary Combustibles</strong>
                    <span>Wood, paper, cloth, plastics</span>
                  </div>
                </div>
                <div className="fs-class-card class-b">
                  <div className="fs-class-badge">B</div>
                  <div>
                    <strong>Flammable Liquids</strong>
                    <span>Grease, gasoline, oils, solvents</span>
                  </div>
                </div>
                <div className="fs-class-card class-c">
                  <div className="fs-class-badge">C</div>
                  <div>
                    <strong>Electrical Equipment</strong>
                    <span>Live wiring, motors, appliances</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="telemetry-card fs-card">
              <div className="telemetry-header">
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Cylinder Specifications</span>
              </div>
              <div className="fs-spec-table">
                <div className="fs-spec-row">
                  <span className="fs-spec-key">Manufacturer</span>
                  <span className="fs-spec-value">{data.manufacturer}</span>
                </div>
                <div className="fs-spec-row">
                  <span className="fs-spec-key">Serial Number</span>
                  <span className="fs-spec-value">{data.serialNumber}</span>
                </div>
                <div className="fs-spec-row">
                  <span className="fs-spec-key">Capacity</span>
                  <span className="fs-spec-value">{data.capacity}</span>
                </div>
                <div className="fs-spec-row">
                  <span className="fs-spec-key">Extinguishing Agent</span>
                  <span className="fs-spec-value">{data.extinguishingAgent}</span>
                </div>
                <div className="fs-spec-row">
                  <span className="fs-spec-key">Manufacture Date</span>
                  <span className="fs-spec-value">{data.manufactureDate}</span>
                </div>
              </div>
            </div>

            {/* Long-term Hydrostatic & Teardown Schedule */}
            <div className="telemetry-card fs-card">
              <div className="telemetry-header">
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Regulatory Maintenance Intervals</span>
              </div>
              <div className="fs-timeline-schedule">
                <div className="fs-sched-item">
                  <div className="fs-sched-icon"><Droplet size={14} color="#2997ff" /></div>
                  <div className="fs-sched-text">
                    <strong>12-Year Hydrostatic Pressure Test</strong>
                    <span>Due Date: {data.nextHydroTestDate}</span>
                  </div>
                </div>
                <div className="fs-sched-item">
                  <div className="fs-sched-icon"><Wrench size={14} color="#ff9f0a" /></div>
                  <div className="fs-sched-text">
                    <strong>6-Year Internal Teardown & Recharge</strong>
                    <span>Due Date: {data.nextInternalInspectionDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT HISTORY */}
        {activeTab === 'history' && (
          <div className="fs-tab-content">
            <div className="fs-history-header">
              <span>Verified Compliance Log</span>
              <span className="fs-subtext">{data.history.length} records</span>
            </div>
            <div className="fs-history-list">
              {data.history.map(item => (
                <div key={item.id} className="fs-history-card">
                  <div className="fs-history-top">
                    <div className="fs-history-title-wrap">
                      <span className={`fs-history-badge ${item.status === 'Passed' ? 'passed' : 'flagged'}`}>
                        {item.status}
                      </span>
                      <strong className="fs-history-type">{item.type}</strong>
                    </div>
                    <span className="fs-history-date">{item.date}</span>
                  </div>
                  <div className="fs-history-inspector">
                    <span>Inspector:</span> {item.inspector}
                  </div>
                  {item.notes && <p className="fs-history-notes">"{item.notes}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WORK ORDERS */}
        {activeTab === 'workorders' && (
          <div className="fs-tab-content">
            <div className="fs-history-header">
              <span>Facility Work Orders</span>
              <button 
                className="btn btn-primary fs-btn-sm" 
                onClick={() => setShowWorkOrderModal(true)}
              >
                + New Ticket
              </button>
            </div>
            {data.workOrders.length === 0 ? (
              <div className="fs-empty-state">
                <ShieldCheck size={28} color="#34c759" />
                <p>No active work orders. System operating normally.</p>
              </div>
            ) : (
              <div className="fs-orders-list">
                {data.workOrders.map(order => (
                  <div key={order.id} className="fs-order-card">
                    <div className="fs-order-top">
                      <span className="fs-order-id">{order.id}</span>
                      <span className={`fs-priority-tag priority-${order.priority.toLowerCase()}`}>
                        {order.priority}
                      </span>
                    </div>
                    <h4 className="fs-order-title">{order.title}</h4>
                    <p className="fs-order-desc">{order.description}</p>
                    <div className="fs-order-footer">
                      <span className="fs-order-tech">Assigned: {order.technician}</span>
                      <span className="fs-order-status">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="fs-footer-bar">
        <button 
          className="btn btn-primary fs-action-btn"
          onClick={() => setShowInspectionModal(true)}
        >
          <ClipboardCheck size={16} /> Log Inspection
        </button>
        <button 
          className="btn fs-action-btn"
          onClick={() => setShowWorkOrderModal(true)}
        >
          <Wrench size={16} /> Service Ticket
        </button>
        <button 
          className="btn fs-action-btn-icon"
          title="Export NFPA 10 Compliance Certificate"
          onClick={() => setShowReportModal(true)}
        >
          <FileText size={16} />
        </button>
      </div>

      {/* QR Code Passport Preview Modal */}
      {showQrModal && (
        <div className="fs-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="fs-modal fs-qr-modal" onClick={e => e.stopPropagation()}>
            <div className="fs-modal-header">
              <h3 className="fs-modal-title">Extinguisher Digital Passport</h3>
              <button className="fs-modal-close" onClick={() => setShowQrModal(false)}>×</button>
            </div>
            <div className="fs-qr-box">
              <div className="fs-qr-pattern">
                {/* Simulated high-tech QR code matrix */}
                <div className="fs-qr-matrix">
                  <div className="fs-qr-corner top-left"></div>
                  <div className="fs-qr-corner top-right"></div>
                  <div className="fs-qr-corner bottom-left"></div>
                  <div className="fs-qr-center-logo">
                    <Flame size={24} color="#ff3b30" />
                  </div>
                </div>
              </div>
              <p className="fs-qr-tag">{data.tag}</p>
              <p className="fs-qr-caption">Scan with mobile device to open inspection terminal in field</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <InspectionModal 
        isOpen={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
        onSubmit={handleInspectionSubmit}
        assetTag={data.tag}
      />

      <WorkOrderModal 
        isOpen={showWorkOrderModal}
        onClose={() => setShowWorkOrderModal(false)}
        onSubmit={handleWorkOrderSubmit}
        assetTag={data.tag}
      />

      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        data={data}
      />
    </div>
  );
}
