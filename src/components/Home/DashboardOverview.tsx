import React, { useEffect, useState } from 'react';
import { ClipboardList, Users, AlertCircle, RefreshCw, ArrowRight, Activity, FlaskConical, CircleDot } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
const API_URL = API_BASE_URL;

import { Sample, DashboardStats } from '../../types';
import SampleTable from '../Samples/SampleTable';

const parseCustomDate = (val: any) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  const str = String(val).trim();
  const formatted = str.replace(/\//g, '-').replace(/^(\d{4}-\d{2}-\d{2})-(.*)$/, '$1T$2');
  const d = new Date(formatted);
  if (!isNaN(d.getTime())) return d;
  const fallback = new Date(str);
  return !isNaN(fallback.getTime()) ? fallback : null;
};

const formatDate = (value: any) => {
  if (!value) return '—';
  const date = parseCustomDate(value);
  if (date) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }
  return String(value);
};

const toCount = (value: any) => {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
};

const SummaryCard = ({ title, value, icon: Icon, bgClass, iconClass }: any) => (
  <article className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-industrial-100 p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${bgClass}`}>
    <div className="flex items-start justify-between">
      <h2 className="text-sm font-bold uppercase tracking-wider text-industrial-600">{title}</h2>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${iconClass}`}>
        <Icon size={20} />
      </span>
    </div>
    <div className="mt-6">
      <p className="text-4xl font-black tracking-tight text-industrial-900">{value}</p>
    </div>
  </article>
);

interface DashboardOverviewProps {
  samples: Sample[];
  loading: boolean;
  error: boolean;
  onViewSamples: () => void;
  onRetry?: () => void;
  totalCount?: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ samples, loading, error, onViewSamples, onRetry }) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSamples: 0,
    availableSamples: 0,
    electrochemistryTests: 0,
    electrochemistryInventory: 0,
    photometerTests: 0,
    photometerInventory: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(false);

  const [recentSamples, setRecentSamples] = useState<Sample[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(false);

  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError(false);
    try {
      const { data } = await axios.get(`${API_URL}/DASHBOARD_INNVENTORY_INFORMATION`, {
        timeout: 5000,
      });
      const inventory = data?.DCN_LOGGER_DATA;
      if (!inventory) throw new Error('Missing DCN_LOGGER_DATA in dashboard response');

      setDashboardStats({
        totalUsers: toCount(inventory.TOTAL_USERS_CREATED),
        totalSamples: toCount(inventory.TOTAL_SAMPLE_CREATED),
        availableSamples: toCount(inventory.AVAILABLE_SAMPLE),
        electrochemistryTests: toCount(inventory.ELECTROCHEMISTRY_TEST),
        electrochemistryInventory: toCount(inventory.ELECTROCHEMISTRY_INVENTORY),
        photometerTests: toCount(inventory.PHOTOMETER_TEST),
        photometerInventory: toCount(inventory.PHOTOMETER_INVENTORY),
      });
    } catch (err) {
      console.error('Failed to load dashboard inventory:', err);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentSamples = async () => {
    setRecentLoading(true);
    setRecentError(false);
    try {
      const { sampleService } = await import('../../services/sampleService');
      const samples = await sampleService.getRecentSamples(5);
      setRecentSamples(samples);
    } catch (err) {
      console.error('Failed to load recent samples:', err);
      setRecentError(true);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentSamples();
  }, [samples]);

  const handleRetryAll = () => {
    if (onRetry) onRetry();
    fetchDashboardStats();
    fetchRecentSamples();
  };

  const isOverallLoading = loading || statsLoading || recentLoading;
  const isOverallError = error || statsError;

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Dashboard</p>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Dashboard</h1>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <p className="text-xs font-semibold text-industrial-500 hidden sm:block">System overview and sample activity</p>
        </div>
      </header>

      {isOverallLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex h-36 flex-col justify-between rounded-2xl border border-industrial-200 bg-white p-5 shadow-xs animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="h-4 w-28 rounded bg-industrial-200" />
                  <div className="h-10 w-10 rounded-xl bg-industrial-200" />
                </div>
                <div className="h-9 w-16 rounded bg-industrial-200" />
              </div>
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-industrial-200 animate-pulse" />
        </div>
      ) : isOverallError ? (
        <section className="rounded-2xl border border-industrial-200 bg-white px-6 py-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4 ring-8 ring-red-50/50">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-base font-black text-industrial-900">Unable to load dashboard data</h2>
          <p className="mt-1 text-sm text-industrial-500">The dashboard data could not be retrieved from the server.</p>
          <button
            onClick={handleRetryAll}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-brand-700 active:scale-95"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-5 xl:gap-5">
            <SummaryCard
              title="Total Users"
              value={dashboardStats.totalUsers}
              icon={Users}
              bgClass="bg-violet-50/50 hover:bg-violet-50"
              iconClass="text-violet-600"
            />

            {/* Combined Sample Inventory Card (Spans 2 columns) */}
            <article className="col-span-2 group flex flex-col justify-between overflow-hidden rounded-2xl border border-industrial-100 bg-blue-50/30 p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-blue-50/50">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-industrial-600">Sample Inventory</h2>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 text-blue-600">
                  <ClipboardList size={20} />
                </span>
              </div>
              <div className="flex flex-1 items-end justify-between gap-4 mt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-industrial-400 mb-1">Active Samples</span>
                  <span className="text-3xl font-black tracking-tight text-industrial-900">{dashboardStats.totalSamples}</span>
                </div>
                <div className="w-px h-12 bg-industrial-200" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-industrial-400 mb-1">Available Samples</span>
                  <span className="text-3xl font-black tracking-tight text-emerald-600">{dashboardStats.availableSamples}</span>
                </div>
                <div className="w-px h-12 bg-industrial-200" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-industrial-400 mb-1">Inventory</span>
                  <span className="text-3xl font-black tracking-tight text-blue-600">{dashboardStats.totalSamples + dashboardStats.availableSamples}</span>
                </div>
              </div>
            </article>

            <SummaryCard
              title="Electrochemistry"
              value={dashboardStats.electrochemistryTests}
              icon={FlaskConical}
              bgClass="bg-amber-50/50 hover:bg-amber-50"
              iconClass="text-amber-600"
            />
            <SummaryCard
              title="Photometer"
              value={dashboardStats.photometerTests}
              icon={CircleDot}
              bgClass="bg-brand-50/50 hover:bg-brand-50"
              iconClass="text-brand-600"
            />
          </section>

          <section className="overflow-hidden rounded-2xl border border-industrial-200 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-industrial-100 bg-white px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-industrial-900">RECENT SAMPLES</h2>
                <span className="inline-flex items-center rounded-full bg-industrial-100 px-2.5 py-0.5 text-xs font-bold text-industrial-600 border border-industrial-200/60">
                  {recentSamples.length}
                </span>
              </div>
              <button
                onClick={onViewSamples}
                className="group inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-colors hover:text-brand-700 focus:ring-2 focus:ring-brand-500 outline-none rounded"
              >
                <span>View all</span>
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
            <SampleTable
              samples={recentSamples}
              loading={recentLoading}
              error={recentError}
              mode="recent"
              onRetry={fetchRecentSamples}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardOverview;