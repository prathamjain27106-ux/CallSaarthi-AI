import React, { useState } from 'react';
import { 
  FilePlus2, 
  BookMarked, 
  HelpCircle, 
  Settings as SettingsIcon, 
  BarChart3, 
  PhoneCall, 
  ShieldCheck, 
  AlertOctagon,
  ArrowRight,
  Clock,
  Sparkles,
  Volume2,
  Bell,
  Globe,
  RotateCcw
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import ConfirmationModal from './ConfirmationModal';

export function NewAnalysisPlaceholder({ onNavigateOverview }) {
  return (
    <div className="section-container">
      <div className="placeholder-banner">
        <div className="banner-icon-glow">
          <FilePlus2 size={32} color="#00e5ff" />
        </div>
        <h2>New Call Analysis Intake</h2>
        <p className="banner-desc">
          Ready for live caller transcript parsing and multi-language acoustic distress analysis.
        </p>
        
        <div className="intake-preview-card">
          <div className="intake-header">
            <span className="badge-new">Intake Preview</span>
            <span className="text-muted">Awaiting Call Session</span>
          </div>

          <div className="mock-input-area">
            <div className="mic-indicator">
              <span className="pulse-dot"></span>
              <span>Audio Channel Standby (Station 04)</span>
            </div>
            <textarea 
              className="mock-textarea" 
              readOnly 
              rows={4}
              value="[Operator Console Ready] Transcript analysis pipeline is primed for next phase. To test existing processed cases, please explore the Overview Dashboard."
            />
          </div>

          <div className="intake-actions">
            <button 
              type="button" 
              className="btn-primary" 
              onClick={onNavigateOverview}
            >
              <span>View Overview Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceDirectoryView() {
  const directory = [
    { code: '112', name: 'National Emergency Response System (NERS)', type: 'Unified Emergency', status: 'Active 24/7' },
    { code: '108', name: 'Emergency Medical & Ambulance Dispatch', type: 'Medical / Trauma', status: 'Active 24/7' },
    { code: '1091', name: 'Women in Distress Helpline', type: 'Protection & Rescue', status: 'Active 24/7' },
    { code: '1098', name: 'Childline India Foundation', type: 'Child Welfare', status: 'Active 24/7' },
    { code: '14416', name: 'Tele-MANAS National Mental Health Program', type: 'Crisis Counseling', status: 'Active 24/7' },
    { code: '14567', name: 'Elderline National Helpline for Seniors', type: 'Geriatric Support', status: '08:00 - 20:00' },
    { code: '1070', name: 'State Disaster Management Authority (SDMA)', type: 'Flood / Cyclone Relief', status: 'Active 24/7' },
    { code: '1916', name: 'Municipal Civic Emergency & Sanitation', type: 'Civic Infrastructure', status: '06:00 - 22:00' },
  ];

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">National & Regional Emergency Service Directory</h2>
          <p className="section-subtitle">Official roster of mapped emergency responder helplines used for automated triage</p>
        </div>
      </div>

      <div className="directory-grid">
        {directory.map((item) => (
          <div key={item.code} className="directory-card">
            <div className="dir-code-badge">{item.code}</div>
            <div className="dir-body">
              <h4 className="dir-name">{item.name}</h4>
              <span className="dir-type">{item.type}</span>
              <div className="dir-footer">
                <span className="dir-dot"></span>
                <span>{item.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HelpGuidelinesView() {
  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">Triage Protocols & SOP Guidelines</h2>
          <p className="section-subtitle">Decision matrix for operator verification and priority categorization</p>
        </div>
      </div>

      <div className="guidelines-grid">
        <div className="guideline-card card-critical">
          <div className="guideline-head">
            <AlertOctagon size={20} color="#ef4444" />
            <h4>Critical (P1) Protocol</h4>
          </div>
          <p className="guideline-target">Dispatch Target: &lt; 2 Minutes</p>
          <ul className="guideline-list">
            <li>Immediate threat to life or severe cardiac/respiratory distress.</li>
            <li>Active violence in progress with caller in hiding.</li>
            <li>Caller unconscious, bleeding profusely, or impending suicide.</li>
          </ul>
        </div>

        <div className="guideline-card card-high">
          <div className="guideline-head">
            <ShieldCheck size={20} color="#f59e0b" />
            <h4>High Priority (P2) Protocol</h4>
          </div>
          <p className="guideline-target">Dispatch Target: &lt; 10 Minutes</p>
          <ul className="guideline-list">
            <li>Unaccompanied vulnerable minors or elderly in distress.</li>
            <li>Acute psychological breakdown or escalating panic attack.</li>
            <li>Residential flood or structural hazard with trapped occupants.</li>
          </ul>
        </div>

        <div className="guideline-card card-medium">
          <div className="guideline-head">
            <PhoneCall size={20} color="#06b6d4" />
            <h4>Medium & Low (P3 / P4) Protocols</h4>
          </div>
          <p className="guideline-target">Queue Target: &lt; 30 Minutes / Informational</p>
          <ul className="guideline-list">
            <li>Non-urgent medical consultation or prescription requests.</li>
            <li>Government health scheme card renewal inquiries.</li>
            <li>Municipal civic grievances (waterlogging, drainage, power lines).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function SettingsView() {
  const { resetDemoData } = useCases();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">Workstation Settings</h2>
          <p className="section-subtitle">Operator console configuration and alert thresholds</p>
        </div>
      </div>

      <div className="settings-panel">
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">
              <Volume2 size={16} /> Critical Case Audio Chime
            </div>
            <div className="setting-desc">Play distinctive chime when a Critical P1 case arrives in queue</div>
          </div>
          <button 
            type="button" 
            className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">
              <Bell size={16} /> Live Stream Auto-Refresh
            </div>
            <div className="setting-desc">Automatically fetch latest call cases every 15 seconds</div>
          </div>
          <button 
            type="button" 
            className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">
              <Globe size={16} /> Primary Helpline Jurisdiction
            </div>
            <div className="setting-desc">Selected regional dispatch zone</div>
          </div>
          <div className="station-badge">National Helpline Hub (North Region)</div>
        </div>

        {/* Demo Data Management */}
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">
              <RotateCcw size={16} /> Reset Demonstration Dataset
            </div>
            <div className="setting-desc">
              Restore local storage cache back to the default 10 initial helpline cases.
            </div>
          </div>
          <button
            type="button"
            className="btn-outline-action"
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Reset Demo Dataset"
        message="Are you sure you want to reset all cases in localStorage back to the initial demonstration dataset? Any custom analysis cases will be cleared."
        confirmLabel="Confirm Reset"
        isDestructive={true}
        onConfirm={resetDemoData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
