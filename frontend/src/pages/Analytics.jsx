import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiService } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-xs text-dark-muted">Aggregating real-time dataset cohort analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <h3 className="text-sm font-semibold text-rose-300">Analytics Error</h3>
        <p className="mt-1 text-xs text-dark-muted">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-neon-subtle hover:bg-brand-bright"
        >
          <RefreshCw className="inline h-3 w-3 mr-1" /> Retry
        </button>
      </div>
    );
  }

  const {
    churn_by_contract = [],
    churn_by_internet = [],
    churn_by_tenure = [],
    churn_by_payment = [],
    risk_distribution = []
  } = data;

  const RISK_COLORS = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-dark-text flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-brand-bright" />
          Cohort & Strategic Churn Analytics
        </h2>
        <p className="text-xs text-dark-muted">
          Multi-dimensional cohort segmentation exploring structural drivers of customer attrition.
        </p>
      </div>

      {/* 2x2 Grid of Cohort Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Contract Cohort */}
        <div className="rounded-xl border border-dark-border bg-dark-surface p-5 shadow-card-dark">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text">
              1. Churn Propensity by Contract Term
            </h3>
            <span className="text-[10px] text-dark-muted">Structural Retention</span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_contract} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2435" opacity={0.5} />
                <XAxis dataKey="category" stroke="#A6A1B5" fontSize={11} />
                <YAxis
                  stroke="#A6A1B5"
                  fontSize={11}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(val) => [`${(val * 100).toFixed(1)}%`, 'Churn Rate']}
                  contentStyle={{ backgroundColor: '#111019', border: '1px solid #2A2435', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="churn_rate" fill="#A855F7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-dark-muted text-center">
            Month-to-month contracts have the highest churn susceptibility (~42%).
          </p>
        </div>

        {/* Chart 2: Internet Service Cohort */}
        <div className="rounded-xl border border-dark-border bg-dark-surface p-5 shadow-card-dark">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text">
              2. Churn Rate by Internet Technology
            </h3>
            <span className="text-[10px] text-dark-muted">Service Technology</span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_internet} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2435" opacity={0.5} />
                <XAxis dataKey="category" stroke="#A6A1B5" fontSize={11} />
                <YAxis
                  stroke="#A6A1B5"
                  fontSize={11}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(val) => [`${(val * 100).toFixed(1)}%`, 'Churn Rate']}
                  contentStyle={{ backgroundColor: '#111019', border: '1px solid #2A2435', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="churn_rate" fill="#C026FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-dark-muted text-center">
            Fiber Optic users experience higher churn when missing dedicated Tech Support add-ons.
          </p>
        </div>

        {/* Chart 3: Tenure Cohort Decay */}
        <div className="rounded-xl border border-dark-border bg-dark-surface p-5 shadow-card-dark">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text">
              3. Tenure Cohort Decay Analysis
            </h3>
            <span className="text-[10px] text-dark-muted">Lifecycle Tenure</span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_tenure} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2435" opacity={0.5} />
                <XAxis dataKey="category" stroke="#A6A1B5" fontSize={11} />
                <YAxis
                  stroke="#A6A1B5"
                  fontSize={11}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(val) => [`${(val * 100).toFixed(1)}%`, 'Churn Rate']}
                  contentStyle={{ backgroundColor: '#111019', border: '1px solid #2A2435', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="churn_rate" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-dark-muted text-center">
            Critical onboarding window: accounts in months 0-12 exhibit the peak churn probability.
          </p>
        </div>

        {/* Chart 4: Payment Method Friction */}
        <div className="rounded-xl border border-dark-border bg-dark-surface p-5 shadow-card-dark">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text">
              4. Churn by Payment Channel
            </h3>
            <span className="text-[10px] text-dark-muted">Billing Channel</span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_payment} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2435" opacity={0.5} />
                <XAxis dataKey="category" stroke="#A6A1B5" fontSize={9} angle={-15} textAnchor="end" />
                <YAxis
                  stroke="#A6A1B5"
                  fontSize={11}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(val) => [`${(val * 100).toFixed(1)}%`, 'Churn Rate']}
                  contentStyle={{ backgroundColor: '#111019', border: '1px solid #2A2435', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="churn_rate" fill="#EC4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-dark-muted text-center">
            Electronic check payment shows 2-3x higher churn risk than automated bank or card drafts.
          </p>
        </div>
      </div>
    </div>
  );
}
