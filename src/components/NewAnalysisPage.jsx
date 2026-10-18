import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Trash2, 
  ShieldAlert, 
  Clock, 
  Hash, 
  Edit3, 
  Languages, 
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { sampleTranscripts } from '../data/sampleTranscripts';

export default function NewAnalysisPage({ onStartAnalysis }) {
  const [transcript, setTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Auto-detect');
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [caseRef, setCaseRef] = useState('');
  const [receivedTime, setReceivedTime] = useState('');
  const [operatorNotes, setOperatorNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // Counters
  const charCount = transcript.length;
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  // Handle sample selection
  const handleSelectSample = (sampleId) => {
    setSelectedSampleId(sampleId);
    setValidationError('');
    if (!sampleId) return;

    const sample = sampleTranscripts.find((s) => s.id === sampleId);
    if (sample) {
      setTranscript(sample.text);
      setSelectedLanguage(sample.language);
      setCaseRef(sample.caseRef || '');
      setReceivedTime(sample.receivedTime || '');
      setOperatorNotes(sample.operatorNotes || '');
    }
  };

  // Clear fields
  const handleClearTranscript = () => {
    setTranscript('');
    setSelectedSampleId('');
    setValidationError('');
  };

  // Submit analysis
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setValidationError('Please enter or select a transcript before starting analysis.');
      return;
    }
    setValidationError('');
    onStartAnalysis({
      transcript,
      selectedLanguage,
      caseRef,
      receivedTime,
      operatorNotes,
    });
  };

  return (
    <div className="new-analysis-workspace">
      {/* Page Header */}
      <div className="analysis-workspace-header">
        <div className="workspace-title-block">
          <div className="badge-new-glow">
            <Sparkles size={14} /> Intake Studio
          </div>
          <h1 className="workspace-heading">New Transcript Analysis</h1>
          <p className="workspace-subheading">
            Turn conversations into structured, explainable case assessments.
          </p>
        </div>

        {/* Sample Selection Quick Menu */}
        <div className="sample-selector-card">
          <div className="sample-selector-label">
            <Sparkles size={14} color="#00e5ff" />
            <span>Load Fictional Sample:</span>
          </div>
          <select 
            className="sample-select-dropdown"
            value={selectedSampleId}
            onChange={(e) => handleSelectSample(e.target.value)}
          >
            <option value="">-- Choose from 6 Fictional Demonstration Transcripts --</option>
            {sampleTranscripts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.language})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Privacy Warning Alert */}
      <div className="privacy-warning-box">
        <div className="privacy-icon-col">
          <ShieldAlert size={20} color="#f59e0b" />
        </div>
        <div className="privacy-content">
          <strong>Confidentiality & Data Protection Notice:</strong>
          <p>
            Please use fictional or anonymized transcripts for demonstration and testing. 
            Do not enter real personal identity numbers (PII), aadhaar records, or unredacted citizen numbers. 
            All processing is performed strictly frontend-only within your browser session.
          </p>
        </div>
      </div>

      {/* Main Analysis Form */}
      <form onSubmit={handleSubmit} className="analysis-form-grid">
        {/* Left Column: Transcript Input & Controls */}
        <div className="form-main-col">
          <div className="editor-card">
            <div className="editor-top-bar">
              <div className="editor-title-group">
                <FileText size={16} color="#00e5ff" />
                <span className="editor-title">Caller Voice / Chat Transcript</span>
              </div>

              <div className="editor-actions">
                {/* Language Selector */}
                <div className="lang-picker-wrapper">
                  <Languages size={14} className="picker-icon" />
                  <select
                    className="lang-picker-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="Auto-detect">Auto-detect Language</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="English">English</option>
                    <option value="Hinglish">Hinglish</option>
                    <option value="Mixed/Other">Mixed / Other Regional</option>
                  </select>
                </div>

                {/* Clear Button */}
                <button
                  type="button"
                  className="btn-clear-transcript"
                  onClick={handleClearTranscript}
                  title="Clear transcript text"
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Transcript Textarea */}
            <div className="textarea-container">
              <textarea
                className={`transcript-textarea ${validationError ? 'has-error' : ''}`}
                rows={12}
                placeholder="Paste helpline call transcript, police dispatch intake notes, or select a sample from the dropdown above... (e.g. 'Bhaiya please help karo, mere ghar ke bahar do unknown log khade hain...')"
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  if (validationError) setValidationError('');
                }}
              />
            </div>

            {/* Footer with Counters and Error message */}
            <div className="editor-bottom-bar">
              <div className="counters-group">
                <span className="counter-item"><strong>{wordCount}</strong> words</span>
                <span className="counter-separator">•</span>
                <span className="counter-item"><strong>{charCount}</strong> characters</span>
              </div>

              {validationError && (
                <div className="inline-validation-error">
                  <AlertCircle size={15} />
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Analyze Button */}
        <div className="form-side-col">
          <div className="metadata-card">
            <h3 className="side-card-title">Optional Incident Metadata</h3>
            
            <div className="meta-field-group">
              <label htmlFor="caseRefInput">
                <Hash size={13} /> Case Reference (Optional)
              </label>
              <input
                id="caseRefInput"
                type="text"
                className="meta-input"
                placeholder="e.g. REF-2026-ST01 or CS-2026-742"
                value={caseRef}
                onChange={(e) => setCaseRef(e.target.value)}
              />
              <span className="field-hint">Used for linking repeat complaints or external tickets</span>
            </div>

            <div className="meta-field-group">
              <label htmlFor="receivedTimeInput">
                <Clock size={13} /> Intake Time (Optional)
              </label>
              <input
                id="receivedTimeInput"
                type="text"
                className="meta-input"
                placeholder="e.g. 22:15 or Just Now"
                value={receivedTime}
                onChange={(e) => setReceivedTime(e.target.value)}
              />
              <span className="field-hint">Defaults to current workstation timestamp</span>
            </div>

            <div className="meta-field-group">
              <label htmlFor="operatorNotesInput">
                <Edit3 size={13} /> Intake Operator Notes (Optional)
              </label>
              <textarea
                id="operatorNotesInput"
                className="meta-textarea"
                rows={3}
                placeholder="Add operator observations regarding caller tone, acoustic distress, or background noise..."
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
              />
            </div>

            <div className="ai-disclosure-banner">
              <HelpCircle size={14} color="#00e5ff" />
              <span>
                Demonstration triage powered by deterministic parsing rules. No external APIs invoked.
              </span>
            </div>

            {/* Prominent Analyze Button */}
            <button
              type="submit"
              className="btn-primary btn-submit-analyze"
            >
              <Sparkles size={18} />
              <span>Analyze Transcript</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
