import React, { useEffect, useState } from 'react';
import { 
  FileSearch, 
  Brain, 
  AlertTriangle, 
  PhoneForwarded, 
  FileCheck, 
  CheckCircle2, 
  Loader2,
  XCircle
} from 'lucide-react';

export default function AnalysisProcessing({ onComplete, onCancel }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(12);

  const stages = [
    { title: 'Reading Transcript', icon: FileSearch, detail: 'Parsing language tokens and speech utterances...' },
    { title: 'Extracting Incident Details', icon: Brain, detail: 'Identifying temporal, geographical, and personnel entities...' },
    { title: 'Assessing Urgency', icon: AlertTriangle, detail: 'Evaluating safety threats, distress cues, and medical indicators...' },
    { title: 'Matching Services', icon: PhoneForwarded, detail: 'Routing to 108, 1091, 1098, 14416 or national helplines...' },
    { title: 'Preparing Report', icon: FileCheck, detail: 'Synthesizing explainable evidence spans and summary...' },
  ];

  useEffect(() => {
    // Step timings
    const stepDuration = 550; // ms per step
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= stages.length) {
          clearInterval(interval);
          setProgressPercent(100);
          setTimeout(() => {
            onComplete();
          }, 450);
          return stages.length - 1;
        }
        setProgressPercent(Math.round(((next + 1) / stages.length) * 100));
        return next;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onComplete, stages.length]);

  return (
    <div className="processing-overlay-container">
      <div className="processing-card">
        {/* Glow & Animation Ring */}
        <div className="processing-visual-header">
          <div className="radar-spinner">
            <div className="radar-circle-outer"></div>
            <div className="radar-circle-inner"></div>
            <Loader2 size={38} className="spinner-icon" />
          </div>
          <h2 className="processing-heading">Triage Assessment in Progress</h2>
          <p className="processing-subheading">
            Running deterministic linguistic and clinical heuristics on submitted transcript
          </p>
        </div>

        {/* Overall Progress Bar */}
        <div className="overall-progress-bar-wrap">
          <div className="progress-info-row">
            <span className="current-stage-name">
              Stage {currentStepIndex + 1} of {stages.length}: {stages[currentStepIndex].title}
            </span>
            <span className="progress-percentage-num">{progressPercent}%</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step-by-Step Stage Timeline */}
        <div className="stages-timeline-list">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStepIndex || progressPercent === 100;
            const isActive = idx === currentStepIndex && progressPercent < 100;
            const isPending = idx > currentStepIndex;

            return (
              <div 
                key={stage.title} 
                className={`stage-timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="stage-icon-col">
                  {isCompleted ? (
                    <div className="stage-status-badge completed">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : isActive ? (
                    <div className="stage-status-badge active">
                      <Loader2 size={16} className="spin-fast" />
                    </div>
                  ) : (
                    <div className="stage-status-badge pending">
                      <span className="step-num">{idx + 1}</span>
                    </div>
                  )}
                  {idx < stages.length - 1 && <div className="stage-connector-line"></div>}
                </div>

                <div className="stage-content-col">
                  <div className="stage-title-row">
                    <span className="stage-title">{stage.title}</span>
                    {isActive && <span className="active-tag">Analyzing</span>}
                  </div>
                  <span className="stage-detail">{stage.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel Button */}
        <div className="processing-footer">
          <button 
            type="button" 
            className="btn-cancel-processing"
            onClick={onCancel}
          >
            <XCircle size={15} />
            <span>Cancel Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
}
