import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert, PhoneForwarded } from 'lucide-react';

export default function UrgentCasesPanel({ cases, onReviewCase }) {
  const urgentCases = cases.filter(
    (c) => c.urgency === 'Critical' || (c.urgency === 'High' && c.status === 'Awaiting Review')
  );

  return (
    <div className="urgent-panel-card">
      <div className="urgent-panel-header">
        <div className="urgent-title-left">
          <div className="urgent-icon-pulse">
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div>
            <h3 className="urgent-panel-heading">Immediate Attention Queue</h3>
            <span className="urgent-panel-sub">
              {urgentCases.length} Critical & High-risk cases awaiting triage verification
            </span>
          </div>
        </div>
        <span className="live-pulse-badge">
          <span className="pulse-dot"></span> LIVE
        </span>
      </div>

      <div className="urgent-cases-list">
        {urgentCases.length === 0 ? (
          <div className="no-urgent-cases">
            <ShieldAlert size={28} color="#10b981" />
            <p>No critical triage cases currently pending supervisor review.</p>
          </div>
        ) : (
          urgentCases.map((caseItem) => (
            <div key={caseItem.id} className="urgent-case-item">
              <div className="urgent-case-top">
                <div className="urgent-id-badge-row">
                  <span className="urgent-case-id">{caseItem.id}</span>
                  <span className={`urgency-pill pill-${caseItem.urgency.toLowerCase()}`}>
                    {caseItem.urgency}
                  </span>
                  <span className="language-pill">{caseItem.language}</span>
                </div>
                <div className="urgent-time">
                  <Clock size={12} />
                  <span>{caseItem.time}</span>
                </div>
              </div>

              <div className="urgent-summary">
                {caseItem.summary}
              </div>

              <div className="urgent-case-bottom">
                <div className="recommended-service-tag">
                  <PhoneForwarded size={13} color="#00e5ff" />
                  <span>{caseItem.recommendedService}</span>
                </div>

                <button
                  type="button"
                  className="btn-review-urgent"
                  onClick={() => onReviewCase(caseItem)}
                >
                  <span>Review Case</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
