import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, Database, RefreshCw, Check } from 'lucide-react';
import { sampleService } from '../../services/sampleService';
import toast from 'react-hot-toast';

export interface SampleLogParameter {
  originalKey?: string;
  PARAM: string;
  DEF: string;
  UNIT: string;
  REF_METHOD: string;
  R_LIMIT: string;
  P_LIMIT: string;
}

export interface SampleLogsResponse {
  SAMPLE_LOGS: {
    LIST_COUNT: number;
    LISTS: Record<string, SampleLogParameter>;
  };
  LIST_COUNT: number;
  LISTS: Record<string, SampleLogParameter>;
}

const TableSkeleton = () => (
  <div className="space-y-3 p-5 animate-pulse">
    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
      <div key={item} className="h-10 rounded-lg bg-industrial-100" />
    ))}
  </div>
);

const SampleLogs: React.FC = () => {
  const [logs, setLogs] = useState<SampleLogParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedParams, setSelectedParams] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const data: SampleLogsResponse = await sampleService.getSampleLogs();
      console.log('[SampleLogs] API Response:', data);

      if (data?.LISTS) {
        const paramsArray = Object.entries(data.LISTS).map(([key, value]) => ({
          ...value,
          originalKey: key
        }));
        setLogs(paramsArray);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to load sample logs:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSelectOne = (param: string) => {
    const newSelected = new Set(selectedParams);
    if (newSelected.has(param)) {
      newSelected.delete(param);
    } else {
      newSelected.add(param);
    }
    setSelectedParams(newSelected);
  };

  const handleLogChange = (param: string, field: keyof SampleLogParameter, value: string) => {
    setLogs(prevLogs => prevLogs.map(log =>
      log.PARAM === param ? { ...log, [field]: value } : log
    ));

    if (!selectedParams.has(param)) {
      setSelectedParams(prev => new Set(prev).add(param));
    }
  };

  const handleSubmit = async () => {
    if (selectedParams.size === 0) return;
    try {
      setIsSubmitting(true);
      // Only send the selected logs
      const selectedLogsData = logs.filter(log => selectedParams.has(log.PARAM));
      // We pass selectedLogsData.length as the totalCount so the ESP32 gets the exact number
      await sampleService.updateSampleLogs(selectedLogsData, selectedLogsData.length);

      toast.success('Test parameters submitted successfully.');

      // Clear the selections automatically after successful submission
      setSelectedParams(new Set());

      // Automatically refresh the table data from the device
      await loadLogs();
    } catch (err) {
      console.error('Failed to submit test parameters:', err);
      toast.error('Failed to submit selected test parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full pb-8">
      {/* Main Container Card */}
      <section className="overflow-hidden rounded-2xl border border-industrial-200 bg-white shadow-sm flex flex-col w-full relative">
        {/* Table Toolbar */}
        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-industrial-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-industrial-900">Configured Parameters Directory</h2>
                {!loading && logs.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-industrial-100 text-industrial-600 border border-industrial-200">
                    {logs.length} Total
                  </span>
                )}
              </div>
              <p className="text-xs text-industrial-500">
                Edit reference methods and limits, then submit changes to device
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={loadLogs}
              disabled={loading || isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg border border-industrial-200 bg-white px-4 py-2 text-xs font-bold text-industrial-700 shadow-2xs hover:bg-industrial-50 hover:border-industrial-300 transition-all disabled:opacity-50"
              title="Refresh parameter directory"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-brand-600" : "text-industrial-500"} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <ShieldAlert size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-base font-bold text-gray-900">Failed to load test parameters.</p>
            <button
              className="mt-5 rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={loadLogs}
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 w-full max-h-[calc(100vh-320px)] overflow-y-auto">
            <table className="w-full min-w-[960px] table-fixed text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-industrial-50/90 backdrop-blur-xs text-[11px] font-bold text-industrial-600 uppercase tracking-wider border-b border-industrial-200">
                <tr>
                  <th className="px-4 py-3.5 w-14 text-center">#</th>
                  <th className="px-4 py-3.5 w-48">Parameter</th>
                  <th className="px-3 py-3.5 w-20 text-center">Unit</th>
                  <th className="px-4 py-3.5 min-w-[220px]">Reference Method</th>
                  <th className="px-3 py-3.5 w-32 text-center">Default Value</th>
                  <th className="px-4 py-3.5 w-36 text-center">Acceptable Limit</th>
                  <th className="px-4 py-3.5 w-36 text-center">Permissible Limit</th>
                  <th className="px-4 py-3.5 w-16 text-center">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100 bg-white">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <Database size={32} className="mx-auto text-industrial-300 mb-3" />
                      <p className="text-sm font-bold text-industrial-800">
                        No test parameters available.
                      </p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => {
                    const isSelected = selectedParams.has(log.PARAM);
                    return (
                      <tr
                        key={log.PARAM}
                        className={`text-xs transition-colors ${isSelected
                          ? 'bg-brand-50/40 border-l-2 border-l-brand-600'
                          : 'hover:bg-industrial-50/60 even:bg-industrial-50/20'
                          }`}
                      >
                        <td className="px-4 py-3 text-center text-xs font-mono font-bold text-industrial-400">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-industrial-900 truncate block text-xs" title={log.PARAM}>
                            {log.PARAM || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-industrial-600 font-medium text-xs">
                            {log.UNIT || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={log.REF_METHOD || ''}
                            onChange={(e) => handleLogChange(log.PARAM, 'REF_METHOD', e.target.value)}
                            placeholder="e.g. IS 3025"
                            className="w-full h-8.5 rounded-lg border border-industrial-200 bg-white px-3 text-xs text-industrial-800 placeholder:text-industrial-400 outline-none transition truncate hover:border-industrial-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          {log.DEF && log.DEF !== '—' && log.DEF.trim() ? (
                            <span
                              className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-industrial-100 text-industrial-700 border border-industrial-200 max-w-[120px] truncate"
                              title={log.DEF}
                            >
                              {log.DEF}
                            </span>
                          ) : (
                            <span className="text-industrial-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={log.R_LIMIT || ''}
                            onChange={(e) => handleLogChange(log.PARAM, 'R_LIMIT', e.target.value)}
                            placeholder="—"
                            className="w-full h-8.5 rounded-lg border border-industrial-200 bg-white px-3 text-xs font-medium text-center text-industrial-900 placeholder:text-industrial-400 outline-none transition hover:border-industrial-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={log.P_LIMIT || ''}
                            onChange={(e) => handleLogChange(log.PARAM, 'P_LIMIT', e.target.value)}
                            placeholder="—"
                            className="w-full h-8.5 rounded-lg border border-industrial-200 bg-white px-3 text-xs font-medium text-center text-industrial-900 placeholder:text-industrial-400 outline-none transition hover:border-industrial-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(log.PARAM)}
                            className="h-4 w-4 rounded border-industrial-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Sticky Bottom Action Footer */}
        {!loading && !error && logs.length > 0 && (
          <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-industrial-200 bg-white/95 px-6 py-3.5 shadow-lg backdrop-blur-sm rounded-b-2xl">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${selectedParams.size > 0
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'bg-industrial-100 text-industrial-600 border border-industrial-200'
                }`}>
                {selectedParams.size} of {logs.length} selected
              </span>

              {selectedParams.size > 0 && (
                <button
                  onClick={() => setSelectedParams(new Set())}
                  className="text-xs font-semibold text-industrial-500 hover:text-industrial-800 underline decoration-dotted transition-colors"
                >
                  Clear selection
                </button>
              )}

              <span className="text-xs text-industrial-500 hidden md:inline">
                {selectedParams.size > 0
                  ? 'Ready to update device configuration with selected parameter limits.'
                  : 'Select one or more parameters above to submit updates.'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={selectedParams.size === 0 || isSubmitting || loading}
                style={{ backgroundColor: '#4a35e8' }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={15} />
                <span>
                  {isSubmitting
                    ? 'Submitting Changes...'
                    : `Submit Changes ${selectedParams.size > 0 ? `(${selectedParams.size})` : ''}`}
                </span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SampleLogs;

