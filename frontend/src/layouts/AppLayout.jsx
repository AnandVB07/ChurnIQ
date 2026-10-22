import React, { useEffect, useState } from 'react';
import {
  Activity, ArrowUpRight, BarChart3, BrainCircuit, CircleHelp,
  LayoutDashboard, Menu, Moon, ShieldCheck, Sparkles, Sun, Users, UserRound, X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'predict', label: 'Risk assessment', icon: BrainCircuit, badge: 'AI' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'model', label: 'Model insights', icon: Sparkles },
  { id: 'profile', label: 'My profile', icon: UserRound },
];

export default function AppLayout({ currentTab, onSelectTab, user, children }) {
  const { toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    apiService.getHealth()
      .then((data) => active && setApiStatus(data.status === 'healthy' ? 'online' : 'degraded'))
      .catch(() => active && setApiStatus('offline'));
    return () => { active = false; };
  }, []);

  const currentLabel = navItems.find((item) => item.id === currentTab)?.label || 'Customer intelligence';
  const selectTab = (tab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const Navigation = ({ mobile = false }) => (
    <nav aria-label="Main navigation" className="space-y-1">
      {navItems.map(({ id, label, icon: Icon, badge }) => {
        const selected = currentTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            aria-current={selected ? 'page' : undefined}
            className={`nav-link ${selected ? 'nav-link-active' : ''} ${mobile ? 'w-full' : ''}`}
          >
            <Icon size={18} strokeWidth={selected ? 2.2 : 1.8} />
            <span>{label}</span>
            {badge && <span className="nav-badge">{badge}</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar hidden lg:flex">
        <div>
          <a className="brand-lockup" href="#dashboard" onClick={(event) => { event.preventDefault(); selectTab('dashboard'); }}>
            <span className="brand-mark"><Activity size={20} strokeWidth={2.4} /></span>
            <span><strong>churn<span>iq</span></strong><small>RETENTION STUDIO</small></span>
          </a>
          <div className="workspace-label">WORKSPACE</div>
          <Navigation />
        </div>
        <div className="sidebar-bottom">
          <div className="engine-card">
            <div className="engine-heading"><span className="engine-icon"><ShieldCheck size={16} /></span><span>Prediction engine</span></div>
            <div className="engine-status"><i className={`status-dot status-${apiStatus}`} />{apiStatus === 'checking' ? 'Checking connection' : apiStatus === 'online' ? 'API connected' : apiStatus === 'degraded' ? 'API degraded' : 'API unavailable'}</div>
            <div className="engine-caption">XGBoost · SHAP explanations</div>
          </div>
          <button type="button" className="help-link" onClick={() => selectTab('model')}><CircleHelp size={16} /> Model documentation <ArrowUpRight size={14} /></button>
          <button type="button" className={`profile-row profile-row-button ${currentTab === 'profile' ? 'profile-row-active' : ''}`} onClick={() => selectTab('profile')}><span className="avatar">{(user?.name || 'CI').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span className="profile-copy"><strong>{user?.name || 'Workspace owner'}</strong><small>{user?.email || 'My profile & settings'}</small></span><span className="online-indicator" /></button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="mobile-overlay lg:hidden" role="presentation" onClick={() => setMobileMenuOpen(false)}>
          <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header"><a className="brand-lockup" href="#dashboard" onClick={(event) => { event.preventDefault(); selectTab('dashboard'); }}><span className="brand-mark"><Activity size={20} /></span><span><strong>churn<span>iq</span></strong><small>RETENTION STUDIO</small></span></a><button type="button" className="icon-button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><X size={19} /></button></div>
            <div className="workspace-label">WORKSPACE</div><Navigation mobile />
          </aside>
        </div>
      )}

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-title">
            <button type="button" className="icon-button lg:hidden" aria-label="Open menu" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button>
            <div><div className="breadcrumbs">CHURNIQ <span>/</span> WORKSPACE</div><h1>{currentLabel}</h1></div>
          </div>
          <div className="topbar-actions">
            <div className="topbar-live"><i className={`status-dot status-${apiStatus}`} />{apiStatus === 'online' ? 'Systems operational' : apiStatus === 'checking' ? 'Connecting' : 'API disconnected'}</div>
            <button type="button" className="icon-button theme-toggle" onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>{isDark ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button type="button" className="avatar topbar-avatar profile-trigger" onClick={() => selectTab('profile')} aria-label="Open profile">{(user?.name || 'CI').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</button>
          </div>
        </header>
        <main className="page-content"><div className="page-width">{children}</div></main>
      </div>
    </div>
  );
}
