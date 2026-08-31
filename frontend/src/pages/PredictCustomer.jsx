import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  CreditCard,
  Wifi,
  LifeBuoy,
  Layers
} from 'lucide-react';

import ProbabilityGauge from '../components/ProbabilityGauge';
import RiskBadge from '../components/RiskBadge';
import ShapFactorBar from '../components/ShapFactorBar';
import { apiService } from '../services/api';

const PRESETS = {
  highRisk: {
    label: 'High Risk Profile (Month-to-Month + Fiber)',
    data: {
      customer_id: 'CUST-HIGH-RISK',
      gender: 'Female',
      SeniorCitizen: 0,
      Partner: 'No',
      Dependents: 'No',
      tenure: 2,
      PhoneService: 'Yes',
      MultipleLines: 'No',
      InternetService: 'Fiber optic',
      OnlineSecurity: 'No',
      OnlineBackup: 'No',
      DeviceProtection: 'No',
      TechSupport: 'No',
      StreamingTV: 'Yes',
      StreamingMovies: 'Yes',
      Contract: 'Month-to-month',
      PaperlessBilling: 'Yes',
      PaymentMethod: 'Electronic check',
      MonthlyCharges: 94.85,
      TotalCharges: 189.70,
    }
  },
  lowRisk: {
    label: 'Low Risk Profile (2-Year Contract + Bundled)',
    data: {
      customer_id: 'CUST-LOYAL-CORP',
      gender: 'Male',
      SeniorCitizen: 0,
      Partner: 'Yes',
      Dependents: 'Yes',
      tenure: 62,
      PhoneService: 'Yes',
      MultipleLines: 'Yes',
      InternetService: 'DSL',
      OnlineSecurity: 'Yes',
      OnlineBackup: 'Yes',
      DeviceProtection: 'Yes',
      TechSupport: 'Yes',
      StreamingTV: 'No',
      StreamingMovies: 'No',
      Contract: 'Two year',
      PaperlessBilling: 'No',
      PaymentMethod: 'Credit card (automatic)',
      MonthlyCharges: 58.20,
      TotalCharges: 3608.40,
    }
  }
};

export default function PredictCustomer() {
  const [formData, setFormData] = useState({
    customer_id: '',
    gender: 'Female',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',
    tenure: 6,
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'Yes',
    StreamingMovies: 'Yes',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 84.50,
    TotalCharges: 507.00,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      };
      // Auto estimate total charges if tenure or monthly charges change
      if (name === 'tenure' || name === 'MonthlyCharges') {
        const t = name === 'tenure' ? parseFloat(value) || 0 : prev.tenure;
        const m = name === 'MonthlyCharges' ? parseFloat(value) || 0 : prev.MonthlyCharges;
        updated.TotalCharges = parseFloat((t * m).toFixed(2));
      }
      return updated;
    });
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setFormData(preset.data);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiService.predictChurn(formData);
      setResult(res);
    } catch (err) {
      console.error('Inference error:', err);
      setError(err.message || 'Model prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-dark-text dark:text-dark-text light:text-light-text flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-brand-bright" />
            Predict Customer Churn Risk
          </h2>
          <p className="text-xs text-dark-muted dark:text-dark-muted light:text-light-muted">
            Execute real-time ML inference with SHAP TreeExplainer feature attribution & automated retention strategy.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-dark-muted">Demo Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('highRisk')}
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition-all hover:bg-rose-500/20"
          >
            High Risk
          </button>
          <button
            type="button"
            onClick={() => applyPreset('lowRisk')}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-all hover:bg-emerald-500/20"
          >
            Loyal Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Form Column */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-6 shadow-card-dark"
          >
            <div className="space-y-6">
              {/* Group 1: Profile & Demographics */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary pb-2 border-b border-dark-border dark:border-dark-border light:border-light-border">
                  <UserCheck className="h-4 w-4" /> 1. Customer Profile
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Customer ID</label>
                    <input
                      type="text"
                      name="customer_id"
                      value={formData.customer_id}
                      onChange={handleInputChange}
                      placeholder="e.g. CUST-7891 (optional)"
                      className="mt-1 w-full rounded-lg border border-dark-border dark:border-dark-border light:border-light-border bg-dark-secondary/60 dark:bg-dark-secondary/60 light:bg-light-secondary px-3 py-2 text-xs text-dark-text dark:text-dark-text light:text-light-text focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Senior Citizen</label>
                    <select
                      name="SeniorCitizen"
                      value={formData.SeniorCitizen}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    >
                      <option value={0}>No (Under 65)</option>
                      <option value={1}>Yes (Senior Citizen)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Partner & Dependents</label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <select
                        name="Partner"
                        value={formData.Partner}
                        onChange={handleInputChange}
                        className="rounded-lg border border-dark-border bg-dark-secondary/60 px-2.5 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                      >
                        <option value="No">No Partner</option>
                        <option value="Yes">Partner</option>
                      </select>
                      <select
                        name="Dependents"
                        value={formData.Dependents}
                        onChange={handleInputChange}
                        className="rounded-lg border border-dark-border bg-dark-secondary/60 px-2.5 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                      >
                        <option value="No">No Dependents</option>
                        <option value="Yes">Dependents</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Subscription & Contract */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary pb-2 border-b border-dark-border">
                  <CreditCard className="h-4 w-4" /> 2. Contract & Subscription
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-dark-muted">Tenure (Months)</label>
                      <span className="text-xs font-bold text-brand-bright">{formData.tenure} mos</span>
                    </div>
                    <input
                      type="range"
                      name="tenure"
                      min="0"
                      max="72"
                      value={formData.tenure}
                      onChange={handleInputChange}
                      className="mt-2 w-full accent-brand-bright"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Contract Term</label>
                    <select
                      name="Contract"
                      value={formData.Contract}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    >
                      <option value="Month-to-month">Month-to-month</option>
                      <option value="One year">One year</option>
                      <option value="Two year">Two year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Payment Method</label>
                    <select
                      name="PaymentMethod"
                      value={formData.PaymentMethod}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    >
                      <option value="Electronic check">Electronic check</option>
                      <option value="Mailed check">Mailed check</option>
                      <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                      <option value="Credit card (automatic)">Credit card (automatic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Paperless Billing</label>
                    <select
                      name="PaperlessBilling"
                      value={formData.PaperlessBilling}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    >
                      <option value="Yes">Yes (Paperless)</option>
                      <option value="No">No (Paper Invoices)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Group 3: Services & Support */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary pb-2 border-b border-dark-border">
                  <Wifi className="h-4 w-4" /> 3. Services & Add-ons
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Internet Service</label>
                    <select
                      name="InternetService"
                      value={formData.InternetService}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    >
                      <option value="Fiber optic">Fiber optic</option>
                      <option value="DSL">DSL</option>
                      <option value="No">No Internet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Dedicated Tech Support</label>
                    <select
                      name="TechSupport"
                      value={formData.TechSupport}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    >
                      <option value="No">No Tech Support</option>
                      <option value="Yes">Yes (Active)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Online Security</label>
                    <select
                      name="OnlineSecurity"
                      value={formData.OnlineSecurity}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    >
                      <option value="No">No Security</option>
                      <option value="Yes">Yes (Active)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Group 4: Charges */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary pb-2 border-b border-dark-border">
                  <CreditCard className="h-4 w-4" /> 4. Billing & Spend
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Monthly Charges ($)</label>
                    <input
                      type="number"
                      name="MonthlyCharges"
                      step="0.05"
                      min="15"
                      max="150"
                      value={formData.MonthlyCharges}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-muted">Total Charges ($)</label>
                    <input
                      type="number"
                      name="TotalCharges"
                      step="0.1"
                      min="0"
                      value={formData.TotalCharges}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-secondary via-brand-bright to-brand-primary py-3 text-xs font-bold text-white shadow-neon transition-all hover:opacity-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Calculating ML Inference & SHAP Attribution...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Compute Churn Risk & Retention Actions
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-semibold">Prediction Failed</span>
              </div>
              <p className="mt-1 text-xs text-dark-muted">{error}</p>
            </div>
          )}

          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Main Scorecard */}
              <div className="rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-6 shadow-neon-subtle">
                <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                  <span className="font-mono text-xs font-semibold text-dark-muted">
                    {result.customer_id}
                  </span>
                  <RiskBadge level={result.risk_level} size="md" />
                </div>

                <div className="mt-6 flex flex-col items-center">
                  <ProbabilityGauge probability={result.churn_probability} size={200} />
                  
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-dark-secondary/80 px-3 py-1 text-xs font-bold">
                    <span>Model Decision:</span>
                    <span className={result.prediction === 'CHURN' ? 'text-rose-400' : 'text-emerald-400'}>
                      {result.prediction === 'CHURN' ? 'Likely to Churn' : 'Likely to Stay'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dark-border flex justify-between text-[11px] text-dark-muted">
                  <span>Engine: {result.model_name}</span>
                  <span>v{result.model_version}</span>
                </div>
              </div>

              {/* SHAP Explanation Card */}
              <div className="rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-6">
                <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text dark:text-dark-text light:text-light-text flex items-center gap-2">
                    <Zap className="h-4 w-4 text-brand-bright" />
                    Top Influential Risk Drivers (SHAP)
                  </h3>
                  <span className="text-[10px] text-dark-muted">Local Attribution</span>
                </div>

                <div className="mt-4">
                  <ShapFactorBar factors={result.top_factors} />
                </div>
              </div>

              {/* Retention Recommendation Plan */}
              <div className="rounded-xl border border-brand-primary/40 bg-gradient-to-b from-dark-surface to-brand-primary/10 p-6 shadow-neon-subtle">
                <div className="flex items-center justify-between pb-3 border-b border-brand-primary/30">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Retention Recommendation
                  </h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    result.recommendation.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300' : 'bg-brand-primary/20 text-brand-bright'
                  }`}>
                    {result.recommendation.priority} Priority
                  </span>
                </div>

                <p className="mt-3 text-xs font-medium text-dark-text">
                  {result.recommendation.summary}
                </p>

                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
                    Recommended Action Items:
                  </span>
                  {result.recommendation.action_items && result.recommendation.action_items.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-dark-muted bg-dark-secondary/40 p-2 rounded-lg">
                      <span className="text-brand-bright font-bold">•</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface/40 p-12 text-center">
              <BrainCircuit className="h-12 w-12 text-dark-muted opacity-40" />
              <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-dark-text">
                No Prediction Active
              </h3>
              <p className="mt-1 text-xs text-dark-muted max-w-xs">
                Fill out the customer attributes or choose a demo preset, then click "Compute Churn Risk".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
