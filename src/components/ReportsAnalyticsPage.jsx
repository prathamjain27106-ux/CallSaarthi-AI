import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  RotateCcw, 
  Download, 
  Printer, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Languages, 
  ShieldAlert, 
  PhoneCall, 
  HelpCircle, 
  Calendar, 
  Filter, 
  Sparkles, 
  Link as LinkIcon, 
  Info, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  LineChart, 
  Line 
} from 'recharts';
import { useCases } from '../context/CaseContext';
import EvaluationGuideModal from './EvaluationGuideModal';
import PrintableAnalyticsReport from './PrintableAnalyticsReport';

export default function ReportsAnalyticsPage() {
  const { cases, showToast } = useCases();

  // Filters State
  const [dateRange, setDateRange] = useState('ALL'); // 'ALL' | 'LAST_7' | 'LAST_30' | 'LAST_90'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  // Modal States
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Extract unique options dynamically
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(cases.map((c) => c.category).filter(Boolean)));
  }, [cases]);

  const uniqueLanguages = useMemo(() => {
    return Array.from(new Set(cases.map((c) => c.language).filter(Boolean)));
  }, [cases]);

  // Filter cases based on all 4 controls
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      // 1. Date Range
      if (dateRange !== 'ALL') {
        const now = new Date();
        const caseDate = item.receivedDate ? new Date(item.receivedDate) : new Date();
        const diffDays = (now - caseDate) / (1000 * 60 * 60 * 24);

        if (dateRange === 'LAST_7' && diffDays > 7) return false;
        if (dateRange === 'LAST_30' && diffDays > 30) return false;
        if (dateRange === 'LAST_90' && diffDays > 90) return false;
      }

      // 2. Incident Category
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // 3. Language
      if (languageFilter !== 'ALL' && item.language !== languageFilter) {
        return false;
      }

      // 4. Urgency
      if (urgencyFilter !== 'ALL') {
        const itemUrgency = (item.finalUrgency || item.urgency || '').toUpperCase();
        if (itemUrgency !== urgencyFilter) return false;
      }

      return true;
    });
  }, [cases, dateRange, categoryFilter, languageFilter, urgencyFilter]);

  // Reset Filters
  const handleResetFilters = () => {
    setDateRange('ALL');
    setCategoryFilter('ALL');
    setLanguageFilter('ALL');
    setUrgencyFilter('ALL');
  };

  // 1. Metrics Calculation
  const totalAnalyzed = filteredCases.length;
  const criticalCount = filteredCases.filter((c) => (c.finalUrgency || c.urgency) === 'Critical').length;
  const highCount = filteredCases.filter((c) => (c.finalUrgency || c.urgency) === 'High').length;
  const highPriorityTotal = criticalCount + highCount;
  const awaitingReviewCount = filteredCases.filter((c) => c.status === 'Awaiting Review').length;
  const reviewedCount = filteredCases.filter((c) => c.status === 'Reviewed').length;
  const awaitingInfoCount = filteredCases.filter((c) => c.status === 'Awaiting Information').length;
  const repeatCount = filteredCases.filter((c) => c.previousComplaintRef && c.previousComplaintRef !== 'Not mentioned').length;

  // 2. Chart Data: Urgency Distribution
  const urgencyColors = {
    Critical: '#ef4444',
    High: '#f59e0b',
    Medium: '#06b6d4',
    Low: '#10b981',
  };

  const urgencyData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    filteredCases.forEach((c) => {
      const u = c.finalUrgency || c.urgency || 'Medium';
      if (counts[u] !== undefined) counts[u] += 1;
      else counts.Medium += 1;
    });

    return Object.entries(counts).map(([level, count]) => ({
      level,
      count,
      percentage: totalAnalyzed > 0 ? Math.round((count / totalAnalyzed) * 100) : 0,
    }));
  }, [filteredCases, totalAnalyzed]);

  // 3. Chart Data: Case Volume Over Time
  const volumeOverTimeData = useMemo(() => {
    const map = {};
    filteredCases.forEach((c) => {
      const dateKey = c.receivedDate || '2026-10-13';
      if (!map[dateKey]) {
        map[dateKey] = { date: dateKey, total: 0, critical: 0 };
      }
      map[dateKey].total += 1;
      if ((c.finalUrgency || c.urgency) === 'Critical') {
        map[dateKey].critical += 1;
      }
    });

    const arr = Object.values(map);
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    return arr;
  }, [filteredCases]);

  // 4. Chart Data: Incident Category Distribution
  const categoryData = useMemo(() => {
    const map = {};
    filteredCases.forEach((c) => {
      const cat = c.category || 'General Triage';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCases]);

  // 5. Chart Data: Language Distribution
  const languageData = useMemo(() => {
    const map = {};
    filteredCases.forEach((c) => {
      const lang = c.language || 'Other';
      map[lang] = (map[lang] || 0) + 1;
    });
    return Object.entries(map)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCases]);

  // 6. Chart Data: Recommended Service Distribution
  const serviceData = useMemo(() => {
    const map = {};
    filteredCases.forEach((c) => {
      const svc = c.confirmedService || c.recommendedService || '112 Unified Emergency';
      map[svc] = (map[svc] || 0) + 1;
    });
    return Object.entries(map)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCases]);

  // 7. Chart Data: Review Status Distribution
  const statusData = useMemo(() => {
    const map = {
      'Awaiting Review': 0,
      'Under Triage': 0,
      'Reviewed': 0,
      'Awaiting Info': 0,
      'Closed': 0,
    };
    filteredCases.forEach((c) => {
      if (c.status === 'Awaiting Information') map['Awaiting Info'] += 1;
      else if (map[c.status] !== undefined) map[c.status] += 1;
      else map['Awaiting Review'] += 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [filteredCases]);

  // 8. Dynamic Dataset Insights Statements
  const datasetInsights = useMemo(() => {
    if (filteredCases.length === 0) {
      return ['No cases available under current filter criteria to generate insights.'];
    }

    const insights = [];

    // Most frequent urgency
    const topUrgency = [...urgencyData].sort((a, b) => b.count - a.count)[0];
    if (topUrgency && topUrgency.count > 0) {
      insights.push(
        `Highest volume priority level is "${topUrgency.level}" with ${topUrgency.count} cases (${topUrgency.percentage}% of filtered workload).`
      );
    }

    // Most frequent language
    if (languageData.length > 0) {
      const topLang = languageData[0];
      const langPct = Math.round((topLang.count / totalAnalyzed) * 100);
      insights.push(
        `Predominant detected language is "${topLang.language}" comprising ${topLang.count} calls (${langPct}% of intake).`
      );
    }

    // Workload awaiting review
    if (awaitingReviewCount > 0) {
      const awaitingPct = Math.round((awaitingReviewCount / totalAnalyzed) * 100);
      insights.push(
        `${awaitingReviewCount} cases currently await human triage confirmation (${awaitingPct}% of active queue).`
      );
    } else {
      insights.push('All evaluated cases in the current view have been reviewed or triaged by operators.');
    }

    // Most frequent service
    if (serviceData.length > 0) {
      const topSvc = serviceData[0];
      insights.push(
        `Most frequently recommended service is "${topSvc.service}" with ${topSvc.count} dispatch matches.`
      );
    }

    // Repeat complaint insights
    if (repeatCount > 0) {
      insights.push(
        `${repeatCount} cases explicitly cite previous ticket references, requiring cross-record verification.`
      );
    } else {
      insights.push('No repeat complaint references cited within the selected filter window.');
    }

    return insights;
  }, [filteredCases, urgencyData, languageData, serviceData, awaitingReviewCount, repeatCount, totalAnalyzed]);

  // CSV Export for filtered cases
  const handleExportFilteredCsv = () => {
    if (filteredCases.length === 0) {
      alert('No cases available to export under current filters.');
      return;
    }

    const headers = [
      'Case ID',
      'Received Date',
      'Language',
      'Incident Category',
      'Suggested Urgency',
      'Final Urgency',
      'Recommended Service',
      'Review Status',
      'Previous Complaint Reference'
    ];

    const escapeCell = (v) => {
      const s = String(v || '');
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : `"${s}"`;
    };

    const rows = filteredCases.map((c) => [
      escapeCell(c.id),
      escapeCell(c.receivedDate || c.receivedDateTime),
      escapeCell(c.language),
      escapeCell(c.category),
      escapeCell(c.suggestedUrgency || c.urgency),
      escapeCell(c.finalUrgency || c.urgency),
      escapeCell(c.confirmedService || c.recommendedService),
      escapeCell(c.status),
      escapeCell(c.previousComplaintRef || 'Not mentioned')
    ]);

    const csvText = [headers.map(escapeCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CallSaarthi_Analytics_Report_${dateRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredCases.length} filtered cases to CSV.`);
  };

  // Custom Dark Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-title">{label || payload[0].name}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="tooltip-item" style={{ color: entry.color || '#00e5ff' }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-page">
      {/* 1. Page Header & Filters Toolbar */}
      <div className="analytics-header-card">
        <div className="analytics-header-top">
          <div>
            <h1 className="analytics-title">Reports & Analytics</h1>
            <p className="analytics-subtitle">
              Understand case trends, review workload, and evaluate prototype performance.
            </p>
          </div>

          <div className="analytics-actions">
            <button
              type="button"
              className="btn-outline-action"
              onClick={() => setIsPrintModalOpen(true)}
              title="Open printable report preview or PDF export"
            >
              <Printer size={15} />
              <span>Printable Report</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleExportFilteredCsv}
              title="Export currently filtered analytics records to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="analytics-filters-bar">
          <div className="analytics-filter-group">
            <label><Calendar size={12} /> Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="ALL">All Time</option>
              <option value="LAST_7">Last 7 Days</option>
              <option value="LAST_30">Last 30 Days</option>
              <option value="LAST_90">Last 90 Days</option>
            </select>
          </div>

          <div className="analytics-filter-group">
            <label><Filter size={12} /> Incident Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="analytics-filter-group">
            <label><Languages size={12} /> Language</label>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
              <option value="ALL">All Languages</option>
              {uniqueLanguages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="analytics-filter-group">
            <label><ShieldAlert size={12} /> Urgency</label>
            <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-clear-analytics-filters"
            onClick={handleResetFilters}
            title="Reset all filter selections"
          >
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 2. Overview KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Total Cases Analyzed</span>
            <div className="kpi-icon-wrap cyan"><PhoneCall size={18} /></div>
          </div>
          <span className="kpi-value">{totalAnalyzed}</span>
          <span className="kpi-subtext">Across active filter window</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Critical & High Priority</span>
            <div className="kpi-icon-wrap red"><ShieldAlert size={18} /></div>
          </div>
          <span className="kpi-value text-critical">{highPriorityTotal}</span>
          <span className="kpi-subtext">{criticalCount} Critical • {highCount} High</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Awaiting Review</span>
            <div className="kpi-icon-wrap amber"><Clock size={18} /></div>
          </div>
          <span className="kpi-value text-warning">{awaitingReviewCount}</span>
          <span className="kpi-subtext">Needs human validation</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Human-Reviewed Cases</span>
            <div className="kpi-icon-wrap green"><CheckCircle2 size={18} /></div>
          </div>
          <span className="kpi-value text-success">{reviewedCount}</span>
          <span className="kpi-subtext">Verified by operator</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Awaiting Information</span>
            <div className="kpi-icon-wrap purple"><HelpCircle size={18} /></div>
          </div>
          <span className="kpi-value">{awaitingInfoCount}</span>
          <span className="kpi-subtext">Pending caller/unit details</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-label">Repeat Complaint Refs</span>
            <div className="kpi-icon-wrap blue"><LinkIcon size={18} /></div>
          </div>
          <span className="kpi-value">{repeatCount}</span>
          <span className="kpi-subtext">Linked to prior tickets</span>
        </div>
      </div>

      {/* 3. Interactive Charts Grid */}
      <div className="charts-dashboard-grid">
        {/* Chart A: Cases by Urgency (Donut) */}
        <div className="analytics-chart-card">
          <div className="chart-header-row">
            <div>
              <h3 className="chart-title">Cases by Urgency</h3>
              <p className="chart-subtitle">Priority breakdown across filtered calls</p>
            </div>
            <span className="badge-tag-count">Live Ratio</span>
          </div>

          <div className="chart-body-wrapper donut-body">
            {totalAnalyzed === 0 ? (
              <div className="chart-empty-state">No cases match the selected filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={urgencyData}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {urgencyData.map((entry) => (
                      <Cell key={entry.level} fill={urgencyColors[entry.level]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(val, entry) => (
                      <span style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>
                        {val} ({entry.payload.count})
                      </span>
                    )} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Case Volume Over Time (Line / Area) */}
        <div className="analytics-chart-card">
          <div className="chart-header-row">
            <div>
              <h3 className="chart-title">Case Volume Over Time</h3>
              <p className="chart-subtitle">Intake volume received per logged date</p>
            </div>
            <span className="badge-tag-count">Timeline</span>
          </div>

          <div className="chart-body-wrapper">
            {volumeOverTimeData.length === 0 ? (
              <div className="chart-empty-state">No timeline points in current filter range.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={volumeOverTimeData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="Cases" 
                    stroke="#00e5ff" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#volGradient)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="critical" 
                    name="Critical" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart C: Incident Category Distribution (Horizontal Bar) */}
        <div className="analytics-chart-card">
          <div className="chart-header-row">
            <div>
              <h3 className="chart-title">Incident Category Distribution</h3>
              <p className="chart-subtitle">Frequency of reported incident domains</p>
            </div>
          </div>

          <div className="chart-body-wrapper">
            {categoryData.length === 0 ? (
              <div className="chart-empty-state">No categories to display.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={10.5} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Cases" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart D: Language Distribution (Bar) */}
        <div className="analytics-chart-card">
          <div className="chart-header-row">
            <div>
              <h3 className="chart-title">Language Distribution</h3>
              <p className="chart-subtitle">Multilingual speech intake breakdown</p>
            </div>
          </div>

          <div className="chart-body-wrapper">
            {languageData.length === 0 ? (
              <div className="chart-empty-state">No language data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={languageData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="language" stroke="#94a3b8" fontSize={10.5} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Calls" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart E: Recommended Service Distribution */}
        <div className="analytics-chart-card">
          <div className="chart-header-row">
            <div>
              <h3 className="chart-title">Recommended Emergency Services</h3>
              <p className="chart-subtitle">Routing agency dispatch distribution</p>
            </div>
          </div>

          <div className="chart-body-wrapper">
            {serviceData.length === 0 ? (
              <div className="chart-empty-state">No service routing data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: 20, left: 45, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="service" stroke="#94a3b8" fontSize={10} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Dispatches" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart F: Review Status Distribution */}
        <div className="analytics-chart-card">
          <div className="chart-header-row">
            <div>
              <h3 className="chart-title">Review Status Distribution</h3>
              <p className="chart-subtitle">Triage progression across pipeline</p>
            </div>
          </div>

          <div className="chart-body-wrapper">
            {statusData.length === 0 ? (
              <div className="chart-empty-state">No status data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Cases" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 4. Prototype Evaluation Panel */}
      <div className="analytics-eval-card">
        <div className="eval-header-row">
          <div>
            <div className="badge-eval-pill">
              <Sparkles size={13} /> Evaluation Benchmark
            </div>
            <h2 className="eval-heading">Prototype Evaluation</h2>
            <p className="eval-subheading">
              Distinguishing computed application statistics from unverified model accuracy metrics.
            </p>
          </div>

          <button
            type="button"
            className="btn-outline-action"
            onClick={() => setIsEvalModalOpen(true)}
          >
            <HelpCircle size={15} color="#00e5ff" />
            <span>Open Evaluation Guide</span>
          </button>
        </div>

        {/* Evaluation Metrics Grid */}
        <div className="eval-metrics-grid">
          <div className="eval-metric-box">
            <span className="eval-metric-name">Urgency Classification Accuracy</span>
            <span className="eval-metric-status text-unverified">Not evaluated yet</span>
            <p className="eval-metric-note">Requires double-blind labeled validation test corpus.</p>
          </div>

          <div className="eval-metric-box">
            <span className="eval-metric-name">High-Priority Case Recall</span>
            <span className="eval-metric-status text-unverified">Not evaluated yet</span>
            <p className="eval-metric-note">TP / (TP + FN) safety ratio unbenchmarked.</p>
          </div>

          <div className="eval-metric-box">
            <span className="eval-metric-name">Information Extraction Accuracy</span>
            <span className="eval-metric-status text-unverified">Not evaluated yet</span>
            <p className="eval-metric-note">Entity slot F1 score requires annotated ground truth.</p>
          </div>

          <div className="eval-metric-box">
            <span className="eval-metric-name">Service Routing Quality</span>
            <span className="eval-metric-status text-unverified">Not evaluated yet</span>
            <p className="eval-metric-note">Clinical routing match percentage unverified.</p>
          </div>

          <div className="eval-metric-box verified-box">
            <span className="eval-metric-name">Test Transcripts In Scope</span>
            <span className="eval-metric-val">{totalAnalyzed} cases</span>
            <p className="eval-metric-note">Active demonstrative records loaded in current view.</p>
          </div>

          <div className="eval-metric-box">
            <span className="eval-metric-name">High-Priority False-Negative Count</span>
            <span className="eval-metric-status text-unverified">Not evaluated yet</span>
            <p className="eval-metric-note">Critical safety misses cannot be measured without ground truth.</p>
          </div>
        </div>

        <div className="eval-footer-disclaimer">
          <Info size={16} color="#00e5ff" className="disclaimer-icon" />
          <span>
            <strong>Scientific & Clinical Integrity Directive:</strong> This frontend application utilizes deterministic rule-based demonstration templates. True clinical accuracy, recall, and routing quality cannot be established from synthetic demonstration data alone without a formal multi-rater evaluation protocol.
          </span>
        </div>
      </div>

      {/* 5. Dataset Insights Section */}
      <div className="analytics-insights-card">
        <div className="insights-header">
          <div className="card-title-with-icon">
            <FileText size={18} color="#00e5ff" />
            <h3 className="insights-title">Dataset Insights</h3>
          </div>
          <span className="insights-tag">Computed Rule-Based Observations</span>
        </div>

        <p className="insights-preamble">
          The following analytical statements describe the currently loaded demonstration dataset and active filter selections. They do not represent real-world national helpline statistics:
        </p>

        <div className="insights-statements-grid">
          {datasetInsights.map((stmt, idx) => (
            <div key={idx} className="insight-item-box">
              <span className="insight-bullet">▸</span>
              <p className="insight-text">{stmt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Guide Modal */}
      <EvaluationGuideModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
      />

      {/* Printable Report Modal */}
      <PrintableAnalyticsReport
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        filters={{
          dateRange,
          category: categoryFilter,
          language: languageFilter,
          urgency: urgencyFilter,
        }}
        metrics={{
          totalCases: totalAnalyzed,
          highPriority: highPriorityTotal,
          awaitingReview: awaitingReviewCount,
          reviewed: reviewedCount,
          awaitingInfo: awaitingInfoCount,
          repeatCount,
        }}
        insights={datasetInsights}
        cases={filteredCases}
        urgencyBreakdown={urgencyData}
        categoryBreakdown={categoryData}
      />
    </div>
  );
}
