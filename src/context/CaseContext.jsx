import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialCases } from '../data/mockCases';

const CaseContext = createContext(null);
const STORAGE_KEY = 'callsaarthi_cases_v2';

export function CaseProvider({ children }) {
  const [cases, setCases] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load cases from localStorage:', err);
    }
    return initialCases;
  });

  const [activeCaseId, setActiveCaseId] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (err) {
      console.error('Failed to save cases to localStorage:', err);
    }
  }, [cases]);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && curr.message === message ? null : curr));
    }, 3500);
  };

  // Helper to format current timestamp
  const getTimestamp = () => {
    const d = new Date();
    return d.toISOString().replace('T', ' ').substring(0, 19);
  };

  // Add a newly analyzed case
  const addCase = (caseData) => {
    setCases((prev) => {
      // Check if case with identical ID already exists
      const exists = prev.some((c) => c.id === caseData.id);
      if (exists) {
        showToast(`Case ${caseData.id} is already in the system.`, 'info');
        return prev;
      }

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newCase = {
        ...caseData,
        suggestedUrgency: caseData.suggestedUrgency || caseData.urgency || 'Medium',
        finalUrgency: caseData.finalUrgency || caseData.urgency || 'Medium',
        recommendedService: caseData.recommendedService || '112 Unified Emergency Response',
        confirmedService: caseData.confirmedService || caseData.recommendedService || '112 Unified Emergency Response',
        receivedDate: caseData.receivedDate || dateStr,
        receivedTime: caseData.receivedTime || timeStr,
        receivedDateTime: caseData.receivedDateTime || `${dateStr} ${timeStr}`,
        timeAgo: 'Just now',
        status: caseData.status || 'Awaiting Review',
        history: caseData.history || [
          {
            timestamp: getTimestamp(),
            action: 'Case Ingested',
            user: 'Operator (Intake Studio)',
            note: 'Ingested via New Transcript Analysis module.',
          },
        ],
      };

      showToast(`Case ${newCase.id} successfully added to database.`);
      return [newCase, ...prev];
    });
  };

  // Update existing case
  const updateCase = (id, updates, auditNote = '') => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        const newHistory = [...(c.history || [])];
        if (auditNote) {
          newHistory.push({
            timestamp: getTimestamp(),
            action: updates.status ? `Status changed to ${updates.status}` : 'Case Record Updated',
            user: 'Ananya Sharma (Triage Officer)',
            note: auditNote,
          });
        }

        return {
          ...c,
          ...updates,
          history: newHistory,
        };
      })
    );
    showToast(`Case ${id} updated.`);
  };

  // Delete case with notification
  const deleteCase = (id) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
    if (activeCaseId === id) {
      setActiveCaseId(null);
    }
    showToast(`Case ${id} was deleted from the demo database.`, 'info');
  };

  // Reset to default demo data
  const resetDemoData = () => {
    setCases(initialCases);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCases));
    } catch (err) {
      console.error(err);
    }
    showToast('Demo dataset reset to initial 10 preloaded cases.');
  };

  // Look up case by ID
  const getCaseById = (id) => {
    return cases.find((c) => c.id === id) || null;
  };

  // Check repeat complaint match
  const getReferencedCase = (refString) => {
    if (!refString || refString === 'Not mentioned') return null;
    const clean = refString.trim().toUpperCase();
    return cases.find((c) => c.id.toUpperCase() === clean) || null;
  };

  // Dynamic metrics derived directly from current cases
  const criticalCount = cases.filter((c) => (c.finalUrgency || c.urgency) === 'Critical').length;
  const highCount = cases.filter((c) => (c.finalUrgency || c.urgency) === 'High').length;
  const awaitingCount = cases.filter((c) => c.status === 'Awaiting Review').length;
  const reviewedCount = cases.filter((c) => c.status === 'Reviewed').length;
  const closedCount = cases.filter((c) => c.status === 'Closed').length;

  const metrics = {
    totalCases: cases.length,
    criticalCases: criticalCount,
    highCases: highCount,
    highPriorityCases: criticalCount + highCount,
    awaitingReview: awaitingCount,
    reviewedCases: reviewedCount,
    closedCases: closedCount,
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        metrics,
        activeCaseId,
        setActiveCaseId,
        addCase,
        updateCase,
        deleteCase,
        resetDemoData,
        getCaseById,
        getReferencedCase,
        toast,
        showToast,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
}
