import React, { useEffect, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BadgeAlert, BrainCircuit,
  CircleHelp, RefreshCw, ShieldCheck, Sparkles, Users, Waves,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import RiskBadge from '../components/RiskBadge';
import { apiService } from '../services/api';

const RISK_COLORS = { LOW: '#36c69a', MEDIUM: '#f4b860', HIGH: '#f17664' };
const compactNumber = (value = 0) => new Intl.NumberFormat('en', { notation: value > 999 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value);

function LoadingState() {
  return <div className="loading-state"><span className="loading-orbit" /><p>Gathering your latest customer signals…</p></div>;
}

function ErrorState({ message, retry }) {
  return <div className="error-panel"><span className="error-icon"><BadgeAlert size={20} /></span><div><strong>We couldn't load the overview</strong><p>{message}</p></div><button type="button" className="secondary-button" onClick={retry}><RefreshCw size={15} /> Try again</button></div>;
}

function Metric({ label, value, detail, icon: Icon, tone, note }) {
  return <article className="metric-card">
    <div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={18} strokeWidth={1.9} /></span></div>
    <div className="metric-value">{value}</div>
    <div className="metric-foot"><span>{detail}</span>{note && <span className={`metric-note ${tone}`}><ArrowUpRight size={13} />{note}</span>}</div>
  </article>;
}

export default function Dashboard({ onNavigateToPredict, onSelectCustomer }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true); setError(null);
    try { setData(await apiService.getAnalytics()); }
    catch (err) { setError(err.message || 'Check that the API is running and try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={fetchDashboardData} />;

  const {
    total_customers = 0, overall_churn_rate = 0, high_risk_count = 0,
    avg_churn_probability = 0, risk_distribution = [], churn_by_contract = [],
    recent_predictions = [],
  } = data || {};
  const churnLabel = `${(overall_churn_rate * 100).toFixed(1)}%`;
  const highRiskShare = total_customers ? Math.round((high_risk_count / total_customers) * 100) : 0;

  return <div className="dashboard-stack">
    <section className="welcome-row">
      <div><div className="eyebrow"><span className="eyebrow-dot" /> CUSTOMER RETENTION OVERVIEW</div><h2>Know who needs you next.</h2><p>A clear view of churn signals, at-risk accounts, and the actions that can make a difference.</p></div>
      <button type="button" className="primary-button" onClick={onNavigateToPredict}><BrainCircuit size={17} /> Assess a customer <ArrowRight size={16} /></button>
    </section>

    <section className="metric-grid" aria-label="Key churn metrics">
      <Metric label="Customers monitored" value={compactNumber(total_customers)} detail="Across your customer base" icon={Users} tone="tone-teal" />
      <Metric label="Overall churn rate" value={churnLabel} detail="Historical customer churn" icon={Waves} tone="tone-coral" note={overall_churn_rate > 0.25 ? 'Above 25% benchmark' : undefined} />
      <Metric label="High-risk customers" value={compactNumber(high_risk_count)} detail="Priority for retention outreach" icon={BadgeAlert} tone="tone-amber" note={highRiskShare ? `${highRiskShare}% of base` : undefined} />
      <Metric label="Average risk score" value={`${(avg_churn_probability * 100).toFixed(1)}%`} detail="Mean predicted churn probability" icon={ShieldCheck} tone="tone-blue" />
    </section>

    <section className="insight-banner">
      <div className="insight-symbol"><Sparkles size={19} /></div>
      <div className="insight-copy"><span>RETENTION SIGNAL</span><strong>{high_risk_count ? `${compactNumber(high_risk_count)} customers may need attention` : 'Your retention workspace is ready'}</strong><p>Use individual risk scores and model explanations to focus outreach where it matters.</p></div>
      <div className="insight-side"><div className="insight-score">{highRiskShare}<small>%</small></div><span>of customers at high risk</span></div>
    </section>

    <section className="charts-grid">
      <article className="content-card risk-card">
        <div className="card-heading"><div><span className="section-kicker">PORTFOLIO MIX</span><h3>Risk distribution</h3></div><span className="card-period">Current view</span></div>
        <div className="risk-chart-wrap">
          {risk_distribution.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={risk_distribution} dataKey="count" nameKey="risk_level" cx="50%" cy="50%" innerRadius={66} outerRadius={88} paddingAngle={3} stroke="none">{risk_distribution.map((entry) => <Cell key={entry.risk_level} fill={RISK_COLORS[entry.risk_level] || '#a78bfa'} />)}</Pie><Tooltip formatter={(value, name) => [value, `${name} risk`]} contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} /></PieChart></ResponsiveContainer> : <div className="chart-empty">No scored customers yet</div>}
          <div className="donut-center"><strong>{compactNumber(total_customers)}</strong><span>customers</span></div>
        </div>
        <div className="risk-legend">{['LOW', 'MEDIUM', 'HIGH'].map((level) => { const item = risk_distribution.find((entry) => entry.risk_level === level); return <div key={level} className="legend-item"><i style={{ background: RISK_COLORS[level] }} /><span>{level.toLowerCase()}</span><strong>{compactNumber(item?.count || 0)}</strong></div>; })}</div>
      </article>

      <article className="content-card contract-card">
        <div className="card-heading"><div><span className="section-kicker">CHURN PATTERNS</span><h3>Risk by contract type</h3></div><span className="chart-badge"><span /> Customer churn</span></div>
        <div className="contract-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={churn_by_contract} margin={{ top: 14, right: 10, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" /><XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickFormatter={(value) => `${Math.round(value * 100)}%`} /><Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Churn rate']} contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} /><Bar dataKey="churn_rate" fill="#39bda0" radius={[7, 7, 2, 2]} maxBarSize={56} /></BarChart></ResponsiveContainer></div>
        <p className="chart-footnote"><CircleHelp size={14} /> Compare contract cohorts to find opportunities for longer-term retention.</p>
      </article>
    </section>

    <section className="content-card activity-card">
      <div className="card-heading activity-heading"><div><span className="section-kicker">LATEST SCORING ACTIVITY</span><h3>Recently assessed customers</h3></div><button type="button" className="text-button" onClick={onNavigateToPredict}>New assessment <ArrowRight size={15} /></button></div>
      <div className="table-scroll"><table className="activity-table"><thead><tr><th>Customer</th><th>Risk level</th><th>Probability</th><th>Top signal</th><th aria-label="Action" /></tr></thead><tbody>
        {recent_predictions.length ? recent_predictions.slice(0, 6).map((prediction, index) => <tr key={prediction.customer_id || index}><td><button type="button" className="customer-link" onClick={() => onSelectCustomer?.(prediction.customer_id)}><span className="customer-avatar">{String(prediction.customer_id || 'C').slice(-2, -1).toUpperCase()}</span><span><strong>{prediction.customer_id || 'Customer'}</strong><small>Churn assessment</small></span></button></td><td><RiskBadge level={prediction.risk_level} size="sm" /></td><td><div className="probability-cell"><span>{(prediction.churn_probability * 100).toFixed(1)}%</span><i><b style={{ width: `${Math.max(0, Math.min(100, prediction.churn_probability * 100))}%`, background: RISK_COLORS[prediction.risk_level] || '#39bda0' }} /></i></div></td><td className="signal-cell">{prediction.top_factors?.[0]?.feature_label || 'Profile signals'}</td><td><button type="button" className="row-action" aria-label={`Inspect ${prediction.customer_id}`} onClick={() => onSelectCustomer?.(prediction.customer_id)}><ArrowRight size={16} /></button></td></tr>) : <tr><td colSpan="5"><div className="table-empty"><ShieldCheck size={18} /> No assessments yet. Start with a customer risk assessment.</div></td></tr>}
      </tbody></table></div>
      {recent_predictions.length > 6 && <div className="table-footer">Showing the latest 6 of {recent_predictions.length} assessments <ArrowDownRight size={14} /></div>}
    </section>
  </div>;
}
