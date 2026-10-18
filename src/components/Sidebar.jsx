import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Layers, 
  BarChart3, 
  BookMarked, 
  HelpCircle, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Headphones,
  Home,
  X
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  collapsed, 
  onToggleCollapse, 
  mobileOpen, 
  onCloseMobile,
  onOpenHome,
  awaitingCount = 14
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'new-analysis', label: 'New Analysis', icon: FilePlus2, badge: 'New' },
    { id: 'cases', label: 'Case Management', icon: Layers, badge: String(awaitingCount) },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { id: 'directory', label: 'Service Directory', icon: BookMarked, badge: null },
    { id: 'guidelines', label: 'Help & Guidelines', icon: HelpCircle, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => onSelectTab('overview')}>
            <div className="brand-logo-icon">
              <Headphones size={22} color="#00e5ff" />
            </div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-name">CallSaarthi <span className="brand-accent">AI</span></span>
                <span className="brand-tagline">Triage Platform</span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button 
            type="button" 
            className="collapse-toggle-btn desktop-only" 
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar collapse"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile close button */}
          <button 
            type="button" 
            className="mobile-close-btn mobile-only" 
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">{!collapsed ? 'Main Navigation' : '•'}</div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (currentTab === 'case-details' && item.id === 'cases');
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (mobileOpen) onCloseMobile();
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="nav-item-icon">
                      <Icon size={20} />
                    </span>
                    {!collapsed && <span className="nav-item-text">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className={`nav-item-badge ${item.badge === 'New' ? 'badge-new' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button 
            type="button"
            className="return-home-btn"
            onClick={onOpenHome}
            title="Return to Product Homepage"
          >
            <Home size={18} />
            {!collapsed && <span>Homepage Preview</span>}
          </button>

          {!collapsed && (
            <div className="operator-status-indicator">
              <span className="status-dot"></span>
              <div className="status-text-block">
                <span className="status-main">Operator Online</span>
                <span className="status-sub">Station #04 • Shift A</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
