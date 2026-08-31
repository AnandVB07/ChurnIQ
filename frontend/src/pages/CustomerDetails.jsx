import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  CreditCard,
  Wifi,
  Calendar,
  Zap,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import ProbabilityGauge from '../components/ProbabilityGauge';
import RiskBadge from '../components/RiskBadge';
import ShapFactorBar from '../components/ShapFactorBar';
import { apiService } from '../services/api';

export default function CustomerDetails({ customerId, onBack }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    apiService.getCustomerDetails(customerId)
      .then((data) => setCustomer(data))
      .catch((err) => {
        console.error('Fetch customer details error:', err);
        setError(err.message || 'Customer not found.');
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-xs text-dark-muted">Loading customer record for {customerId}...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-bright hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Explorer
        </button>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
          <h3 className="mt-2 text-sm font-semibold text-rose-300">Customer Details Error</h3>
          <p className="mt-1 text-xs text-dark-muted">{error}</p>
        </div>
      </div>
    );
  }

  const latestPred = customer.predictions && customer.predictions.length > 0 ? customer.predictions[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-1.5 text-xs font-semibold text-dark-text hover:border-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Explorer
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-dark-text">{customer.customer_id}</span>
          {latestPred && <RiskBadge level={latestPred.risk_level} size="md" />}
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Profile Columns */}
        <div className="space-y-6 lg:col-span-7">
          {/* Account Profile Card */}
          <div className="rounded-xl border border-dark-border bg-dark-surface p-6 shadow-card-dark">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary pb-3 border-b border-dark-border">
              <User className="h-4 w-4" /> Account & Demographics
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div>
                <span className="text-dark-muted">Gender</span>
                <p className="font-semibold text-dark-text">{customer.gender}</p>
              </div>
              <div>
                <span className="text-dark-muted">Senior Citizen</span>
                <p className="font-semibold text-dark-text">{customer.senior_citizen ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-dark-muted">Partner</span>
                <p className="font-semibold text-dark-text">{customer.partner}</p>
              </div>
              <div>
                <span className="text-dark-muted">Dependents</span>
                <p className="font-semibold text-dark-text">{customer.dependents}</p>
              </div>
            </div>
          </div>

          {/* Subscription & Billing Details */}
          <div className="rounded-xl border border-dark-border bg-dark-surface p-6 shadow-card-dark">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary pb-3 border-b border-dark-border">
              <CreditCard className="h-4 w-4" /> Subscription & Financials
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
              <div>
                <span className="text-dark-muted">Contract Type</span>
                <p className="font-semibold text-dark-text">{customer.contract}</p>
              </div>
              <div>
                <span className="text-dark-muted">Tenure Duration</span>
                <p className="font-semibold text-dark-text">{customer.tenure} months</p>
              </div>
              <div>
                <span className="text-dark-muted">Payment Method</span>
                <p className="font-semibold text-dark-text">{customer.payment_method}</p>
              </div>
              <div>
                <span className="text-dark-muted">Monthly Charges</span>
                <p className="font-mono font-semibold text-brand-bright">${Number(customer.monthly_charges).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-dark-muted">Total Historical Spend</span>
                <p className="font-mono font-semibold text-dark-text">${Number(customer.total_charges).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-dark-muted">Paperless Billing</span>
                <p className="font-semibold text-dark-text">{customer.paperless_billing}</p>
              </div>
            </div>
          </div>

          {/* Subscribed Add-ons & Connectivity */}
          <div className="rounded-xl border border-dark-border bg-dark-surface p-6 shadow-card-dark">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary pb-3 border-b border-dark-border">
              <Wifi className="h-4 w-4" /> Connectivity & Subscribed Features
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-lg bg-dark-secondary/50 p-2.5">
                <span className="text-[10px] text-dark-muted">Internet Provider</span>
                <p className="font-semibold text-dark-text">{customer.internet_service}</p>
              </div>
              <div className="rounded-lg bg-dark-secondary/50 p-2.5">
                <span className="text-[10px] text-dark-muted">Tech Support</span>
                <p className={`font-semibold ${customer.tech_support === 'Yes' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {customer.tech_support}
                </p>
              </div>
              <div className="rounded-lg bg-dark-secondary/50 p-2.5">
                <span className="text-[10px] text-dark-muted">Online Security</span>
                <p className={`font-semibold ${customer.online_security === 'Yes' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {customer.online_security}
                </p>
              </div>
              <div className="rounded-lg bg-dark-secondary/50 p-2.5">
                <span className="text-[10px] text-dark-muted">Device Protection</span>
                <p className="font-semibold text-dark-text">{customer.device_protection}</p>
              </div>
              <div className="rounded-lg bg-dark-secondary/50 p-2.5">
                <span className="text-[10px] text-dark-muted">Online Backup</span>
                <p className="font-semibold text-dark-text">{customer.online_backup}</p>
              </div>
              <div className="rounded-lg bg-dark-secondary/50 p-2.5">
                <span className="text-[10px] text-dark-muted">Streaming Media</span>
                <p className="font-semibold text-dark-text">
                  TV: {customer.streaming_tv} | Movies: {customer.streaming_movies}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Prediction Scorecard & Recommendation */}
        <div className="space-y-6 lg:col-span-5">
          {latestPred ? (
            <>
              {/* Scorecard */}
              <div className="rounded-xl border border-dark-border bg-dark-surface p-6 shadow-neon-subtle">
                <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text">
                    Current Churn Probability
                  </h3>
                  <RiskBadge level={latestPred.risk_level} size="md" />
                </div>

                <div className="mt-4 flex flex-col items-center">
                  <ProbabilityGauge probability={latestPred.churn_probability} size={180} />
                </div>
              </div>

              {/* SHAP Factors */}
              <div className="rounded-xl border border-dark-border bg-dark-surface p-6">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-dark-text pb-3 border-b border-dark-border">
                  <Zap className="h-4 w-4 text-brand-bright" />
                  Key Risk Drivers (SHAP)
                </h3>
                <div className="mt-4">
                  <ShapFactorBar factors={latestPred.top_factors} />
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-xl border border-brand-primary/40 bg-gradient-to-b from-dark-surface to-brand-primary/10 p-6">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-dark-text pb-3 border-b border-brand-primary/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Actionable Retention Plan
                </h3>
                <p className="mt-3 text-xs font-medium text-dark-text">
                  {latestPred.recommendation.summary}
                </p>
                <div className="mt-4 space-y-1.5">
                  {latestPred.recommendation.action_items && latestPred.recommendation.action_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-dark-muted bg-dark-secondary/40 p-2 rounded-lg">
                      <span className="text-brand-bright font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-dark-border bg-dark-surface/40 p-8 text-center">
              <History className="mx-auto h-8 w-8 text-dark-muted opacity-40" />
              <p className="mt-2 text-xs text-dark-muted">No historical prediction found for this customer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
