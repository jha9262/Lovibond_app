import React, { useState } from 'react';
import { Search, Edit2, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui';
import AddSampleForm from './AddSampleForm';
import { Sample, PaginationInfo } from '../../types';
import { formatDate } from '../../utils/dateTime';
import SampleTable from '../Samples/SampleTable';

interface SampleDirectoryProps {
  samples: Sample[];
  pagination: PaginationInfo;
  loading: boolean;
  error: boolean;
  onRequest: (params: any) => void;
}

const SampleDirectory: React.FC<SampleDirectoryProps> = ({ samples, pagination, loading, error, onRequest }) => {
  const [query, setQuery] = useState('');

  const request = (next: any) => onRequest({ page: pagination.page, limit: pagination.limit, search: query, ...next });
  const changeSearch = (value: string) => { setQuery(value); onRequest({ page: 1, limit: pagination.limit, search: value }); };

  return (
    <section className="overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm flex flex-col">
      <div className="flex flex-col gap-3 border-b border-industrial-100 p-4 sm:flex-row sm:items-center sm:justify-between bg-industrial-50/50">
        <div>
          <h2 className="text-base font-bold text-industrial-900">Directory</h2>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <label className="relative block sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400" size={15} />
            <input
              value={query}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search samples..."
              className="w-full rounded-lg border border-industrial-200 py-2 pl-9 pr-3 text-sm text-industrial-900 outline-none transition placeholder:text-industrial-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>
      </div>

      <SampleTable
        samples={samples}
        loading={loading}
        error={error}
        mode="full"
        searchQuery={query}
        onRetry={() => request({})}
      />
      {!loading && !error && samples.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-industrial-100 px-5 py-4 bg-white">
          <p className="text-sm text-industrial-500">
            Showing <span className="font-semibold text-brand-700">{samples.length}</span> {samples.length === 1 ? 'sample' : 'samples'} total
          </p>
        </div>
      )}
    </section>
  );
};

interface SampleManagementProps {
  samples: Sample[];
  pagination: PaginationInfo;
  loading: boolean;
  error: boolean;
  onRequestSamples: (params: any) => void;
  onCreateSample: (payload: any) => Promise<any>;
}

const SampleManagement: React.FC<SampleManagementProps> = ({ samples, pagination, loading, error, onRequestSamples, onCreateSample }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSample = async (payload: Partial<Sample>) => {
    try {
      const result = await onCreateSample([payload]);
      if (result.failedCount > 0) {
        toast.error('A sample with this ID may already exist');
        return false;
      } else {
        toast.success('Sample created successfully');
        return true;
      }
    } catch (createError: any) {
      toast.error(createError?.message || 'Unable to create sample');
      return false;
    }
  };

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Samples</p>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Samples</h1>
        </div>
        <div className="relative z-10">
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: '#4a35e8' }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 active:scale-[0.99] transition-all shrink-0"
          >
            <Plus size={16} />
            <span>Create Sample</span>
          </button>
        </div>
      </header>

      <AddSampleForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSample={handleCreateSample}
      />

      <SampleDirectory samples={samples} pagination={pagination} loading={loading} error={error} onRequest={onRequestSamples} />
    </div>
  );
};

export default SampleManagement;