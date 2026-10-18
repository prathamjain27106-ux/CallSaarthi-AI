import React, { useState } from 'react';
import { 
  Eye, 
  Filter, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function RecentCasesTable({ cases, searchQuery, onReviewCase, onViewCase }) {
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  // Filter cases based on urgency tab and search query
  const filteredCases = cases.filter((item) => {
    const itemUrgency = (item.finalUrgency || item.urgency || '').toUpperCase();
    const matchesFilter = 
      urgencyFilter === 'ALL' ||
      (urgencyFilter === 'AWAITING' && item.status === 'Awaiting Review') ||
      itemUrgency === urgencyFilter;

    if (!matchesFilter) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.language.toLowerCase().includes(query) ||
      (item.recommendedService && item.recommendedService.toLowerCase().includes(query)) ||
      (item.confirmedService && item.confirmedService.toLowerCase().includes(query)) ||
      (item.callerName && item.callerName.toLowerCase().includes(query)) ||
      (item.location && item.location.toLowerCase().includes(query)) ||
      (item.previousComplaintRef && item.previousComplaintRef.toLowerCase().includes(query))
    );
  });

  const getUrgency = (item) => item.finalUrgency || item.urgency || 'Medium';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Awaiting Review':
        return <span className="status-pill status-awaiting"><Clock size={11} /> Awaiting Review</span>;
      case 'Under Triage':
        return <span className="status-pill status-triage"><AlertCircle size={11} /> Under Triage</span>;
      case 'Reviewed':
        return <span className="status-pill status-reviewed"><CheckCircle2 size={11} /> Reviewed</span>;
      case 'Awaiting Information':
        return <span className="status-pill status-awaiting-info"><Clock size={11} /> Awaiting Info</span>;
      case 'Closed':
        return <span className="status-pill status-closed">Closed</span>;
      default:
        return <span className="status-pill">{status}</span>;
    }
  };

  return (
    <div className="recent-cases-card">
      <div className="table-header-row">
        <div>
          <h3 className="table-title">Recent Helpline Calls</h3>
          <p className="table-subtitle">Live stream of incoming helpline cases evaluated by triage models</p>
        </div>

        {/* Filter Tabs */}
        <div className="table-filter-tabs">
          <button
            type="button"
            className={`filter-tab ${urgencyFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setUrgencyFilter('ALL')}
          >
            All ({cases.length})
          </button>
          <button
            type="button"
            className={`filter-tab tab-critical ${urgencyFilter === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setUrgencyFilter('CRITICAL')}
          >
            Critical ({cases.filter((c) => getUrgency(c) === 'Critical').length})
          </button>
          <button
            type="button"
            className={`filter-tab tab-high ${urgencyFilter === 'HIGH' ? 'active' : ''}`}
            onClick={() => setUrgencyFilter('HIGH')}
          >
            High ({cases.filter((c) => getUrgency(c) === 'High').length})
          </button>
          <button
            type="button"
            className={`filter-tab tab-medium ${urgencyFilter === 'MEDIUM' ? 'active' : ''}`}
            onClick={() => setUrgencyFilter('MEDIUM')}
          >
            Medium ({cases.filter((c) => getUrgency(c) === 'Medium').length})
          </button>
          <button
            type="button"
            className={`filter-tab tab-low ${urgencyFilter === 'LOW' ? 'active' : ''}`}
            onClick={() => setUrgencyFilter('LOW')}
          >
            Low ({cases.filter((c) => getUrgency(c) === 'Low').length})
          </button>
          <button
            type="button"
            className={`filter-tab ${urgencyFilter === 'AWAITING' ? 'active' : ''}`}
            onClick={() => setUrgencyFilter('AWAITING')}
          >
            Awaiting Review ({cases.filter((c) => c.status === 'Awaiting Review').length})
          </button>
        </div>
      </div>

      {/* Table responsive container */}
      <div className="table-responsive">
        <table className="cases-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Summary & Location</th>
              <th>Language</th>
              <th>Urgency</th>
              <th>Recommended Service</th>
              <th>Time</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table-cell">
                  <div className="empty-state">
                    <Filter size={24} color="#94a3b8" />
                    <p>No cases match the selected filter or search criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCases.map((caseItem) => {
                const urgency = getUrgency(caseItem);
                return (
                  <tr 
                    key={caseItem.id} 
                    className={`table-row-${urgency.toLowerCase()} clickable-row`}
                    onClick={() => onViewCase ? onViewCase(caseItem.id) : (onReviewCase && onReviewCase(caseItem))}
                  >
                    <td className="case-id-cell">
                      <span className="case-id-text">{caseItem.id}</span>
                    </td>
                    <td className="summary-cell">
                      <div className="summary-text" title={caseItem.summary}>
                        {caseItem.summary}
                      </div>
                      <div className="caller-meta">
                        <MapPin size={11} className="meta-icon" />
                        <span>{caseItem.location}</span>
                      </div>
                    </td>
                    <td>
                      <span className="lang-tag">{caseItem.language}</span>
                    </td>
                    <td>
                      <span className={`urgency-badge badge-${urgency.toLowerCase()}`}>
                        {urgency}
                      </span>
                    </td>
                    <td className="service-cell">
                      <span className="service-name">{caseItem.confirmedService || caseItem.recommendedService}</span>
                    </td>
                    <td className="time-cell">
                      <span>{caseItem.timeAgo || caseItem.time}</span>
                    </td>
                    <td>
                      {getStatusBadge(caseItem.status)}
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-review-action"
                        onClick={() => onViewCase ? onViewCase(caseItem.id) : (onReviewCase && onReviewCase(caseItem))}
                        title="View case details"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
