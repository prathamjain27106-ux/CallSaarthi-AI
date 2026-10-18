import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Printer, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Languages, 
  FileText, 
  MapPin, 
  Calendar, 
  PhoneForwarded, 
  Edit3, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Link as LinkIcon, 
  ShieldCheck, 
  User, 
  Phone,
  Layers,
  HelpCircle,
  XCircle,
  Archive
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import ConfirmationModal from './ConfirmationModal';

export default function CaseDetailsPage({ 
  caseId, 
  onBack, 
  onNavigateCase 
}) {
  const { getCaseById, getReferencedCase, updateCase, deleteCase, showToast } = useCases();
  const caseItem = getCaseById(caseId);

  // Editable fields state
  const [operatorNotes, setOperatorNotes] = useState(caseItem?.operatorNotes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Confirmation modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  if (!caseItem) {
    return (
      <div className="case-not-found-card">
        <AlertTriangle size={36} color="#ef4444" />
        <h2>Case Record Not Found</h2>
        <p>The requested case ID "{caseId}" could not be located in the current database.</p>
        <button type="button" className="btn-primary" onClick={onBack}>
          <ArrowLeft size={16} /> Return to Case Management
        </button>
      </div>
    );
  }

  // Linked repeat case lookup
  const referencedCase = getReferencedCase(caseItem.previousComplaintRef);
  const hasMentionedRef = caseItem.previousComplaintRef && caseItem.previousComplaintRef !== 'Not mentioned';

  // Copy helpers
  const handleCopyId = () => {
    navigator.clipboard.writeText(caseItem.id);
    setCopiedId(true);
    showToast(`Copied ${caseItem.id}`);
    setTimeout(() => setCopiedId(false), 1500);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(caseItem.summary);
    setCopiedSummary(true);
    showToast('Case summary copied to clipboard.');
    setTimeout(() => setCopiedSummary(false), 1500);
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(caseItem.originalTranscript || '');
    setCopiedTranscript(true);
    showToast('Original transcript copied.');
    setTimeout(() => setCopiedTranscript(false), 1500);
  };

  // Change Final Urgency without touching suggested urgency
  const handleFinalUrgencyChange = (newUrgency) => {
    updateCase(
      caseItem.id,
      { finalUrgency: newUrgency },
      `Operator modified Final Urgency from ${caseItem.finalUrgency || caseItem.urgency} to ${newUrgency} (AI suggested: ${caseItem.suggestedUrgency || caseItem.urgency})`
    );
  };

  // Change Confirmed Service
  const handleConfirmedServiceChange = (newService) => {
    updateCase(
      caseItem.id,
      { confirmedService: newService },
      `Operator confirmed dispatch routing to ${newService}`
    );
  };

  // Change Review Status
  const handleStatusChange = (newStatus) => {
    updateCase(
      caseItem.id,
      { status: newStatus },
      `Triage review status updated to "${newStatus}"`
    );
  };

  // Save Operator Notes
  const handleSaveNotes = () => {
    updateCase(
      caseItem.id,
      { operatorNotes },
      `Operator notes updated: "${operatorNotes.substring(0, 60)}..."`
    );
    setIsEditingNotes(false);
  };

  // Print Case Report
  const handlePrint = () => {
    window.print();
  };

  // Toggle checklist item
  const handleToggleChecklist = (index) => {
    const updated = (caseItem.missingInfoChecklist || []).map((item, idx) =>
      idx === index ? { ...item, completed: !item.completed } : item
    );
    updateCase(caseItem.id, { missingInfoChecklist: updated });
  };

  const serviceOptions = [
    '108 Ambulance / Emergency Medical',
    '1091 Women Helpline & Local PCR',
    '1098 Childline / RPF Helpdesk',
    'Tele-MANAS (14416) Mental Health',
    'State Disaster Management Control',
    '14567 Elderline Support',
    '14555 PM-JAY Helpdesk',
    '1916 Municipal Civic Grievance',
    '19124 State Power Emergency & 1916 Civic Grievance',
    '15100 National Legal Services Authority (NALSA)',
    '112 Emergency Police Control Room & PCR Van',
  ];

  return (
    <div className="case-details-page">
      {/* 1. Header Bar */}
      <div className="cd-header-card">
        <div className="cd-header-left">
          <button 
            type="button" 
            className="btn-back-link" 
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            <span>Back to Case Management</span>
          </button>

          <div className="cd-id-row">
            <h1 className="cd-case-id">{caseItem.id}</h1>
            <button 
              type="button" 
              className="btn-copy-tag" 
              onClick={handleCopyId}
              title="Copy Case ID"
            >
              {copiedId ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
            </button>
            <span className="status-pill status-awaiting">
              {caseItem.status}
            </span>
          </div>

          <div className="cd-meta-breadcrumbs">
            <span><Calendar size={13} /> {caseItem.receivedDateTime || `${caseItem.receivedDate} ${caseItem.receivedTime}`}</span>
            <span>•</span>
            <span><Languages size={13} /> {caseItem.language}</span>
            <span>•</span>
            <span><MapPin size={13} /> {caseItem.location || 'Location Not Mentioned'}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="cd-header-actions">
          <button
            type="button"
            className="btn-outline-action"
            onClick={handlePrint}
            title="Print or export PDF report"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>

          {caseItem.status !== 'Reviewed' && (
            <button
              type="button"
              className="btn-action-reviewed"
              onClick={() => handleStatusChange('Reviewed')}
            >
              <CheckCircle2 size={16} />
              <span>Mark as Reviewed</span>
            </button>
          )}

          {caseItem.status !== 'Awaiting Information' && caseItem.status !== 'Closed' && (
            <button
              type="button"
              className="btn-action-awaiting-info"
              onClick={() => handleStatusChange('Awaiting Information')}
            >
              <Clock size={15} />
              <span>Awaiting Info</span>
            </button>
          )}

          {caseItem.status !== 'Closed' ? (
            <button
              type="button"
              className="btn-outline-action"
              onClick={() => setShowCloseConfirm(true)}
            >
              <Archive size={15} />
              <span>Close Case</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleStatusChange('Under Triage')}
            >
              <RotateCcw size={15} />
              <span>Reopen Case</span>
            </button>
          )}

          <button
            type="button"
            className="btn-danger-icon"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete demo case"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Layout */}
      <div className="cd-main-grid">
        {/* Left Column: Summary, Transcript, Extracted Info, Evidence */}
        <div className="cd-col-left">
          {/* Case Summary Card */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="card-title-with-icon">
                <FileText size={18} color="#00e5ff" />
                <h3>Case Summary</h3>
              </div>
              <button
                type="button"
                className="btn-copy-small"
                onClick={handleCopySummary}
              >
                {copiedSummary ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="cd-summary-callout">
              <p>{caseItem.summary}</p>
            </div>
            <div className="caller-profile-strip">
              <div className="strip-item">
                <span className="strip-label"><User size={12} /> Caller:</span>
                <span className="strip-val">{caseItem.callerName || 'Not mentioned'}</span>
              </div>
              <div className="strip-item">
                <span className="strip-label"><Phone size={12} /> Contact:</span>
                <span className="strip-val">{caseItem.callerPhone || 'Not mentioned'}</span>
              </div>
              <div className="strip-item">
                <span className="strip-label"><MapPin size={12} /> Jurisdiction:</span>
                <span className="strip-val">{caseItem.location || 'Not mentioned'}</span>
              </div>
            </div>
          </div>

          {/* Original Transcript Card */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="card-title-with-icon">
                <Languages size={18} color="#00e5ff" />
                <h3>Original Call Transcript ({caseItem.language})</h3>
              </div>
              <button
                type="button"
                className="btn-copy-small"
                onClick={handleCopyTranscript}
              >
                {copiedTranscript ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                <span>{copiedTranscript ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="cd-transcript-box">
              <p>{caseItem.originalTranscript || 'No transcript record attached.'}</p>
            </div>
          </div>

          {/* Extracted Incident Information */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="card-title-with-icon">
                <Layers size={18} color="#00e5ff" />
                <h3>Extracted Incident Metadata</h3>
              </div>
              <span className="badge-tag-count">Verified Facts</span>
            </div>

            <div className="extracted-fields-grid">
              <div className="extracted-field">
                <span className="field-key">Incident Type</span>
                <span className="field-val highlight">{caseItem.extracted?.incidentType || caseItem.category}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Incident Description</span>
                <span className="field-val">{caseItem.extracted?.incidentDescription || caseItem.summary}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Explicit Location</span>
                <span className="field-val highlight-location">{caseItem.extracted?.location || caseItem.location || 'Not mentioned'}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Time / Date Reference</span>
                <span className="field-val">{caseItem.extracted?.timeOrDate || caseItem.timeAgo || 'Not mentioned'}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Threat Indicators</span>
                <span className="field-val text-danger">{caseItem.extracted?.threatIndicators || 'Not mentioned'}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Medical Indicators</span>
                <span className="field-val text-danger">{caseItem.extracted?.medicalIndicators || 'Not mentioned'}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Harassment Indicators</span>
                <span className="field-val text-warning">{caseItem.extracted?.harassmentIndicators || 'Not mentioned'}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Emotional Distress Indicators</span>
                <span className="field-val text-cyan">{caseItem.extracted?.emotionalDistressIndicators || 'Not mentioned'}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Previous Complaint Reference</span>
                <span className="field-val highlight-prevref">{caseItem.previousComplaintRef || 'Not mentioned'}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Relevant People / Roles</span>
                <span className="field-val">{caseItem.extracted?.relevantPeople || 'Not mentioned'}</span>
              </div>
              <div className="extracted-field">
                <span className="field-key">Missing / Unclear Information</span>
                <span className="field-val text-warning">{caseItem.extracted?.missingInfo || 'None identified'}</span>
              </div>
            </div>
          </div>

          {/* Missing Information Checklist */}
          {caseItem.missingInfoChecklist && caseItem.missingInfoChecklist.length > 0 && (
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="card-title-with-icon">
                  <HelpCircle size={18} color="#f59e0b" />
                  <h3>Missing Information Verification Checklist</h3>
                </div>
                <span className="badge-tag-count">Operator Protocol</span>
              </div>
              <div className="checklist-items">
                {caseItem.missingInfoChecklist.map((item, idx) => (
                  <label key={idx} className="checklist-item-row">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(idx)}
                    />
                    <span className={item.completed ? 'checklist-done' : ''}>{item.item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Evidence Spans */}
          {caseItem.evidenceSpans && caseItem.evidenceSpans.length > 0 && (
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="card-title-with-icon">
                  <ShieldCheck size={18} color="#00e5ff" />
                  <h3>Supporting Transcript Evidence ({caseItem.evidenceSpans.length})</h3>
                </div>
              </div>
              <div className="cd-evidence-list">
                {caseItem.evidenceSpans.map((span, idx) => (
                  <div key={idx} className="cd-evidence-row">
                    <span className="cd-evidence-badge">{span.category}</span>
                    <div className="cd-evidence-body">
                      <div className="cd-evidence-quote">"{span.text}"</div>
                      <div className="cd-evidence-reason">{span.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Urgency, Service, Repeat Linkage, Operator Notes, History */}
        <div className="cd-col-right">
          {/* Urgency Assessment: AI Suggestion vs Final Operator Urgency */}
          <div className="cd-card urgency-comparator-card">
            <div className="cd-card-header">
              <div className="card-title-with-icon">
                <ShieldAlert size={18} color="#ef4444" />
                <h3>Urgency Classification</h3>
              </div>
              <span className="confidence-pill">
                <Sparkles size={12} /> {caseItem.confidence || '95%'} Confidence
              </span>
            </div>

            <div className="comparator-split">
              {/* Simulated AI Suggestion */}
              <div className="comparator-box ai-suggestion-box">
                <span className="comparator-label">🤖 Simulated Suggestion</span>
                <span className={`urgency-badge badge-${(caseItem.suggestedUrgency || caseItem.urgency || 'MEDIUM').toLowerCase()}`}>
                  {caseItem.suggestedUrgency || caseItem.urgency}
                </span>
                <p className="comparator-subtext">Generated from heuristic triage rules.</p>
              </div>

              {/* Operator Final Urgency */}
              <div className="comparator-box operator-final-box">
                <span className="comparator-label">👤 Final Operator Urgency</span>
                <select
                  className="final-urgency-select"
                  value={caseItem.finalUrgency || caseItem.urgency}
                  onChange={(e) => handleFinalUrgencyChange(e.target.value)}
                >
                  <option value="Critical">Critical (Immediate dispatch)</option>
                  <option value="High">High (Urgent protection)</option>
                  <option value="Medium">Medium (General assistance)</option>
                  <option value="Low">Low (Informational / Civic)</option>
                </select>
                <p className="comparator-subtext">Operator override authority.</p>
              </div>
            </div>

            {/* Note if modified */}
            {(caseItem.finalUrgency || caseItem.urgency) !== (caseItem.suggestedUrgency || caseItem.urgency) && (
              <div className="override-notice-pill">
                <AlertTriangle size={14} color="#f59e0b" />
                <span>Operator overridden from {caseItem.suggestedUrgency || caseItem.urgency} to {caseItem.finalUrgency || caseItem.urgency}</span>
              </div>
            )}

            <div className="ai-notes-preview">
              <strong>Triage Rationale:</strong> {caseItem.aiNotes || 'Standard heuristic assessment.'}
            </div>
          </div>

          {/* Emergency Service Routing: AI Recommended vs Confirmed */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="card-title-with-icon">
                <PhoneForwarded size={18} color="#00e5ff" />
                <h3>Emergency Service Routing</h3>
              </div>
            </div>

            <div className="service-routing-comparator">
              <div className="svc-row">
                <span className="svc-sub-label">🤖 AI Suggested Service:</span>
                <div className="svc-name-text">{caseItem.recommendedService}</div>
              </div>

              <div className="svc-row">
                <span className="svc-sub-label">👤 Confirmed Dispatch Service:</span>
                <select
                  className="confirmed-service-select"
                  value={caseItem.confirmedService || caseItem.recommendedService}
                  onChange={(e) => handleConfirmedServiceChange(e.target.value)}
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Repeat Complaint Intelligence */}
          <div className="cd-card repeat-intelligence-card">
            <div className="cd-card-header">
              <div className="card-title-with-icon">
                <LinkIcon size={18} color="#f59e0b" />
                <h3>Repeat Complaint Linkage</h3>
              </div>
            </div>

            {hasMentionedRef ? (
              <div className="repeat-status-block">
                <div className="ref-mentioned-row">
                  <span className="ref-label">Mentioned Reference:</span>
                  <span className="ref-value-badge">{caseItem.previousComplaintRef}</span>
                </div>

                {referencedCase ? (
                  <div className="verified-match-banner">
                    <div className="match-header">
                      <CheckCircle2 size={16} color="#10b981" />
                      <strong>Verified Match in Local Database</strong>
                    </div>
                    <p className="match-summary">
                      Matched Case: <strong>{referencedCase.id}</strong> — "{referencedCase.summary.substring(0, 75)}..."
                    </p>
                    <button
                      type="button"
                      className="btn-view-linked-case"
                      onClick={() => onNavigateCase(referencedCase.id)}
                    >
                      <ExternalLink size={13} />
                      <span>View Linked Case {referencedCase.id}</span>
                    </button>
                  </div>
                ) : (
                  <div className="unmatched-ref-banner">
                    <div className="match-header">
                      <AlertTriangle size={16} color="#f59e0b" />
                      <strong>Unmatched Reference / External Ticket</strong>
                    </div>
                    <p className="unmatched-desc">
                      Reference "{caseItem.previousComplaintRef}" cited by caller does not correspond to an internal record. May refer to an offline station diary or municipal ticket.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-repeat-block">
                <span>No prior complaint reference explicitly mentioned in this call session.</span>
              </div>
            )}
          </div>

          {/* Operator Notes Card */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="card-title-with-icon">
                <Edit3 size={18} color="#00e5ff" />
                <h3>Operator Notes</h3>
              </div>
              {!isEditingNotes && (
                <button
                  type="button"
                  className="btn-link-action"
                  onClick={() => setIsEditingNotes(true)}
                >
                  Edit Notes
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="notes-edit-area">
                <textarea
                  className="operator-notes-textarea"
                  rows={4}
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  placeholder="Enter supervisor notes, ambulance vehicle number, or special instructions..."
                />
                <div className="notes-btn-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setOperatorNotes(caseItem.operatorNotes || '');
                      setIsEditingNotes(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSaveNotes}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="operator-notes-display">
                <p>{caseItem.operatorNotes || 'No operator verification notes recorded yet.'}</p>
              </div>
            )}
          </div>

          {/* Assessment History Audit Trail */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="card-title-with-icon">
                <History size={18} color="#00e5ff" />
                <h3>Assessment History & Audit Trail</h3>
              </div>
            </div>

            <div className="audit-timeline">
              {(caseItem.history || []).map((entry, idx) => (
                <div key={idx} className="audit-item">
                  <div className="audit-dot"></div>
                  <div className="audit-body">
                    <div className="audit-action">{entry.action}</div>
                    <div className="audit-meta">
                      <span>{entry.timestamp}</span> • <span className="audit-user">{entry.user}</span>
                    </div>
                    {entry.note && <div className="audit-note">{entry.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Delete */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Case Record"
        message={`Are you sure you want to permanently delete case ${caseItem.id}?`}
        confirmLabel="Delete Case"
        isDestructive={true}
        onConfirm={() => {
          deleteCase(caseItem.id);
          onBack();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Confirmation Modal: Close */}
      <ConfirmationModal
        isOpen={showCloseConfirm}
        title="Close Triage Case"
        message={`Are you sure you want to mark case ${caseItem.id} as Closed? Closed cases are archived from the active triage queue.`}
        confirmLabel="Confirm Close"
        isDestructive={false}
        onConfirm={() => handleStatusChange('Closed')}
        onCancel={() => setShowCloseConfirm(false)}
      />
    </div>
  );
}
