import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  PlusCircle, 
  Eye, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Link as LinkIcon, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { exportCasesToCsv } from '../utils/csvExport';
import ConfirmationModal from './ConfirmationModal';

export default function CaseManagementPage({ 
  onNewAnalysis, 
  onViewCase 
}) {
  const { cases, metrics, deleteCase, resetDemoData, showToast } = useCases();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [repeatFilter, setRepeatFilter] = useState('ALL'); // 'ALL' | 'REPEAT_ONLY' | 'NEW_ONLY'
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST' | 'OLDEST' | 'URGENCY_HIGH' | 'URGENCY_LOW'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedCaseId, setCopiedCaseId] = useState(null);

  // Extract unique options for filter dropdowns dynamically
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(cases.map((c) => c.category).filter(Boolean)));
  }, [cases]);

  const uniqueLanguages = useMemo(() => {
    return Array.from(new Set(cases.map((c) => c.language).filter(Boolean)));
  }, [cases]);

  const uniqueServices = useMemo(() => {
    return Array.from(new Set(cases.map((c) => c.confirmedService || c.recommendedService).filter(Boolean)));
  }, [cases]);

  // Combined filtering logic
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      // 1. Text Search across ID, Summary, Category, Language, Service, Previous Ref
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          item.id.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          (item.category && item.category.toLowerCase().includes(query)) ||
          item.language.toLowerCase().includes(query) ||
          (item.recommendedService && item.recommendedService.toLowerCase().includes(query)) ||
          (item.confirmedService && item.confirmedService.toLowerCase().includes(query)) ||
          (item.previousComplaintRef && item.previousComplaintRef.toLowerCase().includes(query)) ||
          (item.location && item.location.toLowerCase().includes(query)) ||
          (item.callerName && item.callerName.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // 2. Urgency Filter (compares against finalUrgency or suggested urgency)
      if (urgencyFilter !== 'ALL') {
        const itemUrgency = (item.finalUrgency || item.urgency || '').toUpperCase();
        if (itemUrgency !== urgencyFilter) return false;
      }

      // 3. Category Filter
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // 4. Language Filter
      if (languageFilter !== 'ALL' && item.language !== languageFilter) {
        return false;
      }

      // 5. Status Filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // 6. Service Filter
      if (serviceFilter !== 'ALL') {
        const svc = item.confirmedService || item.recommendedService;
        if (svc !== serviceFilter) return false;
      }

      // 7. Repeat Complaint Filter
      if (repeatFilter === 'REPEAT_ONLY') {
        if (!item.previousComplaintRef || item.previousComplaintRef === 'Not mentioned') {
          return false;
        }
      } else if (repeatFilter === 'NEW_ONLY') {
        if (item.previousComplaintRef && item.previousComplaintRef !== 'Not mentioned') {
          return false;
        }
      }

      // 8. Date Range Filter
      if (dateRangeFilter !== 'ALL') {
        const now = new Date();
        const caseDate = item.receivedDate ? new Date(item.receivedDate) : new Date();
        const diffDays = (now - caseDate) / (1000 * 60 * 60 * 24);

        if (dateRangeFilter === 'TODAY') {
          const todayStr = now.toISOString().split('T')[0];
          if (item.receivedDate !== todayStr) return false;
        } else if (dateRangeFilter === 'PAST_7_DAYS') {
          if (diffDays > 7) return false;
        } else if (dateRangeFilter === 'PAST_30_DAYS') {
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [
    cases,
    searchQuery,
    urgencyFilter,
    categoryFilter,
    languageFilter,
    statusFilter,
    serviceFilter,
    repeatFilter,
    dateRangeFilter,
  ]);

  // Sorting
  const sortedCases = useMemo(() => {
    const list = [...filteredCases];
    const urgencyWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

    list.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.receivedDateTime || 0) - new Date(a.receivedDateTime || 0);
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.receivedDateTime || 0) - new Date(b.receivedDateTime || 0);
      }
      if (sortBy === 'URGENCY_HIGH') {
        const uA = urgencyWeight[(a.finalUrgency || a.urgency || '').toUpperCase()] || 0;
        const uB = urgencyWeight[(b.finalUrgency || b.urgency || '').toUpperCase()] || 0;
        return uB - uA;
      }
      if (sortBy === 'URGENCY_LOW') {
        const uA = urgencyWeight[(a.finalUrgency || a.urgency || '').toUpperCase()] || 0;
        const uB = urgencyWeight[(b.finalUrgency || b.urgency || '').toUpperCase()] || 0;
        return uA - uB;
      }
      return 0;
    });
    return list;
  }, [filteredCases, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCases.slice(start, start + pageSize);
  }, [sortedCases, currentPage, pageSize]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('ALL');
    setCategoryFilter('ALL');
    setLanguageFilter('ALL');
    setStatusFilter('ALL');
    setServiceFilter('ALL');
    setDateRangeFilter('ALL');
    setRepeatFilter('ALL');
    setSortBy('NEWEST');
    setCurrentPage(1);
  };

  // Copy Case ID to clipboard
  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedCaseId(id);
    showToast(`Copied case ID ${id} to clipboard.`);
    setTimeout(() => setCopiedCaseId(null), 1500);
  };

  // Badge helpers
  const getUrgencyBadge = (urgency, isFinal = false) => {
    const u = (urgency || '').toUpperCase();
    let badgeClass = 'badge-low';
    if (u === 'CRITICAL') badgeClass = 'badge-critical';
    else if (u === 'HIGH') badgeClass = 'badge-high';
    else if (u === 'MEDIUM') badgeClass = 'badge-medium';

    return (
      <span className={`urgency-badge ${badgeClass} ${isFinal ? 'final-badge' : ''}`}>
        {urgency}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Awaiting Review':
        return <span className="status-pill status-awaiting"><Clock size={11} /> Awaiting Review</span>;
      case 'Under Triage':
        return <span className="status-pill status-triage"><AlertTriangle size={11} /> Under Triage</span>;
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
    <div className="case-management-page">
      {/* 1. Header & Metric Summary Bar */}
      <div className="cm-header-card">
        <div className="cm-header-top">
          <div>
            <h1 className="cm-title">Case Management</h1>
            <p className="cm-subtitle">Track, review, and manage helpline triage cases.</p>
          </div>

          <div className="cm-header-actions">
            <button
              type="button"
              className="btn-outline-action"
              onClick={() => setShowResetConfirm(true)}
              title="Reset dataset to initial 10 demo cases"
            >
              <RotateCcw size={14} />
              <span>Reset Demo Data</span>
            </button>

            <button
              type="button"
              className="btn-outline-action"
              onClick={() => exportCasesToCsv(filteredCases)}
              title="Download currently filtered cases as CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={onNewAnalysis}
            >
              <PlusCircle size={16} />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Summary Cards */}
        <div className="cm-metrics-bar">
          <div className="cm-metric-item">
            <span className="cm-metric-label">Total Cases</span>
            <span className="cm-metric-val">{metrics.totalCases}</span>
          </div>
          <div className="cm-metric-item">
            <span className="cm-metric-label">Critical & High Priority</span>
            <span className="cm-metric-val text-critical">{metrics.highPriorityCases}</span>
          </div>
          <div className="cm-metric-item">
            <span className="cm-metric-label">Awaiting Review</span>
            <span className="cm-metric-val text-warning">{metrics.awaitingReview}</span>
          </div>
          <div className="cm-metric-item">
            <span className="cm-metric-label">Reviewed Cases</span>
            <span className="cm-metric-val text-success">{metrics.reviewedCases}</span>
          </div>
          <div className="cm-metric-item">
            <span className="cm-metric-label">Closed Cases</span>
            <span className="cm-metric-val text-muted">{metrics.closedCases}</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filters Toolbar */}
      <div className="cm-filters-card">
        {/* Top Search Bar */}
        <div className="cm-search-row">
          <div className="cm-search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="cm-search-input"
              placeholder="Search across case ID, summary, category, language, service, or previous complaint..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="cm-result-count-badge">
            Showing <strong>{filteredCases.length}</strong> of <strong>{cases.length}</strong> cases
          </div>
        </div>

        {/* Filter Selectors Grid */}
        <div className="cm-filter-selectors-grid">
          {/* Urgency */}
          <div className="filter-select-group">
            <label>Urgency Level</label>
            <select
              value={urgencyFilter}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Incident Category */}
          <div className="filter-select-group">
            <label>Incident Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="filter-select-group">
            <label>Language</label>
            <select
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Languages</option>
              {uniqueLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Review Status */}
          <div className="filter-select-group">
            <label>Review Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Awaiting Review">Awaiting Review</option>
              <option value="Under Triage">Under Triage</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Awaiting Information">Awaiting Information</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Service */}
          <div className="filter-select-group">
            <label>Recommended Service</label>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Services</option>
              {uniqueServices.map((svc) => (
                <option key={svc} value={svc}>{svc}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="filter-select-group">
            <label>Date Range</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today Only</option>
              <option value="PAST_7_DAYS">Past 7 Days</option>
              <option value="PAST_30_DAYS">Past 30 Days</option>
            </select>
          </div>

          {/* Repeat Complaints */}
          <div className="filter-select-group">
            <label>Repeat / Follow-up</label>
            <select
              value={repeatFilter}
              onChange={(e) => {
                setRepeatFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Reports</option>
              <option value="REPEAT_ONLY">Repeat Complaints Only</option>
              <option value="NEW_ONLY">New Cases Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-select-group">
            <label>Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="URGENCY_HIGH">Urgency: Critical First</option>
              <option value="URGENCY_LOW">Urgency: Low First</option>
            </select>
          </div>
        </div>

        {/* Filter Clear Bar */}
        <div className="cm-filter-footer-bar">
          <button
            type="button"
            className="btn-clear-filters"
            onClick={handleClearFilters}
          >
            <RotateCcw size={13} />
            <span>Clear All Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Cases Table */}
      <div className="cm-table-card">
        <div className="table-responsive">
          <table className="cases-table cm-cases-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Incident Summary</th>
                <th>Language</th>
                <th>Incident Category</th>
                <th>Suggested Urgency</th>
                <th>Final Urgency</th>
                <th>Recommended Service</th>
                <th>Received Date & Time</th>
                <th>Review Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-table-cell">
                    <div className="empty-state">
                      <Filter size={32} color="#94a3b8" />
                      <h4>No matching helpline cases found</h4>
                      <p>Try adjusting your search criteria, urgency level, or filter combinations.</p>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={handleClearFilters}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCases.map((item) => (
                  <tr 
                    key={item.id} 
                    className="cm-table-row clickable-row"
                    onClick={() => onViewCase(item.id)}
                  >
                    {/* Case ID */}
                    <td className="case-id-cell">
                      <div className="id-with-copy">
                        <span className="case-id-text">{item.id}</span>
                        <button
                          type="button"
                          className="btn-copy-id"
                          onClick={(e) => handleCopyId(e, item.id)}
                          title="Copy Case ID"
                        >
                          {copiedCaseId === item.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        </button>
                      </div>
                      {item.previousComplaintRef && item.previousComplaintRef !== 'Not mentioned' && (
                        <div className="repeat-tag-pill">
                          <LinkIcon size={10} />
                          <span>Ref: {item.previousComplaintRef}</span>
                        </div>
                      )}
                    </td>

                    {/* Summary */}
                    <td className="summary-cell">
                      <div className="summary-text" title={item.summary}>
                        {item.summary}
                      </div>
                      <div className="caller-meta">
                        <span>{item.location || 'Location unverified'}</span>
                      </div>
                    </td>

                    {/* Language */}
                    <td>
                      <span className="lang-tag">{item.language}</span>
                    </td>

                    {/* Incident Category */}
                    <td>
                      <span className="category-pill">{item.category || 'General Triage'}</span>
                    </td>

                    {/* Suggested Urgency */}
                    <td>
                      {getUrgencyBadge(item.suggestedUrgency || item.urgency)}
                    </td>

                    {/* Final Urgency */}
                    <td>
                      {getUrgencyBadge(item.finalUrgency || item.urgency, true)}
                    </td>

                    {/* Recommended Service */}
                    <td className="service-cell">
                      <span className="service-name" title={item.confirmedService || item.recommendedService}>
                        {item.confirmedService || item.recommendedService}
                      </span>
                    </td>

                    {/* Received Date & Time */}
                    <td className="time-cell">
                      <span>{item.receivedDateTime || `${item.receivedDate} ${item.receivedTime}`}</span>
                    </td>

                    {/* Review Status */}
                    <td>
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="text-right actions-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="row-action-buttons">
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onViewCase(item.id)}
                          title="View Case Details"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          className="btn-table-action-delete"
                          onClick={() => setCaseToDelete(item)}
                          title="Delete Case Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {sortedCases.length > 0 && (
          <div className="cm-pagination-bar">
            <div className="page-size-selector">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>cases per page</span>
            </div>

            <div className="pagination-controls">
              <span className="page-indicator">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deleting Case */}
      {caseToDelete && (
        <ConfirmationModal
          isOpen={Boolean(caseToDelete)}
          title="Delete Case Record"
          message={`Are you sure you want to delete case ${caseToDelete.id}? This demonstration action cannot be undone.`}
          confirmLabel="Delete Case"
          isDestructive={true}
          onConfirm={() => deleteCase(caseToDelete.id)}
          onCancel={() => setCaseToDelete(null)}
        />
      )}

      {/* Confirmation Dialog for Resetting Demo Data */}
      {showResetConfirm && (
        <ConfirmationModal
          isOpen={showResetConfirm}
          title="Reset Demo Dataset"
          message="Are you sure you want to reset all cases to the default demonstration dataset? Any custom analysis cases and status modifications will be re-initialized."
          confirmLabel="Reset Demo Data"
          isDestructive={true}
          onConfirm={resetDemoData}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}
