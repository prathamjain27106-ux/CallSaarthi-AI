import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  Send, 
  AlertTriangle,
  FileText,
  User,
  Radio
} from 'lucide-react';

export default function CaseReviewModal({ caseItem, onClose, onUpdateStatus }) {
  if (!caseItem) return null;

  const [triageStatus, setTriageStatus] = useState(caseItem.status);
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveReview = (newStatus) => {
    setTriageStatus(newStatus);
    onUpdateStatus(caseItem.id, newStatus, operatorNotes);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog case-review-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-badge-row">
              <span className="modal-case-id">{caseItem.id}</span>
              <span className={`urgency-badge badge-${caseItem.urgency.toLowerCase()}`}>
                {caseItem.urgency} Urgency
              </span>
              <span className="confidence-pill">
                <Sparkles size={12} /> {caseItem.confidence} Confidence
              </span>
            </div>
            <h2 className="modal-title">{caseItem.category || 'Emergency Helpline Triage'}</h2>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close review dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Caller Details Grid */}
          <div className="caller-info-strip">
            <div className="info-item">
              <span className="info-label"><User size={13} /> Caller</span>
              <span className="info-val">{caseItem.callerName}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><Phone size={13} /> Contact</span>
              <span className="info-val">{caseItem.callerPhone}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><MapPin size={13} /> Location</span>
              <span className="info-val">{caseItem.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><Clock size={13} /> Intake Time</span>
              <span className="info-val">{caseItem.time} ({caseItem.timestamp})</span>
            </div>
          </div>

          {/* AI Intake Summary */}
          <div className="review-section">
            <h4 className="section-label">
              <FileText size={15} /> Incident Summary
            </h4>
            <div className="summary-callout">
              <p>{caseItem.summary}</p>
            </div>
          </div>

          {/* Key Phrases & Language */}
          <div className="review-section">
            <h4 className="section-label">
              <Radio size={15} /> Detected Key Distress Phrases ({caseItem.language})
            </h4>
            <div className="tags-row">
              {caseItem.keyPhrases && caseItem.keyPhrases.map((phrase, idx) => (
                <span key={idx} className="phrase-tag">
                  "{phrase}"
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Emergency Routing */}
          <div className="review-section recommendation-box">
            <div className="rec-header">
              <ShieldAlert size={18} color="#00e5ff" />
              <div>
                <span className="rec-label">Recommended Triage Routing</span>
                <div className="rec-service-name">{caseItem.recommendedService}</div>
              </div>
            </div>
            <p className="rec-notes">{caseItem.aiNotes}</p>
          </div>

          {/* Operator Triage Notes Input */}
          <div className="review-section">
            <label className="section-label" htmlFor="op-notes">
              Operator Verification Notes (Optional)
            </label>
            <textarea
              id="op-notes"
              className="operator-notes-input"
              rows={2}
              placeholder="Add supervisor notes, ambulance vehicle number, or special instructions..."
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
            />
          </div>

          {isSaved && (
            <div className="save-success-alert">
              <CheckCircle size={16} />
              <span>Status updated to "{triageStatus}". Returning to dashboard...</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>

          <button 
            type="button" 
            className="btn-warning-action"
            onClick={() => handleSaveReview('Under Triage')}
          >
            <AlertTriangle size={15} />
            Keep Under Triage
          </button>

          <button 
            type="button" 
            className="btn-primary"
            onClick={() => handleSaveReview('Reviewed')}
          >
            <CheckCircle size={16} />
            Confirm & Mark Reviewed
          </button>
        </div>
      </div>
    </div>
  );
}
