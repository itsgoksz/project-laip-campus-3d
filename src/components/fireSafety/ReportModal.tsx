import { X, Printer, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';
import type { FireExtinguisherDetails } from '../../types/fireSafety';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FireExtinguisherDetails;
}

export default function ReportModal({ isOpen, onClose, data }: ReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fs-modal-backdrop" onClick={onClose}>
      <div className="fs-modal fs-report-modal" onClick={e => e.stopPropagation()}>
        <div className="fs-modal-header">
          <div className="fs-modal-title-group">
            <div className="fs-icon-badge" style={{ background: 'rgba(52, 199, 89, 0.15)', borderColor: 'rgba(52, 199, 89, 0.3)' }}>
              <Award size={20} color="#34c759" />
            </div>
            <div>
              <h3 className="fs-modal-title">NFPA 10 Compliance Certificate</h3>
              <p className="fs-modal-subtitle">Official Fire Protection & Safety Certification Document</p>
            </div>
          </div>
          <button className="fs-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="fs-report-content" id="printable-certificate">
          {/* Certificate Header */}
          <div className="fs-cert-header">
            <div className="fs-cert-logo-row">
              <ShieldCheck size={32} color="#34c759" />
              <div>
                <h2>CAMPUS FIRE & LIFE SAFETY DIVISION</h2>
                <p>Standard for Portable Fire Extinguishers (NFPA 10 / OSHA 1910.157)</p>
              </div>
            </div>
            <div className="fs-cert-stamp">
              <span className="fs-cert-stamp-text">AUDIT VERIFIED</span>
              <span className="fs-cert-stamp-date">{data.lastInspectedDate}</span>
            </div>
          </div>

          {/* Grid summary */}
          <div className="fs-cert-grid">
            <div className="fs-cert-card">
              <span className="fs-cert-label">Asset Identifier</span>
              <span className="fs-cert-val">{data.tag}</span>
            </div>
            <div className="fs-cert-card">
              <span className="fs-cert-label">Serial Number</span>
              <span className="fs-cert-val">{data.serialNumber}</span>
            </div>
            <div className="fs-cert-card">
              <span className="fs-cert-label">Classification / Rating</span>
              <span className="fs-cert-val">{data.ulRating} ({data.classification})</span>
            </div>
            <div className="fs-cert-card">
              <span className="fs-cert-label">Mounting Location</span>
              <span className="fs-cert-val">{data.location}</span>
            </div>
            <div className="fs-cert-card">
              <span className="fs-cert-label">Current Tank Pressure</span>
              <span className="fs-cert-val" style={{ color: '#34c759' }}>{data.pressureMPa} MPa (Optimal Operating Zone)</span>
            </div>
            <div className="fs-cert-card">
              <span className="fs-cert-label">Next Hydrostatic Test</span>
              <span className="fs-cert-val">{data.nextHydroTestDate}</span>
            </div>
          </div>

          {/* Recent Inspection Record */}
          <div className="fs-cert-section">
            <h4>Latest Signed Inspection Entry</h4>
            {data.history.length > 0 ? (
              <div className="fs-cert-entry">
                <div className="fs-cert-entry-header">
                  <strong>{data.history[0].type} — {data.history[0].date} ({data.history[0].timestamp})</strong>
                  <span className="fs-badge-pass"><CheckCircle2 size={13} /> {data.history[0].status}</span>
                </div>
                <p className="fs-cert-inspector">Certified Inspector: <span>{data.history[0].inspector}</span></p>
                <p className="fs-cert-notes">"{data.history[0].notes}"</p>
              </div>
            ) : (
              <p>No historical inspections recorded.</p>
            )}
          </div>

          <div className="fs-cert-footer">
            <div className="fs-cert-signature-box">
              <div className="fs-cert-sig-line"></div>
              <span>Campus Fire Marshal Signature</span>
            </div>
            <div className="fs-cert-signature-box">
              <div className="fs-cert-sig-line"></div>
              <span>Lead EHS Compliance Officer</span>
            </div>
          </div>
        </div>

        <div className="fs-modal-footer">
          <button type="button" className="btn fs-btn-cancel" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
