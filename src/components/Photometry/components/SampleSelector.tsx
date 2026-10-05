import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { deviceService } from '../services/deviceService';
import { Sample } from '../../../types';

interface SampleSelectorProps {
  selectedSample: Sample | null;
  onSelectSample: (sample: Sample | null) => void;
  loading?: boolean;
  searchDisabled?: boolean;
  availableSamples?: Sample[];
}

const SampleSelector: React.FC<SampleSelectorProps> = ({
  selectedSample,
  onSelectSample,
  searchDisabled = false,
  availableSamples = [],
}) => {
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchConfig = async () => {
      try {
        setLoadingConfig(true);
        const data = await deviceService.getSampleConfiguration();
        let parsed = data;
        if (typeof data === 'string') {
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            console.error('JSON parse error', e);
          }
        }
        const cfg = parsed?.SAMPLE_CONFIGURATION || parsed;
        if (mounted && cfg) setConfig(cfg);
      } catch (err) {
        console.error('Failed to load sample configuration', err);
      } finally {
        if (mounted) setLoadingConfig(false);
      }
    };
    fetchConfig();
    return () => {
      mounted = false;
    };
  }, []);

  const rawFromConfig: any[] = config?.SAMPLES
    ? Object.values(config.SAMPLES)
    : Array.isArray(config?.samples)
      ? config.samples
      : Array.isArray(config)
        ? config
        : [];

  const allSamples: any[] =
    rawFromConfig.length > 0
      ? rawFromConfig
      : availableSamples && availableSamples.length > 0
        ? availableSamples
        : [];

  const samples = allSamples.filter((s) => {
    const q = searchTerm.toLowerCase();
    const sId = String(s.SAMPLE_ID || s.sampleId || '');
    const sName = String(s.SAMPLE_NAME || s.sampleName || '');
    const uName = String(s.USER_NAME || s.userName || '');
    return (
      sId.toLowerCase().includes(q) ||
      sName.toLowerCase().includes(q) ||
      uName.toLowerCase().includes(q)
    );
  });

  return (
    <section className="rounded-xl border border-industrial-200 bg-white shadow-sm flex flex-col sm:flex-row p-2 gap-2 sm:items-center">
      <div className="flex w-full sm:w-auto gap-2">
        <div className="relative w-full sm:w-64 shrink-0">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400"
          />
          <input
            type="text"
            placeholder="Search samples..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loadingConfig || searchDisabled}
            className="w-full rounded-lg border-0 bg-industrial-50 py-2 pl-9 pr-3 text-xs font-semibold text-industrial-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-500/50 hover:bg-industrial-100 disabled:opacity-50"
          />
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <select
            value={selectedSample?.sampleId || ''}
            onChange={(e) => {
              const val = String(e.target.value);
              const sample = allSamples.find(
                (s) => String(s.SAMPLE_ID || s.sampleId) === val
              );
              const sId = sample?.SAMPLE_ID || sample?.sampleId || val;
              onSelectSample(sample ? { ...sample, sampleId: sId } : null);
              setSearchTerm('');
            }}
            disabled={loadingConfig && allSamples.length === 0}
            size={searchTerm ? 5 : 1}
            className={`w-full appearance-none rounded-lg border-0 bg-industrial-50 pl-3 text-xs font-semibold text-industrial-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-500/50 hover:bg-industrial-100 disabled:opacity-50 ${searchTerm ? 'py-2 pr-3' : 'py-2 pr-8'
              }`}
          >
            {!searchTerm && <option value="">Select a sample...</option>}
            {samples.length > 0 ? (
              samples.map((s) => {
                const idVal = s.SAMPLE_ID || s.sampleId;
                return (
                  <option key={idVal} value={idVal}>
                    {idVal}
                  </option>
                );
              })
            ) : (
              <option value="" disabled>
                {loadingConfig ? 'Loading samples...' : 'No samples found'}
              </option>
            )}
          </select>
          {!searchTerm && (
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-industrial-400"
            />
          )}
        </div>
      </div>

      {selectedSample && (
        <div className="flex-1 rounded-lg bg-brand-50/50 px-3 py-2 flex items-center justify-between gap-4 border border-brand-100/50 min-w-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-600/70 whitespace-nowrap">
              USER:
            </span>
            <span className="text-xs font-bold text-brand-900 truncate">
              {selectedSample.userId ||
                (selectedSample as any).USER_ID ||
                (selectedSample as any).USER_NAME ||
                '—'}
            </span>
          </div>
          <div className="h-4 w-px bg-brand-200/50 hidden sm:block shrink-0"></div>
          <div className="flex items-center gap-2 overflow-hidden text-right">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-600/70 whitespace-nowrap">
              CREATED:
            </span>
            <span className="text-xs font-bold text-brand-900 truncate">
              {selectedSample.createdDate ||
                (selectedSample as any).SAMPLE_DATE_TIME ||
                '—'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default SampleSelector;
