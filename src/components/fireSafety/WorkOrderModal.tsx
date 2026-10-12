import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, Send } from 'lucide-react';
import type { WorkOrder } from '../../types/fireSafety';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Omit<WorkOrder, 'id'>) => void;
  assetTag: string;
}

export default function WorkOrderModal({ isOpen, onClose, onSubmit, assetTag }: WorkOrderModalProps) {
  const [issueType, setIssueType] = useState('Low Tank Pressure / Re-pressurization');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [technician, setTechnician] = useState('SafeGuard Fire Tech Team');
  const [description, setDescription] = useState('Gauge shows low pressure below 1.0 MPa. Requires inspection for valve leakage and re-pressurization with nitrogen.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    onSubmit({
      title: issueType,
      priority,
      status: 'Open',
      createdAt: formattedDate,
      technician: technician.trim() || 'Unassigned EHS Dispatch',
      description: description.trim(),
    });
    onClose();
  };

  return (
    <div className="fs-modal-backdrop" onClick={onClose}>
      <div className="fs-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="fs-modal-header">
          <div className="fs-modal-title-group">
            <div className="fs-icon-badge" style={{ background: 'rgba(255, 159, 10, 0.15)', borderColor: 'rgba(255, 159, 10, 0.3)' }}>
              <Wrench size={20} color="#ff9f0a" />
            </div>
            <div>
              <h3 className="fs-modal-title">Create Maintenance Work Order</h3>
              <p className="fs-modal-subtitle">Asset Tag: <span className="fs-highlight">{assetTag}</span> • Facility Dispatch</p>
            </div>
          </div>
          <button className="fs-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="fs-modal-form">
          <div className="fs-input-group">
            <label className="fs-label">Primary Issue / Service Request</label>
            <select
              className="fs-input fs-select"
              value={issueType}
              onChange={e => setIssueType(e.target.value)}
            >
              <option value="Low Tank Pressure / Re-pressurization">Low Tank Pressure / Re-pressurization</option>
              <option value="Discharged Cylinder / Full Chemical Refill">Discharged Cylinder / Full Chemical Refill</option>
              <option value="Broken Pull Pin / Tamper Seal Replacement">Broken Pull Pin / Tamper Seal Replacement</option>
              <option value="Nozzle / Hose Assembly Dry Rot">Nozzle / Hose Assembly Dry Rot</option>
              <option value="Hydrostatic Shell Pressure Test (12-Yr)">Hydrostatic Shell Pressure Test (12-Yr)</option>
              <option value="Relocation / Wall Bracket Mounting Adjustment">Relocation / Wall Bracket Mounting Adjustment</option>
            </select>
          </div>

          <div className="fs-form-row">
            <div className="fs-input-group">
              <label className="fs-label">Priority Level</label>
              <div className="fs-priority-selector">
                {(['Low', 'Medium', 'High', 'Critical'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`fs-priority-pill ${priority === p ? `active-${p.toLowerCase()}` : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="fs-input-group">
            <label className="fs-label">Assigned Vendor / Facilities Technician</label>
            <input
              type="text"
              className="fs-input"
              value={technician}
              onChange={e => setTechnician(e.target.value)}
              placeholder="e.g. Facilities Mechanical Lead or SafeGuard Fire LLC"
              required
            />
          </div>

          <div className="fs-input-group">
            <label className="fs-label">Work Order Scope & Instructions</label>
            <textarea
              className="fs-textarea"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide exact details for the servicing crew..."
              required
            />
          </div>

          <div className="fs-status-banner status-flag">
            <AlertTriangle size={18} color="#ff9f0a" />
            <div>
              <strong>Dispatch Notice</strong>
              <p>Work order will be logged into the permanent digital maintenance ledger.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="fs-modal-footer">
            <button type="button" className="btn fs-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary fs-btn-submit">
              <Send size={15} /> Dispatch Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
