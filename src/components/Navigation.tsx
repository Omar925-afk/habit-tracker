import React from 'react';
import '../../styles/navigation.css';

type View = 'dashboard' | 'today' | 'upcoming' | 'all-tasks' | 'completed' | 'calendar';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems: Array<{
    label: string;
    icon: string;
    view: View;
  }> = [
    { label: 'Dashboard', icon: '📊', view: 'dashboard' },
    { label: 'Today', icon: '📅', view: 'today' },
    { label: 'Upcoming', icon: '🔜', view: 'upcoming' },
    { label: 'All Tasks', icon: '✓', view: 'all-tasks' },
    { label: 'Completed', icon: '✅', view: 'completed' }
  ];

  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <div className="brand-icon">⚡</div>
        <div className="brand-text">
          <div className="brand-name">Smart Tasks</div>
          <div className="brand-tagline">Intelligent Scheduling</div>
        </div>
      </div>

      <div className="nav-items">
        {navItems.map((item) => (
          <button
            key={item.view}
            className={`nav-item ${currentView === item.view ? 'active' : ''}`}
            onClick={() => onViewChange(item.view)}
            aria-label={`View ${item.label}`}
            aria-current={currentView === item.view ? 'page' : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-footer">
        <button className="nav-item settings" title="Settings">
          ⚙️
        </button>
      </div>
    </nav>
  );
}
