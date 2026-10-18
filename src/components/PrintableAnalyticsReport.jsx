import React from 'react';
import { Printer, X, Download, ShieldCheck, Info } from 'lucide-react';

export default function PrintableAnalyticsReport({ 
  isOpen, 
  onClose, 
  filters, 
  metrics, 
  insights, 
  cases, 
  urgencyBreakdown,
  categoryBreakdown
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleString([], { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  });

  return (
    <div className="modal-backdrop print-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-dialog printable-report-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header no-print">
          <div className="modal-header-left">
            <h3 className="modal-title">Printable Analytics & Triage Report</h3>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              Preview formatted document before printing or exporting to PDF
            </span>
          </div>
          <div className="modal-header-actions">
            <button type="button" className="btn-primary" onClick={handlePrint}>
              <Printer size={16} /> Print / Save as PDF
            </button>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="printable-report-content" id="printableReportArea">
          {/* Header */}
          <div className="report-doc-header">
            <div className="report-brand">
              <h1>CallSaarthi AI</h1>
              <span>Emergency Helpline Triage Intelligence Platform</span>
            </div>
            <div className="report-meta-box">
              <div><strong>Document:</strong> Triage Workload & Analytics Summary</div>
              <div><strong>Generated:</strong> {currentDate}</div>
              <div><strong>Classification:</strong> Official Demonstration Record</div>
            </div>
          </div>

          <hr className="report-hr" />

          {/* Active Filter Scope */}
          <div className="report-section">
            <h3 className="report-sec-heading">1. Operational Filter Scope</h3>
            <div className="report-filter-tags">
              <span><strong>Date Range:</strong> {filters.dateRange}</span>
              <span><strong>Incident Category:</strong> {filters.category}</span>
              <span><strong>Language:</strong> {filters.language}</span>
              <span><strong>Urgency:</strong> {filters.urgency}</span>
              <span><strong>Cases Evaluated:</strong> {cases.length} records</span>
            </div>
          </div>

          {/* KPI Summary Metrics */}
          <div className="report-section">
            <h3 className="report-sec-heading">2. Executive Summary Metrics</h3>
            <table className="report-data-table">
              <thead>
                <tr>
                  <th>Total Cases</th>
                  <th>Critical / High Priority</th>
                  <th>Awaiting Review</th>
                  <th>Human-Reviewed</th>
                  <th>Awaiting Information</th>
                  <th>Repeat References</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>{metrics.totalCases}</strong></td>
                  <td className="text-critical"><strong>{metrics.highPriority}</strong></td>
                  <td>{metrics.awaitingReview}</td>
                  <td className="text-success">{metrics.reviewed}</td>
                  <td>{metrics.awaitingInfo}</td>
                  <td>{metrics.repeatCount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chart Breakdowns (Tabular for print fidelity) */}
          <div className="report-section">
            <h3 className="report-sec-heading">3. Urgency & Category Distributions</h3>
            <div className="report-two-col">
              <div>
                <h4 className="report-subheading">Urgency Breakdown</h4>
                <table className="report-mini-table">
                  <thead>
                    <tr><th>Urgency Tier</th><th>Count</th><th>Ratio</th></tr>
                  </thead>
                  <tbody>
                    {urgencyBreakdown.map((u) => (
                      <tr key={u.level}>
                        <td>{u.level}</td>
                        <td>{u.count}</td>
                        <td>{u.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="report-subheading">Incident Categories</h4>
                <table className="report-mini-table">
                  <thead>
                    <tr><th>Category</th><th>Count</th></tr>
                  </thead>
                  <tbody>
                    {categoryBreakdown.map((c) => (
                      <tr key={c.category}>
                        <td>{c.category}</td>
                        <td>{c.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Dataset Insights */}
          <div className="report-section">
            <h3 className="report-sec-heading">4. Rule-Based Dataset Insights</h3>
            <ul className="report-insights-list">
              {insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>

          {/* Case Records Table */}
          <div className="report-section">
            <h3 className="report-sec-heading">5. Filtered Case Records Roster</h3>
            <table className="report-cases-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Category</th>
                  <th>Language</th>
                  <th>Suggested</th>
                  <th>Final</th>
                  <th>Confirmed Service</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td><code>{c.id}</code></td>
                    <td>{c.category || 'General Triage'}</td>
                    <td>{c.language}</td>
                    <td>{c.suggestedUrgency || c.urgency}</td>
                    <td><strong>{c.finalUrgency || c.urgency}</strong></td>
                    <td>{c.confirmedService || c.recommendedService}</td>
                    <td>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Prototype Evaluation Disclaimer */}
          <div className="report-section report-footer-disclaimer">
            <h3 className="report-sec-heading">6. Prototype Evaluation & Ground-Truth Disclaimer</h3>
            <p>
              This report represents a frontend-only technology demonstration of CallSaarthi AI. 
              The urgency scoring, entity extraction, and routing suggestions use heuristic rules and have not been benchmarked 
              against an independently annotated clinical ground-truth test corpus. Real-world deployment requires rigorous human-in-the-loop validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
