import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  PlusCircle, 
  ChevronDown, 
  ShieldCheck, 
  CheckCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { mockNotifications } from '../data/mockCases';

export default function Navbar({ 
  currentTab, 
  onOpenMobileSidebar, 
  onNewAnalysis, 
  searchQuery, 
  onSearchChange 
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (currentTab) {
      case 'overview':
        return { title: 'Operator Dashboard', subtitle: 'Live Emergency Helpline Triage Monitor' };
      case 'new-analysis':
        return { title: 'New Call Analysis', subtitle: 'Transcript & Voice Intake Assessment' };
      case 'cases':
        return { title: 'Case Management', subtitle: 'Centralized Triage Queue & Service Logs' };
      case 'reports':
        return { title: 'Reports & Analytics', subtitle: 'Response Metrics & Dispatch Efficiency' };
      case 'directory':
        return { title: 'Emergency Service Directory', subtitle: 'National & Regional Helpline Roster' };
      case 'guidelines':
        return { title: 'Triage Protocol & Guidelines', subtitle: 'Priority Decision Tree & SOPs' };
      case 'settings':
        return { title: 'System Settings', subtitle: 'Workstation Preferences & Thresholds' };
      default:
        return { title: 'Operator Dashboard', subtitle: 'Live Emergency Helpline Triage' };
    }
  };

  const { title, subtitle } = getPageTitle();
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button 
          type="button" 
          className="mobile-menu-btn mobile-only" 
          onClick={onOpenMobileSidebar}
          aria-label="Open mobile navigation"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-title-block">
          <h1 className="navbar-title">{title}</h1>
          <span className="navbar-subtitle desktop-only">{subtitle}</span>
        </div>
      </div>

      <div className="navbar-center desktop-only">
        <div className="navbar-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search cases, symptoms, languages, IDs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {/* Prominent New Analysis Action */}
        <button 
          type="button" 
          className="btn-new-analysis" 
          onClick={onNewAnalysis}
        >
          <PlusCircle size={18} />
          <span className="btn-text">New Analysis</span>
        </button>

        {/* Notifications Icon with Dropdown */}
        <div className="notification-wrapper" ref={notifRef}>
          <button 
            type="button" 
            className={`icon-btn notification-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <span className="badge-count">{unreadCount} Unread</span>
              </div>
              <div className="dropdown-list">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                    <div className="notification-item-icon">
                      {notif.type === 'critical' ? (
                        <AlertTriangle size={16} color="#ef4444" />
                      ) : notif.type === 'warning' ? (
                        <AlertTriangle size={16} color="#f59e0b" />
                      ) : (
                        <Info size={16} color="#06b6d4" />
                      )}
                    </div>
                    <div className="notification-item-content">
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-time">{notif.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <span>All systems operational</span>
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile Dropdown */}
        <div className="profile-wrapper" ref={profileRef}>
          <button 
            type="button" 
            className="profile-btn" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Operator profile"
          >
            <div className="avatar-circle">
              <span>AS</span>
              <span className="avatar-status-dot" />
            </div>
            <div className="profile-info desktop-only">
              <span className="profile-name">Ananya S.</span>
              <span className="profile-role">Triage Officer</span>
            </div>
            <ChevronDown size={14} className="desktop-only text-muted" />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="p-name">Ananya Sharma</div>
                <div className="p-email">operator.sharma@callsaarthi.gov.in</div>
                <div className="p-badge">
                  <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Level 2 Certified Triage
                </div>
              </div>
              <ul className="profile-menu-list">
                <li><button type="button">Shift Activity Log</button></li>
                <li><button type="button">Audio Headset Calibration</button></li>
                <li><button type="button">Helpline Dispatch Keys</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
