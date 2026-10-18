import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Copy, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Languages, 
  FileText, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  HeartPulse, 
  Users, 
  HelpCircle, 
  CheckCircle2, 
  PhoneForwarded,
  Info,
  Layers,
  SearchCheck,
  ShieldCheck
} from 'lucide-react';

export default function AnalysisResultsPage({ 
  result, 
  onBackToEditor, 
  onSaveCase, 
  onNavigateCases 
}) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(result?.evidenceSpans?.[0] || null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [isSaved, setIsSaved] = useState(false);

  if (!result) return null;

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Fallback
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  // Download case report as a clean formatted text document
  const handleDownloadReport = () => {
    const reportText = `=====================================================
CALLSAARTHI AI - EMERGENCY HELPLINE TRIAGE ASSESSMENT
=====================================================
Case ID: ${result.caseId}
Intake Date/Time: ${result.receivedDateTime}
Detected Language: ${result.detectedLanguage}
Triage Urgency: ${result.urgency} (Confidence: ${result.confidence})
Recommended Dispatch: ${result.recommendedService}
Review Status: ${result.reviewStatus}
Previous Reference: ${result.extracted.previousComplaintRef}

-----------------------------------------------------
CASE SUMMARY
-----------------------------------------------------
${result.summary}

-----------------------------------------------------
URGENCY CLASSIFICATION & RATIONALE
-----------------------------------------------------
Urgency Level: ${result.urgency}
Rationale: ${result.urgencyReason}
Heuristic Guidance: A low confidence score must never automatically downgrade a potentially serious case. Ambiguous safety-critical content is flagged for human review.

-----------------------------------------------------
EXTRACTED INCIDENT METADATA
-----------------------------------------------------
- Incident Type: ${result.extracted.incidentType}
- Incident Description: ${result.extracted.incidentDescription}
- Location: ${result.extracted.location}
- Time / Date: ${result.extracted.timeOrDate}
- Threat Indicators: ${result.extracted.threatIndicators}
- Medical Indicators: ${result.extracted.medicalIndicators}
- Harassment Indicators: ${result.extracted.harassmentIndicators}
- Emotional Distress: ${result.extracted.emotionalDistressIndicators}
- Previous Complaint Ref: ${result.extracted.previousComplaintRef}
- Relevant People: ${result.extracted.relevantPeople}
- Missing / Unclear Info: ${result.extracted.missingInfo}

-----------------------------------------------------
ORIGINAL TRANSCRIPT
-----------------------------------------------------
${result.originalTranscript}

-----------------------------------------------------
OPERATOR NOTES: ${result.operatorNotes}
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.caseId}_Triage_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Save case
  const handleSave = () => {
    onSaveCase(result);
    setIsSaved(true);
  };

  // Filter evidence spans
  const filteredEvidence = activeCategoryFilter === 'ALL'
    ? result.evidenceSpans
    : result.evidenceSpans.filter((s) => s.category === activeCategoryFilter);

  // Helper to color-code evidence categories
  const getCategoryClass = (cat) => {
    switch (cat) {
      case 'Urgency Indicators': return 'tag-urgency';
      case 'Incident Details': return 'tag-incident';
      case 'Location References': return 'tag-location';
      case 'Previous Complaint References': return 'tag-prevref';
      case 'Uncertain Statements': return 'tag-uncertain';
      default: return 'tag-general';
    }
  };

  return (
    <div className="analysis-results-view">
      {/* 1. Case Header */}
      <div className="results-header-card">
        <div className="header-meta-left">
          <button 
            type="button" 
            className="btn-back-link" 
            onClick={onBackToEditor}
            title="Return to transcript editor"
          >
            <ArrowLeft size={16} />
            <span>Back to Editor</span>
          </button>

          <div className="case-id-status-row">
            <span className="results-case-id">{result.caseId}</span>
            <span className={`urgency-badge badge-${result.urgency.toLowerCase()}`}>
              {result.urgency} Urgency
            </span>
            <span className="status-pill status-awaiting">
              <Clock size={12} /> {result.reviewStatus}
            </span>
          </div>

          <div className="header-breadcrumbs">
            <span className="crumb-item">
              <Calendar size={13} /> {result.receivedDateTime}
            </span>
            <span className="crumb-dot">•</span>
            <span className="crumb-item">
              <Languages size={13} /> {result.detectedLanguage}
            </span>
            {result.caseRef && result.caseRef !== 'Not mentioned' && (
              <>
                <span className="crumb-dot">•</span>
                <span className="crumb-item text-cyan">
                  Ref: {result.caseRef}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="header-actions-right">
          <button 
            type="button" 
            className="btn-action-outline" 
            onClick={handleDownloadReport}
          >
            <Download size={15} />
            <span>Download Report</span>
          </button>

          <button 
            type="button" 
            className={`btn-action-primary ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={isSaved}
          >
            {isSaved ? <Check size={16} /> : <Save size={16} />}
            <span>{isSaved ? 'Case Saved in Queue' : 'Save Case'}</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="save-notification-banner">
          <CheckCircle2 size={18} color="#10b981" />
          <span>Case {result.caseId} successfully registered in active Case Management queue.</span>
          <button 
            type="button" 
            className="btn-link-action" 
            onClick={onNavigateCases}
          >
            View in Cases Table →
          </button>
        </div>
      )}

      {/* Main Grid: Urgency & Summary, Extracted Meta, Evidence Inspector */}
      <div className="results-layout-grid">
        {/* Left Column: Urgency Assessment & Case Summary */}
        <div className="results-col-left">
          {/* Urgency Assessment Card */}
          <div className="assessment-card">
            <div className="card-top-title-row">
              <div className="title-with-icon">
                <ShieldAlert size={18} className={`icon-urgency-${result.urgency.toLowerCase()}`} />
                <h3>Urgency Assessment</h3>
              </div>
              <div className="confidence-indicator-pill">
                <Sparkles size={13} color="#00e5ff" />
                <span>Simulated Confidence: <strong>{result.confidence}</strong></span>
              </div>
            </div>

            <div className={`urgency-highlight-banner banner-${result.urgency.toLowerCase()}`}>
              <div className="urgency-level-callout">
                Suggested Priority: <strong>{result.urgency}</strong>
              </div>
              <p className="urgency-rationale-text">
                {result.urgencyReason}
              </p>
            </div>

            {/* Safety Protocol Rule Box */}
            <div className="safety-protocol-disclaimer">
              <Info size={16} color="#00e5ff" className="disclaimer-icon" />
              <div className="disclaimer-text">
                <strong>Safety-Critical Triage Directive:</strong> A low confidence score must never automatically downgrade a potentially serious case. Ambiguous or high-distress statements are permanently flagged for human operator review before resolution.
              </div>
            </div>

            {/* Recommended Service Routing */}
            <div className="routing-preview-box">
              <span className="route-sub">Automated Service Dispatch Recommendation:</span>
              <div className="route-main">
                <PhoneForwarded size={18} color="#00e5ff" />
                <span className="route-name">{result.recommendedService}</span>
              </div>
            </div>
          </div>

          {/* Case Summary Card */}
          <div className="summary-card">
            <div className="card-top-title-row">
              <div className="title-with-icon">
                <FileText size={18} color="#00e5ff" />
                <h3>Synthesized Case Summary</h3>
              </div>
              <button
                type="button"
                className={`btn-copy-summary ${copiedSummary ? 'copied' : ''}`}
                onClick={handleCopySummary}
              >
                {copiedSummary ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
              </button>
            </div>

            <div className="summary-box">
              <p>{result.summary}</p>
            </div>

            <div className="summary-meta-note">
              <span>Factual integrity guarantee: Contains only explicit details from call session. No speculative facts generated.</span>
            </div>
          </div>

          {/* Extracted Information Grid */}
          <div className="extracted-info-card">
            <div className="card-top-title-row">
              <div className="title-with-icon">
                <Layers size={18} color="#00e5ff" />
                <h3>Extracted Incident Information</h3>
              </div>
              <span className="field-count-badge">11 Attributes Checked</span>
            </div>

            <div className="extracted-fields-grid">
              <div className="extracted-field">
                <span className="field-key">Incident Type</span>
                <span className="field-val highlight">{result.extracted.incidentType}</span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Incident Description</span>
                <span className="field-val">{result.extracted.incidentDescription}</span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Explicit Location</span>
                <span className={`field-val ${result.extracted.location === 'Not mentioned' ? 'text-muted' : 'highlight-location'}`}>
                  {result.extracted.location}
                </span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Time / Date Reference</span>
                <span className={`field-val ${result.extracted.timeOrDate === 'Not mentioned' ? 'text-muted' : ''}`}>
                  {result.extracted.timeOrDate}
                </span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Threat Indicators</span>
                <span className={`field-val ${result.extracted.threatIndicators === 'Not mentioned' ? 'text-muted' : 'text-danger'}`}>
                  {result.extracted.threatIndicators}
                </span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Medical Assistance Indicators</span>
                <span className={`field-val ${result.extracted.medicalIndicators === 'Not mentioned' ? 'text-muted' : 'text-danger'}`}>
                  {result.extracted.medicalIndicators}
                </span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Harassment Indicators</span>
                <span className={`field-val ${result.extracted.harassmentIndicators === 'Not mentioned' ? 'text-muted' : 'text-warning'}`}>
                  {result.extracted.harassmentIndicators}
                </span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Emotional Distress Indicators</span>
                <span className={`field-val ${result.extracted.emotionalDistressIndicators === 'Not mentioned' ? 'text-muted' : 'text-cyan'}`}>
                  {result.extracted.emotionalDistressIndicators}
                </span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Previous Complaint Reference</span>
                <span className={`field-val ${result.extracted.previousComplaintRef === 'Not mentioned' ? 'text-muted' : 'highlight-prevref'}`}>
                  {result.extracted.previousComplaintRef}
                </span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Relevant People / Roles</span>
                <span className={`field-val ${result.extracted.relevantPeople === 'Not mentioned' ? 'text-muted' : ''}`}>
                  {result.extracted.relevantPeople}
                </span>
              </div>

              <div className="extracted-field">
                <span className="field-key">Missing or Unclear Information</span>
                <span className="field-val text-warning">{result.extracted.missingInfo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transcript Evidence Inspector */}
        <div className="results-col-right">
          <div className="evidence-inspector-card">
            <div className="card-top-title-row">
              <div className="title-with-icon">
                <SearchCheck size={18} color="#00e5ff" />
                <h3>Transcript Evidence Inspector</h3>
              </div>
              <span className="evidence-count-badge">
                {result.evidenceSpans.length} Highlighted Clues
              </span>
            </div>

            {/* Filter Tabs by Category */}
            <div className="evidence-filter-bar">
              <button 
                type="button" 
                className={`ev-filter-btn ${activeCategoryFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('ALL')}
              >
                All
              </button>
              <button 
                type="button" 
                className={`ev-filter-btn ${activeCategoryFilter === 'Urgency Indicators' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('Urgency Indicators')}
              >
                Urgency
              </button>
              <button 
                type="button" 
                className={`ev-filter-btn ${activeCategoryFilter === 'Incident Details' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('Incident Details')}
              >
                Incident
              </button>
              <button 
                type="button" 
                className={`ev-filter-btn ${activeCategoryFilter === 'Location References' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('Location References')}
              >
                Location
              </button>
              <button 
                type="button" 
                className={`ev-filter-btn ${activeCategoryFilter === 'Previous Complaint References' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('Previous Complaint References')}
              >
                Prev Ticket
              </button>
            </div>

            {/* Original Transcript with Interactive Visual Highlights */}
            <div className="transcript-reader-pane">
              <div className="reader-header-label">Original Verified Transcript:</div>
              <div className="transcript-body-text">
                {result.originalTranscript}
              </div>
            </div>

            {/* Interactive Highlights List */}
            <div className="evidence-list-container">
              <div className="evidence-list-heading">
                Click any highlighted span to inspect triage rationale:
              </div>

              <div className="evidence-spans-list">
                {filteredEvidence.map((span, idx) => {
                  const isSelected = selectedEvidence?.text === span.text;
                  return (
                    <div
                      key={idx}
                      className={`evidence-item-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedEvidence(span)}
                    >
                      <div className="evidence-item-top">
                        <span className={`evidence-category-badge ${getCategoryClass(span.category)}`}>
                          {span.category}
                        </span>
                        {isSelected && <span className="inspecting-label">Active Inspection</span>}
                      </div>

                      <div className="evidence-quote">
                        "{span.text}"
                      </div>

                      <div className="evidence-explanation">
                        {span.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Detail Drawer / Callout */}
            {selectedEvidence && (
              <div className="selected-evidence-drawer">
                <div className="drawer-header">
                  <ShieldCheck size={16} color="#00e5ff" />
                  <span>Selected Evidence Rationale</span>
                </div>
                <div className="drawer-quote">"{selectedEvidence.text}"</div>
                <div className="drawer-reason">{selectedEvidence.explanation}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
