import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  Sliders,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { apiService } from '../services/api';

export default function ModelInsights() {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiService.getModelMetadata()
      .then((data) => setMetadata(data))
      .catch((err) => {
        console.error('Failed to load model metadata:', err);
        setError(err.message || 'Model evaluation results are not available yet.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-xs text-dark-muted">Loading serialized model performance telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="rounded-xl border border-dashed border-dark-border bg-dark-surface p-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-400 opacity-80" />
        <h3 className="mt-3 text-sm font-bold uppercase tracking-wider text-dark-text">
          Model Evaluation Unavailable
        </h3>
        <p className="mt-1 text-xs text-dark-muted max-w-md mx-auto">
          Model evaluation results are not available yet. Please train the model via <code className="rounded bg-dark-secondary px-1.5 py-0.5 font-mono text-brand-bright">python -m src.train</code>.
        </p>
      </div>
    );
  }

  const {
    model_name = 'XGBoost Classifier',
    version = '1.0.0',
    training_date,
    metrics = {},
    confusion_matrix = {},
    hyperparameters = {},
    global_feature_importance = []
  } = metadata;

  const {
    accuracy = 0,
    precision = 0,
    recall = 0,
    f1 = 0,
    roc_auc = 0,
    brier_score = 0
  } = metrics;

  const cm = confusion_matrix.matrix || [[0, 0], [0, 0]];
  const tn = cm[0][0];
  const fp = cm[0][1];
  const fn = cm[1][0];
  const tp = cm[1][1];

  const maxImportance = global_feature_importance.length > 0
    ? Math.max(...global_feature_importance.map(f => f.importance || 0.01))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-dark-text flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-bright" />
            Model Telemetry, Validation & SHAP Global Attribution
          </h2>
          <p className="text-xs text-dark-muted">
            Audited offline test metrics from the tuned production model artifact.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-1.5 text-xs text-dark-muted">
          <span>Selected Model:</span>
          <strong className="text-brand-bright">{model_name}</strong>
          <span className="rounded bg-brand-bright/20 px-1 py-0.5 text-[9px] font-bold text-brand-bright">
            v{version}
          </span>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          title="ROC-AUC Score"
          value={roc_auc ? roc_auc.toFixed(4) : '—'}
          subtitle="Discriminative power"
          trend="Primary Metric"
          trendPositive={true}
        />
        <MetricCard
          title="Recall (Sensitivity)"
          value={recall ? `${(recall * 100).toFixed(1)}%` : '—'}
          subtitle="Catches ~80% of churners"
          trend="Critical"
          trendPositive={true}
        />
        <MetricCard
          title="Precision"
          value={precision ? `${(precision * 100).toFixed(1)}%` : '—'}
          subtitle="True positive precision"
        />
        <MetricCard
          title="F1-Score"
          value={f1 ? f1.toFixed(4) : '—'}
          subtitle="Harmonic mean"
        />
        <MetricCard
          title="Overall Accuracy"
          value={accuracy ? `${(accuracy * 100).toFixed(1)}%` : '—'}
          subtitle="Test benchmark"
        />
        <MetricCard
          title="Brier Score Loss"
          value={brier_score ? brier_score.toFixed(4) : '—'}
          subtitle="Probability calibration"
        />
      </div>

      {/* Confusion Matrix & Hyperparameters */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Confusion Matrix Card */}
        <div className="rounded-xl border border-dark-border bg-dark-surface p-6 shadow-card-dark lg:col-span-6">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text">
              Held-Out Test Confusion Matrix
            </h3>
            <span className="text-[10px] text-dark-muted">1,409 Test Samples</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            {/* True Negative */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                True Negatives (TN)
              </span>
              <p className="mt-1 font-mono text-3xl font-extrabold text-emerald-300">{tn}</p>
              <span className="mt-1 block text-[10px] text-dark-muted">Stay correctly identified</span>
            </div>

            {/* False Positive */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                False Positives (FP)
              </span>
              <p className="mt-1 font-mono text-3xl font-extrabold text-amber-300">{fp}</p>
              <span className="mt-1 block text-[10px] text-dark-muted">Predicted churn, actually stayed</span>
            </div>

            {/* False Negative */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                False Negatives (FN)
              </span>
              <p className="mt-1 font-mono text-3xl font-extrabold text-rose-300">{fn}</p>
              <span className="mt-1 block text-[10px] text-dark-muted">Missed churners (Costly)</span>
            </div>

            {/* True Positive */}
            <div className="rounded-xl border border-brand-primary/40 bg-brand-primary/10 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-bright">
                True Positives (TP)
              </span>
              <p className="mt-1 font-mono text-3xl font-extrabold text-brand-bright">{tp}</p>
              <span className="mt-1 block text-[10px] text-dark-muted">Correctly caught churners</span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-dark-muted text-center">
            By prioritizing high Recall (~80%), the model minimizes False Negatives (missed churners), directly enabling proactive retention interventions.
          </p>
        </div>

        {/* Hyperparameters Config */}
        <div className="rounded-xl border border-dark-border bg-dark-surface p-6 shadow-card-dark lg:col-span-6">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text flex items-center gap-2">
              <Sliders className="h-4 w-4 text-brand-bright" />
              Tuned Hyperparameters
            </h3>
            <span className="text-[10px] text-dark-muted">GridSearchCV Optimized</span>
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(hyperparameters).map(([key, val], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-dark-secondary/50 px-3 py-2 text-xs"
              >
                <span className="font-mono text-dark-muted">{key}</span>
                <span className="font-mono font-semibold text-brand-bright">
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-dark-secondary/30 p-3 text-[11px] text-dark-muted">
            <div className="flex items-center gap-1.5 font-semibold text-dark-text">
              <Info className="h-3.5 w-3.5 text-brand-primary" /> Training Pipeline Details
            </div>
            <p className="mt-1">
              Imbalance handled using class weight ratio adjustment and training-fold validation to prevent data leakage. Preprocessing ColumnTransformer fitted solely on training splits.
            </p>
          </div>
        </div>
      </div>

      {/* Global SHAP Feature Importance */}
      <div className="rounded-xl border border-dark-border bg-dark-surface p-6 shadow-card-dark">
        <div className="flex items-center justify-between pb-4 border-b border-dark-border">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-text flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-bright" />
              Global Feature Importance (Mean Absolute SHAP Values)
            </h3>
            <p className="text-[11px] text-dark-muted">
              Quantifies average magnitude of feature influence on churn predictions across the dataset.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {global_feature_importance.slice(0, 10).map((feat, idx) => {
            const pct = Math.min(100, Math.max(8, Math.round((feat.importance / maxImportance) * 100)));
            return (
              <div key={idx} className="group rounded-lg bg-dark-secondary/40 p-3 transition-colors hover:bg-dark-secondary">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-dark-text">
                    #{idx + 1} {feat.feature_label || feat.feature}
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-bright">
                    {feat.importance.toFixed(4)}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-dark-bg">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-secondary via-brand-bright to-brand-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
