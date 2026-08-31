import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  TrendingDown,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import { apiService } from '../services/api';

export default function Dashboard({ onNavigateToPredict, onSelectCustomer }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-xs font-medium text-dark-muted dark:text-dark-muted light:text-light-muted">
            Aggregating churn telemetry and model predictions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
        <h3 className="mt-2 text-sm font-semibold text-rose-300">Data Aggregation Error</h3>
        <p className="mt-1 text-xs text-dark-muted">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-neon-subtle hover:bg-brand-bright"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  const {
    total_customers = 0,
    overall_churn_rate = 0,
    high_risk_count = 0,
    avg_churn_probability = 0,
    risk_distribution = [],
    churn_by_contract = [],
    churn_by_tenure = [],
    recent_predictions = []
  } = data || {};

  const RISK_COLORS = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444'
  };

  return (
    <div className="space-y-6">
      {/* Top Banner CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-primary/30 bg-gradient-to-r from-dark-surface via-brand-secondary/15 to-brand-bright/10 p-6 shadow-neon-subtle">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-bright/40 bg-brand-bright/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-bright">
              <Sparkles className="h-3 w-3" /> Real-Time Intelligence
            </div>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-dark-text dark:text-dark-text light:text-light-text">
              Predict & Intervene on Customer Churn
            </h2>
            <p className="mt-1 text-xs text-dark-muted dark:text-dark-muted light:text-light-muted max-w-xl">
              Evaluate real-time churn probability, inspect SHAP local attribution factors, and trigger automated personalized retention recommendations.
            </p>
          </div>
          <button
            onClick={onNavigateToPredict}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-secondary to-brand-bright px-5 py-3 text-xs font-bold text-white shadow-neon transition-all hover:opacity-95 hover:scale-[1.02]"
          >
            Predict Customer <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Monitored"
          value={total_customers.toLocaleString()}
          subtitle="Active subscribed accounts"
          icon={Users}
        />
        <MetricCard
          title="Overall Churn Rate"
          value={`${(overall_churn_rate * 100).toFixed(1)}%`}
          subtitle="Historical & predicted churn baseline"
          icon={TrendingDown}
          trend={overall_churn_rate > 0.25 ? "Above Target" : "Optimal"}
          trendPositive={overall_churn_rate <= 0.25}
        />
        <MetricCard
          title="High Risk Accounts"
          value={high_risk_count.toLocaleString()}
          subtitle="P(Churn) >= 70% requiring intervention"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Avg Churn Probability"
          value={`${(avg_churn_probability * 100).toFixed(1)}%`}
          subtitle="Across monitored population"
          icon={Percent}
        />
      </div>

      {/* Analytics & Cohort Visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk Distribution Donut Chart */}
        <div className="rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-5">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border dark:border-dark-border light:border-light-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text dark:text-dark-text light:text-light-text">
              Risk Tier Distribution
            </h3>
            <span className="text-[10px] text-dark-muted">Active Segmentation</span>
          </div>

          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_distribution}
                  dataKey="count"
                  nameKey="risk_level"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {risk_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.risk_level] || '#A855F7'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111019',
                    border: '1px solid #2A2435',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex justify-center gap-4 text-xs">
            {risk_distribution.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS[r.risk_level] }} />
                <span className="text-[11px] text-dark-muted dark:text-dark-muted light:text-light-muted">
                  {r.risk_level}: <strong className="text-dark-text dark:text-dark-text light:text-light-text">{r.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Rate by Contract Bar Chart */}
        <div className="rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border dark:border-dark-border light:border-light-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text dark:text-dark-text light:text-light-text">
              Churn Rate by Contract Type
            </h3>
            <span className="text-[10px] text-dark-muted">Key Risk Driver</span>
          </div>

          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_contract} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2435" opacity={0.5} />
                <XAxis dataKey="category" stroke="#A6A1B5" fontSize={11} />
                <YAxis
                  stroke="#A6A1B5"
                  fontSize={11}
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(val) => [`${(val * 100).toFixed(1)}%`, 'Churn Rate']}
                  contentStyle={{
                    backgroundColor: '#111019',
                    border: '1px solid #2A2435',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="churn_rate" fill="#A855F7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-[11px] text-dark-muted dark:text-dark-muted light:text-light-muted text-center">
            Month-to-month contracts demonstrate significantly higher churn propensity than multi-year commitments.
          </p>
        </div>
      </div>

      {/* Recent Predictions Stream */}
      <div className="rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-5">
        <div className="flex items-center justify-between pb-4 border-b border-dark-border dark:border-dark-border light:border-light-border">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text dark:text-dark-text light:text-light-text">
              Recent Prediction Inferences
            </h3>
            <p className="text-[11px] text-dark-muted">Latest customer scores evaluated by ML engine</p>
          </div>
          <span className="text-xs font-medium text-brand-bright">Live Stream</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-dark-border dark:border-dark-border light:border-light-border text-[11px] font-semibold uppercase text-dark-muted">
                <th className="pb-3">Customer ID</th>
                <th className="pb-3">Risk Tier</th>
                <th className="pb-3">Churn Probability</th>
                <th className="pb-3">Primary Risk Factor</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50 dark:divide-dark-border/50 light:divide-light-border/60">
              {recent_predictions.length > 0 ? (
                recent_predictions.map((pred, i) => (
                  <tr key={i} className="hover:bg-dark-secondary/40 dark:hover:bg-dark-secondary/40 light:hover:bg-light-secondary/50">
                    <td className="py-3 font-mono font-medium text-dark-text dark:text-dark-text light:text-light-text">
                      {pred.customer_id}
                    </td>
                    <td className="py-3">
                      <RiskBadge level={pred.risk_level} size="sm" />
                    </td>
                    <td className="py-3 font-mono font-semibold">
                      <span className={pred.churn_probability >= 0.7 ? 'text-rose-400' : pred.churn_probability >= 0.4 ? 'text-amber-400' : 'text-emerald-400'}>
                        {(pred.churn_probability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-dark-muted dark:text-dark-muted light:text-light-muted">
                      {pred.top_factors && pred.top_factors[0] ? pred.top_factors[0].feature_label : 'Tenure & Contract'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectCustomer && onSelectCustomer(pred.customer_id)}
                        className="text-xs font-semibold text-brand-bright hover:underline"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-dark-muted">
                    No predictions recorded yet. Run a prediction to populate this stream.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
