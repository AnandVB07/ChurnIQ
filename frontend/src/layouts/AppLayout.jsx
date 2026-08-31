import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Users,
  BarChart3,
  Sparkles,
  Sun,
  Moon,
  Activity,
  Menu,
  X,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';

export default function AppLayout({ currentTab, onSelectTab, children }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ healthy: false, loaded: false });

  useEffect(() => {
    // Check API health on mount
    apiService.getHealth()
      .then(data => {
        setApiStatus({ healthy: data.status === 'healthy', loaded: data.ml_model_loaded });
      })
      .catch(() => {
        setApiStatus({ healthy: false, loaded: false });
      });
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Predict Churn', icon: BrainCircuit, badge: 'AI' },
    { id: 'customers', label: 'Customer Explorer', icon: Users },
    { id: 'analytics', label: 'Cohort Analytics', icon: BarChart3 },
    { id: 'model', label: 'Model & SHAP Insights', icon: Sparkles },
  ];

  return (
    <div className="flex min-h-screen bg-dark-bg dark:bg-dark-bg light:bg-light-bg transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-4">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-secondary to-brand-bright shadow-neon-subtle">
              <Activity className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-dark-text dark:text-dark-text light:text-light-text flex items-center gap-1.5">
                Churn<span className="text-brand-bright">IQ</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                Intelligence Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-secondary/20 to-brand-bright/10 text-brand-bright border border-brand-primary/30 shadow-neon-subtle'
                      : 'text-dark-muted dark:text-dark-muted light:text-light-muted hover:bg-dark-secondary/60 dark:hover:bg-dark-secondary/60 light:hover:bg-light-secondary hover:text-dark-text dark:hover:text-dark-text light:hover:text-light-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-bright' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-md bg-brand-bright/20 px-1.5 py-0.5 text-[9px] font-bold text-brand-bright">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Engine Status & Footer */}
        <div className="rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-secondary/40 dark:bg-dark-secondary/40 light:bg-light-secondary/40 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-dark-muted dark:text-dark-muted light:text-light-muted">ML Engine</span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <span className={`h-2 w-2 rounded-full ${apiStatus.healthy ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {apiStatus.healthy ? 'Active' : 'Standby'}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-dark-muted dark:text-dark-muted light:text-light-muted">
            XGBoost Tuned • SHAP TreeExplainer
          </p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="w-64 bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-5 flex flex-col justify-between border-r border-dark-border">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-brand-bright" />
                  <span className="font-bold text-dark-text">ChurnIQ</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-dark-muted hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                        isActive ? 'bg-brand-primary text-white' : 'text-dark-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface/80 dark:bg-dark-surface/80 light:bg-light-surface/80 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-lg p-1.5 text-dark-muted hover:bg-dark-secondary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-sm font-semibold capitalize text-dark-text dark:text-dark-text light:text-light-text">
                {navItems.find(n => n.id === currentTab)?.label || 'Customer Churn Intelligence'}
              </h2>
              <p className="text-[11px] text-dark-muted dark:text-dark-muted light:text-light-muted hidden sm:block">
                Predictive Risk Scoring & Real-time Retention Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-secondary/60 dark:bg-dark-secondary/60 light:bg-light-secondary text-dark-text dark:text-dark-text light:text-light-text transition-all hover:border-brand-primary/50 hover:text-brand-bright"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-brand-secondary" />}
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
