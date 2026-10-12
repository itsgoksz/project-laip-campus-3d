import React, { useState } from 'react';
import { X, CheckCircle2, AlertOctagon, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';
import type { InspectionRecord } from '../../types/fireSafety';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<InspectionRecord, 'id'>) => void;
  assetTag: string;
}

export default function InspectionModal({ isOpen, onClose, onSubmit, assetTag }: InspectionModalProps) {
  const [inspector, setInspector] = useState('Chief Insp. Marcus Vance (NFPA-10 Cert #419)');
  const [notes, setNotes] = useState('All 5-point safety requirements passed. Needle centered in green optimal band. Signage clearly visible.');
  const [checklist, setChecklist] = useState({
    pressureGaugeOk: true,
    tamperSealIntact: true,
    noCorrosionOrDamage: true,
    mountingAndSignageOk: true,
    nozzleClear: true,
  });

  if (!isOpen) return null;

  const allPassed = Object.values(checklist).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    onSubmit({
      date: formattedDate,
      timestamp: formattedTime,
      inspector: inspector.trim() || 'Facility Safety Officer',
      type: 'Monthly Visual (NFPA 10)',
      status: allPassed ? 'Passed' : 'Action Required',
      notes: notes.trim(),
      checklist,
    });
    onClose();
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fs-modal-backdrop" onClick={onClose}>
      <div className="fs-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="fs-modal-header">
          <div className="fs-modal-title-group">
            <div className="fs-icon-badge">
              <ClipboardCheck size={20} color="#2997ff" />
            </div>
            <div>
              <h3 className="fs-modal-title">Log NFPA 10 Monthly Inspection</h3>
              <p className="fs-modal-subtitle">Asset Tag: <span className="fs-highlight">{assetTag}</span> • Regulatory Visual Check</p>
            </div>
          </div>
          <button className="fs-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="fs-modal-form">
          <div className="fs-form-section-title">
            <span>5-Point Physical Inspection Checklist</span>
            <span className={`fs-checklist-counter ${allPassed ? 'all-good' : 'warning'}`}>
              {Object.values(checklist).filter(Boolean).length}/5 Verified
            </span>
          </div>

          <div className="fs-checklist-group">
            <label className={`fs-check-item ${checklist.pressureGaugeOk ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={checklist.pressureGaugeOk}
                onChange={() => toggleCheck('pressureGaugeOk')}
              />
              <span className="fs-check-custom"></span>
              <div className="fs-check-text">
                <span className="fs-check-label">Pressure Gauge Reading</span>
                <span className="fs-check-desc">Gauge needle is strictly within the green operating zone (~1.2 MPa).</span>
              </div>
            </label>

            <label className={`fs-check-item ${checklist.tamperSealIntact ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={checklist.tamperSealIntact}
                onChange={() => toggleCheck('tamperSealIntact')}
              />
              <span className="fs-check-custom"></span>
              <div className="fs-check-text">
                <span className="fs-check-label">Safety Pin & Tamper Seal</span>
                <span className="fs-check-desc">Pull pin is locked with undamaged, untampered plastic breakaway seal.</span>
              </div>
            </label>

            <label className={`fs-check-item ${checklist.noCorrosionOrDamage ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={checklist.noCorrosionOrDamage}
                onChange={() => toggleCheck('noCorrosionOrDamage')}
              />
              <span className="fs-check-custom"></span>
              <div className="fs-check-text">
                <span className="fs-check-label">Physical Cylinder Integrity</span>
                <span className="fs-check-desc">No corrosion, severe dents, leakage, or cylinder shell deformities.</span>
              </div>
            </label>

            <label className={`fs-check-item ${checklist.nozzleClear ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={checklist.nozzleClear}
                onChange={() => toggleCheck('nozzleClear')}
              />
              <span className="fs-check-custom"></span>
              <div className="fs-check-text">
                <span className="fs-check-label">Hose & Discharge Horn</span>
                <span className="fs-check-desc">Hose is supple without dry rot; discharge nozzle is clean and unobstructed.</span>
              </div>
            </label>

            <label className={`fs-check-item ${checklist.mountingAndSignageOk ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={checklist.mountingAndSignageOk}
                onChange={() => toggleCheck('mountingAndSignageOk')}
              />
              <span className="fs-check-custom"></span>
              <div className="fs-check-text">
                <span className="fs-check-label">Mounting Height & Unobstructed Signage</span>
                <span className="fs-check-desc">Mounted &le; 60 inches off floor, location sign illuminated and visible.</span>
              </div>
            </label>
          </div>

          <div className="fs-form-row">
            <div className="fs-input-group">
              <label className="fs-label">Inspector Name & Certification ID</label>
              <input
                type="text"
                className="fs-input"
                value={inspector}
                onChange={e => setInspector(e.target.value)}
                placeholder="e.g. John Doe, EHS Officer #102"
                required
              />
            </div>
          </div>

          <div className="fs-input-group">
            <label className="fs-label">Inspector Observations / Notes</label>
            <textarea
              className="fs-textarea"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record any visual signs or comments..."
            />
          </div>

          {/* Compliance Status Preview */}
          <div className={`fs-status-banner ${allPassed ? 'status-pass' : 'status-flag'}`}>
            {allPassed ? (
              <>
                <ShieldCheck size={20} color="#34c759" />
                <div>
                  <strong>NFPA 10 Verified: Compliant</strong>
                  <p>Submitting will reset the 30-day compliance cycle and stamp the digital tag.</p>
                </div>
              </>
            ) : (
              <>
                <AlertOctagon size={20} color="#ff9f0a" />
                <div>
                  <strong>Flagged for Remediation</strong>
                  <p>Items unchecked will record an action required entry in the compliance ledger.</p>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="fs-modal-footer">
            <button type="button" className="btn fs-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary fs-btn-submit">
              {allPassed ? (
                <>
                  <CheckCircle2 size={16} /> Certify & Stamp Record
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Submit Flagged Audit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
