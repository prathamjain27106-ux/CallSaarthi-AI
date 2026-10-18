import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import Charts from './components/Charts';
import UrgentCasesPanel from './components/UrgentCasesPanel';
import RecentCasesTable from './components/RecentCasesTable';
import CaseReviewModal from './components/CaseReviewModal';
import Homepage from './components/Homepage';
import NewAnalysisPage from './components/NewAnalysisPage';
import AnalysisProcessing from './components/AnalysisProcessing';
import AnalysisResultsPage from './components/AnalysisResultsPage';
import CaseManagementPage from './components/CaseManagementPage';
import CaseDetailsPage from './components/CaseDetailsPage';
import ReportsAnalyticsPage from './components/ReportsAnalyticsPage';
import { 
  ServiceDirectoryView, 
  HelpGuidelinesView, 
  SettingsView 
} from './components/OtherViews';
import { analyzeTranscript } from './utils/analysisEngine';
import { CaseProvider, useCases } from './context/CaseContext';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

function AppContent() {
  const { 
    cases, 
    metrics, 
    activeCaseId, 
    setActiveCaseId, 
    addCase, 
    updateCase, 
    toast 
  } = useCases();

  // Navigation & view states
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'home'
  const [currentTab, setCurrentTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & quick review states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseForReview, setSelectedCaseForReview] = useState(null);

  // Analysis workflow states
  const [analysisSubView, setAnalysisSubView] = useState('editor'); // 'editor' | 'processing' | 'results'
  const [pendingAnalysisPayload, setPendingAnalysisPayload] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Dynamic metrics derived directly from shared CaseContext
  const dynamicMetrics = {
    totalCases: {
      value: metrics.totalCases + 132,
      change: '+18.4%',
      period: 'vs yesterday',
      trend: 'up',
    },
    highPriorityCases: {
      value: metrics.highPriorityCases,
      change: `${metrics.criticalCases} Critical • ${metrics.highCases} High`,
      period: 'urgent attention',
      trend: 'warning',
      criticalCount: metrics.criticalCases,
      highCount: metrics.highCases,
    },
    awaitingReview: {
      value: metrics.awaitingReview,
      change: `${metrics.awaitingReview} cases pending`,
      period: 'active triage queue',
      trend: 'attention',
    },
    casesReviewed: {
      value: metrics.reviewedCases + 120,
      change: '90.1%',
      period: 'completion rate',
      trend: 'positive',
    },
  };

  // Navigate to Case Details
  const handleViewCase = (id) => {
    setActiveCaseId(id);
    setCurrentTab('case-details');
    setViewMode('dashboard');
  };

  // Start analysis trigger from editor
  const handleStartAnalysis = (payload) => {
    setPendingAnalysisPayload(payload);
    setAnalysisSubView('processing');
  };

  // Processing completed trigger
  const handleProcessingComplete = () => {
    if (pendingAnalysisPayload) {
      try {
        const result = analyzeTranscript(pendingAnalysisPayload);
        setAnalysisResult(result);
        setAnalysisSubView('results');
      } catch (err) {
        console.error('Analysis error:', err);
        setAnalysisSubView('editor');
      }
    }
  };

  // Save analyzed case into active triage queue
  const handleSaveAnalyzedCase = (result) => {
    const newCaseItem = {
      id: result.caseId,
      callerName: result.extracted.relevantPeople !== 'Not mentioned' 
        ? result.extracted.relevantPeople.split(',')[0] 
        : 'Citizen Caller (Transcribed)',
      callerPhone: '+91 98200 XXXXX',
      summary: result.summary,
      language: result.detectedLanguage,
      category: result.extracted.incidentType || 'General Helpline Triage',
      suggestedUrgency: result.urgency,
      finalUrgency: result.urgency,
      recommendedService: result.recommendedService,
      confirmedService: result.recommendedService,
      receivedDateTime: result.receivedDateTime,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedTime: result.receivedTime,
      timeAgo: 'Just now',
      status: 'Awaiting Review',
      location: result.extracted.location,
      confidence: result.confidence,
      previousComplaintRef: result.extracted.previousComplaintRef || 'Not mentioned',
      originalTranscript: result.originalTranscript,
      evidenceSpans: result.evidenceSpans,
      keyPhrases: result.evidenceSpans.map((s) => s.text),
      aiNotes: result.urgencyReason,
      operatorNotes: result.operatorNotes || '',
      extracted: result.extracted,
      missingInfoChecklist: [
        { item: 'Caller exact address confirmed', completed: result.extracted.location !== 'Not mentioned' },
        { item: 'Direct phone callback clearance', completed: false },
        { item: 'Immediate field unit alert sent', completed: false },
      ],
      history: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: 'Case Ingested',
          user: 'New Transcript Analysis',
          note: `Suggested urgency: ${result.urgency} (${result.confidence} confidence).`,
        },
      ],
    };

    addCase(newCaseItem);
    setActiveCaseId(newCaseItem.id);
  };

  // Switch to new analysis tab directly from anywhere
  const handleGoToNewAnalysis = () => {
    setCurrentTab('new-analysis');
    setAnalysisSubView('editor');
    setViewMode('dashboard');
  };

  // If in homepage preview mode, show the preserved homepage
  if (viewMode === 'home') {
    return (
      <div className="app-root">
        <header className="home-top-bar">
          <button 
            type="button" 
            className="btn-back-dashboard"
            onClick={() => setViewMode('dashboard')}
          >
            ← Enter Operator Dashboard
          </button>
        </header>
        <Homepage onStartDemo={() => setViewMode('dashboard')} />
      </div>
    );
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setViewMode('dashboard');
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenHome={() => setViewMode('home')}
        awaitingCount={metrics.awaitingReview}
      />

      {/* Main Content Area */}
      <div className="app-main-layout">
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onNewAnalysis={handleGoToNewAnalysis}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="app-content-body">
          {/* 1. OVERVIEW / DASHBOARD TAB */}
          {currentTab === 'overview' && (
            <div className="dashboard-view-fade">
              {/* Top Metric Cards */}
              <MetricCards metrics={dynamicMetrics} />

              {/* Middle Section: Urgent Cases Queue & Triage Charts */}
              <div className="dashboard-middle-grid">
                <div className="urgent-column">
                  <UrgentCasesPanel 
                    cases={cases} 
                    onReviewCase={(c) => handleViewCase(c.id)} 
                  />
                </div>
                <div className="charts-column">
                  <Charts />
                </div>
              </div>

              {/* Bottom Section: Recent Cases Table */}
              <div className="dashboard-table-section">
                <RecentCasesTable
                  cases={cases}
                  searchQuery={searchQuery}
                  onReviewCase={(c) => setSelectedCaseForReview(c)}
                  onViewCase={handleViewCase}
                />
              </div>
            </div>
          )}

          {/* 2. NEW ANALYSIS TAB */}
          {currentTab === 'new-analysis' && (
            <div className="dashboard-view-fade">
              {analysisSubView === 'editor' && (
                <NewAnalysisPage onStartAnalysis={handleStartAnalysis} />
              )}

              {analysisSubView === 'processing' && (
                <AnalysisProcessing
                  onComplete={handleProcessingComplete}
                  onCancel={() => setAnalysisSubView('editor')}
                />
              )}

              {analysisSubView === 'results' && (
                <AnalysisResultsPage
                  result={analysisResult}
                  onBackToEditor={() => setAnalysisSubView('editor')}
                  onSaveCase={handleSaveAnalyzedCase}
                  onNavigateCases={() => setCurrentTab('cases')}
                />
              )}
            </div>
          )}

          {/* 3. CASE MANAGEMENT TAB */}
          {currentTab === 'cases' && (
            <div className="dashboard-view-fade">
              <CaseManagementPage
                onNewAnalysis={handleGoToNewAnalysis}
                onViewCase={handleViewCase}
              />
            </div>
          )}

          {/* 4. CASE DETAILS TAB */}
          {currentTab === 'case-details' && (
            <div className="dashboard-view-fade">
              <CaseDetailsPage
                caseId={activeCaseId || cases[0]?.id}
                onBack={() => setCurrentTab('cases')}
                onNavigateCase={handleViewCase}
              />
            </div>
          )}

          {/* 5. REPORTS & ANALYTICS TAB */}
          {currentTab === 'reports' && (
            <div className="dashboard-view-fade">
              <ReportsAnalyticsPage />
            </div>
          )}

          {/* 6. SERVICE DIRECTORY TAB */}
          {currentTab === 'directory' && <ServiceDirectoryView />}

          {/* 7. HELP & GUIDELINES TAB */}
          {currentTab === 'guidelines' && <HelpGuidelinesView />}

          {/* 8. SETTINGS TAB */}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`floating-toast toast-${toast.type}`}>
          {toast.type === 'info' ? (
            <Info size={16} />
          ) : toast.type === 'error' ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Quick Case Review Modal (from Dashboard quick action) */}
      {selectedCaseForReview && (
        <CaseReviewModal
          caseItem={selectedCaseForReview}
          onClose={() => setSelectedCaseForReview(null)}
          onUpdateStatus={(id, status, notes) => {
            updateCase(id, { status, operatorNotes: notes || selectedCaseForReview.operatorNotes }, `Quick Review: Status marked ${status}`);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CaseProvider>
      <AppContent />
    </CaseProvider>
  );
}
