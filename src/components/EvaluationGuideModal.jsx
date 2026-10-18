import React from 'react';
import { X, BookOpen, AlertTriangle, ShieldCheck, CheckCircle2, Info } from 'lucide-react';

export default function EvaluationGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-dialog evaluation-guide-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-badge warning">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="modal-title">Prototype Evaluation Framework & Methodology</h3>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                Standards for benchmark evaluation with human-reviewed ground truth
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body eval-guide-body">
          {/* Important Prototype Disclaimer */}
          <div className="eval-disclaimer-box">
            <Info size={18} color="#00e5ff" className="disclaimer-icon" />
            <div>
              <strong>Frontend Prototype Heuristic Notice:</strong>
              <p>
                This CallSaarthi AI application uses deterministic demonstration heuristics and templates. 
                Real model performance metrics cannot be established from frontend demonstration data alone. 
                Production deployment requires rigorous blind evaluation against a curated, multi-rater labeled ground-truth corpus.
              </p>
            </div>
          </div>

          <h4 className="eval-section-title">Core Evaluation Measures & Formulas</h4>

          <div className="metric-def-list">
            <div className="metric-def-item">
              <div className="metric-def-head">
                <span className="metric-def-name">1. Urgency Classification Accuracy</span>
                <span className="metric-formula-badge">Correct / Total</span>
              </div>
              <p className="metric-def-desc">
                Calculated as the total number of correct urgency predictions divided by total evaluated predictions across all priority tiers (Critical, High, Medium, Low).
              </p>
              <div className="metric-formula-box">
                <code>Accuracy = (True Critical + True High + True Medium + True Low) / N_Total</code>
              </div>
            </div>

            <div className="metric-def-item">
              <div className="metric-def-head">
                <span className="metric-def-name">2. High-Priority Case Recall (Safety Critical)</span>
                <span className="metric-formula-badge">TP / (TP + FN)</span>
              </div>
              <p className="metric-def-desc">
                The proportion of actual high-priority emergencies that the system successfully identifies. Critical for emergency helplines where missed cases carry high risk.
              </p>
              <div className="metric-formula-box">
                <code>Recall_HighPriority = Correctly Identified High-Priority Cases / All Ground-Truth High-Priority Cases</code>
              </div>
            </div>

            <div className="metric-def-item">
              <div className="metric-def-head">
                <span className="metric-def-name">3. Information Extraction Accuracy</span>
                <span className="metric-formula-badge">Field Match F1</span>
              </div>
              <p className="metric-def-desc">
                Correct extracted slots (location, time, caller identity, threat cues) divided by total evaluated entity fields, scored using exact and partial token overlap matching.
              </p>
              <div className="metric-formula-box">
                <code>IE_Accuracy = Correctly Extracted Attribute Slots / Total Target Attribute Slots</code>
              </div>
            </div>

            <div className="metric-def-item">
              <div className="metric-def-head">
                <span className="metric-def-name">4. Emergency Service Routing Quality</span>
                <span className="metric-formula-badge">Routing Match %</span>
              </div>
              <p className="metric-def-desc">
                The percentage of cases where the suggested emergency service matches the accepted ground-truth agency (108, 1091, 1098, 14416, 112) under double-blind clinical review.
              </p>
              <div className="metric-formula-box">
                <code>Routing Quality = (Matched Agency Recommendations / Total Evaluated Cases) × 100%</code>
              </div>
            </div>

            <div className="metric-def-item">
              <div className="metric-def-head">
                <span className="metric-def-name">5. False Negatives (Critical Safety Violations)</span>
                <span className="metric-formula-badge">Target: 0</span>
              </div>
              <p className="metric-def-desc">
                Emergency calls that are ground-truth Critical or High-priority but were incorrectly classified below threshold as Medium or Low. In life-critical systems, false negatives must be minimized through human-in-the-loop validation.
              </p>
            </div>
          </div>

          <div className="eval-protocol-notes">
            <h5>Recommended Evaluation Protocol:</h5>
            <ol>
              <li>Curate a minimum of 500 anonymized multilingual transcripts spanning regional dialects.</li>
              <li>Employ at least two certified emergency triage supervisors for independent ground-truth labeling.</li>
              <li>Measure inter-annotator agreement (Cohen's Kappa &gt; 0.85).</li>
              <li>Compute stratified performance across Hindi, Hinglish, English, and regional languages.</li>
            </ol>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Close Evaluation Guide
          </button>
        </div>
      </div>
    </div>
  );
}
