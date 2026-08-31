import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { apiService } from '../services/api';

export default function CustomerExplorer({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [internetFilter, setInternetFilter] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        risk_level: riskFilter || undefined,
        contract: contractFilter || undefined,
        internet_service: internetFilter || undefined
      };
      const res = await apiService.getCustomers(params);
      setCustomers(res.customers || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Customer fetch error:', err);
      setError(err.message || 'Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, riskFilter, contractFilter, internetFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-dark-text dark:text-dark-text light:text-light-text flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-bright" />
            Customer Portfolio Explorer
          </h2>
          <p className="text-xs text-dark-muted dark:text-dark-muted light:text-light-muted">
            Search, segment, and inspect individual customer churn telemetry across the enterprise.
          </p>
        </div>
        <div className="text-xs text-dark-muted">
          Showing <strong className="text-dark-text">{customers.length}</strong> of{' '}
          <strong className="text-dark-text">{total}</strong> accounts
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-4 shadow-card-dark">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer ID (e.g. 7590-VHVEG)..."
              className="w-full rounded-lg border border-dark-border bg-dark-secondary/60 pl-9 pr-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
            />
          </div>

          {/* Risk Tier Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
            >
              <option value="">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          {/* Contract Filter */}
          <div>
            <select
              value={contractFilter}
              onChange={(e) => { setContractFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-dark-border bg-dark-secondary/60 px-3 py-2 text-xs text-dark-text focus:border-brand-primary focus:outline-none"
            >
              <option value="">All Contract Types</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          {/* Search Trigger Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-neon-subtle hover:bg-brand-bright"
          >
            <Filter className="h-3.5 w-3.5" /> Apply Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface shadow-card-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-dark-border bg-dark-secondary/40 text-[11px] font-semibold uppercase text-dark-muted">
                <th className="px-4 py-3.5">Customer ID</th>
                <th className="px-4 py-3.5">Contract</th>
                <th className="px-4 py-3.5">Internet Service</th>
                <th className="px-4 py-3.5">Tenure</th>
                <th className="px-4 py-3.5">Monthly Spend</th>
                <th className="px-4 py-3.5">Churn Probability</th>
                <th className="px-4 py-3.5">Risk Tier</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-dark-muted">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                      Loading customer records...
                    </div>
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-dark-secondary/30"
                  >
                    <td className="px-4 py-3.5 font-mono font-medium text-dark-text">
                      {c.customer_id}
                    </td>
                    <td className="px-4 py-3.5 text-dark-muted">
                      {c.contract || 'Month-to-month'}
                    </td>
                    <td className="px-4 py-3.5 text-dark-muted">
                      {c.internet_service || 'DSL'}
                    </td>
                    <td className="px-4 py-3.5 text-dark-text font-medium">
                      {c.tenure} mos
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-dark-text">
                      ${Number(c.monthly_charges).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold">
                      {c.latest_probability !== null ? (
                        <span
                          className={
                            c.latest_probability >= 0.7
                              ? 'text-rose-400'
                              : c.latest_probability >= 0.4
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {(c.latest_probability * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-dark-muted">Unassessed</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <RiskBadge level={c.latest_risk_level || 'LOW'} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onSelectCustomer(c.customer_id)}
                        className="rounded-lg border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-bright transition-all hover:bg-brand-primary hover:text-white"
                      >
                        Inspect Profile →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-dark-muted">
                    No customers match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-dark-border px-4 py-3 text-xs">
          <span className="text-dark-muted">
            Page <strong className="text-dark-text">{page}</strong> of{' '}
            <strong className="text-dark-text">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-dark-border bg-dark-secondary/60 text-dark-muted hover:text-dark-text disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-dark-border bg-dark-secondary/60 text-dark-muted hover:text-dark-text disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
