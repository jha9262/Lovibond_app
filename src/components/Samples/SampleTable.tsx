import React, { useState } from 'react';
import { Download, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sample } from '../../types';
import { formatDate } from '../../utils/dateTime';
// @ts-ignore
import DownloadModal from '../Report/components/DownloadModal';

interface SampleTableProps {
  samples: Sample[];
  loading: boolean;
  error: boolean;
  mode: 'recent' | 'full';
  onCreateSample?: () => void;
  onRetry?: () => void;
  searchQuery?: string;
  startIndex?: number;
}

const TableSkeleton = () => (
  <div className="w-full">
    <table className="w-full text-left">
      <thead className="bg-industrial-50 text-[10px] font-bold uppercase tracking-wider text-industrial-500 border-b border-industrial-100">
        <tr>
          <th className="px-4 py-3.5 w-12 hidden sm:table-cell text-center">No</th>
          <th className="px-4 py-3.5">Sample ID</th>
          <th className="px-4 py-3.5">User ID</th>
          <th className="px-4 py-3.5">Sample Type</th>
          <th className="px-4 py-3.5 hidden sm:table-cell">District</th>
          <th className="px-4 py-3.5 text-right">Created Date</th>
          <th className="px-4 py-3.5 hidden sm:table-cell text-right">End Date</th>
          <th className="px-4 py-3.5 text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-industrial-100 bg-white animate-pulse">
        {[1, 2, 3, 4, 5].map((item) => (
          <tr key={item}>
            <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 bg-industrial-100 rounded w-6 mx-auto" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-industrial-100 rounded w-24" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-industrial-100 rounded w-20" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-industrial-100 rounded w-20" /></td>
            <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 bg-industrial-100 rounded w-24" /></td>
            <td className="px-4 py-3 text-right"><div className="h-4 bg-industrial-100 rounded w-28 ml-auto" /></td>
            <td className="px-4 py-3 hidden sm:table-cell text-right"><div className="h-4 bg-industrial-100 rounded w-28 ml-auto" /></td>
            <td className="px-4 py-3"><div className="h-6 bg-industrial-100 rounded w-8 mx-auto" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SampleTable: React.FC<SampleTableProps> = ({ samples, loading, error, mode, onCreateSample, onRetry, searchQuery, startIndex = 0 }) => {
  const navigate = useNavigate();
  const [selectedSampleForDownload, setSelectedSampleForDownload] = useState<Sample | null>(null);

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="px-6 py-12 text-center bg-white">
        <p className="text-sm font-bold text-industrial-900">Unable to load samples</p>
        <p className="mt-1 text-xs text-industrial-500">The sample data could not be retrieved from the server.</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-industrial-200 bg-white px-4 py-1.5 text-xs font-bold text-industrial-800 hover:bg-industrial-50 transition-colors focus:ring-2 focus:ring-brand-500 outline-none"
        >
          Retry
        </button>
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="px-6 py-16 text-center bg-white">
        <h3 className="text-base font-bold text-industrial-900">No samples found</h3>
        <p className="mt-1 text-xs text-industrial-500 mb-6">
          {searchQuery ? 'No samples match your search criteria.' : mode === 'recent' ? 'There are currently no samples configured in the system.' : 'Create your first sample to get started.'}
        </p>
        {onCreateSample && (
          <button
            onClick={onCreateSample}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-600 active:scale-[0.99] transition-all focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 outline-none"
          >
            <Plus size={16} />
            <span>Create Sample</span>
          </button>
        )}
      </div>
    );
  }

  const handleDownload = (sample: Sample) => {
    setSelectedSampleForDownload(sample);
  };

  return (
    <div className="w-full overflow-x-auto relative">
      <table className="w-full min-w-[600px] text-left">
        <thead className="bg-industrial-50 text-[10px] font-bold uppercase tracking-wider text-industrial-500 border-b border-industrial-100 sticky top-0 z-10">
          <tr>
            {mode === 'full' && <th className="px-5 py-4 w-12 hidden sm:table-cell text-center">No</th>}
            <th className="px-5 py-4">Sample ID</th>
            <th className="px-5 py-4">User ID</th>
            {mode === 'full' && <th className="px-5 py-4">Sample Type</th>}
            <th className="px-5 py-4 hidden sm:table-cell">District</th>
            <th className={`px-5 py-4 ${mode === 'full' ? 'text-right' : ''}`}>Created Date</th>
            {mode === 'full' && <th className="px-5 py-4 hidden sm:table-cell text-right">End Date</th>}
            <th className="px-5 py-4 text-center w-20">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-industrial-100 bg-white">
          {samples.map((sample, index) => (
            <tr key={sample.sampleId || index} className="text-sm text-industrial-700 hover:bg-brand-50/40 transition-colors focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-inset">
              {mode === 'full' && <td className="px-5 py-4 font-medium text-industrial-500 hidden sm:table-cell text-center">{startIndex + index + 1}</td>}
              <td className="px-5 py-4 font-black text-industrial-900">{sample.sampleId}</td>
              <td className="px-5 py-4 text-industrial-600">{sample.userId || sample.userName || '—'}</td>
              {mode === 'full' && <td className="px-5 py-4 text-industrial-600">{sample.sampleType || '—'}</td>}
              <td className="px-5 py-4 text-industrial-600 hidden sm:table-cell">{sample.testDistrict || sample.district || '—'}</td>
              <td className={`px-5 py-4 text-industrial-600 text-sm ${mode === 'full' ? 'text-right text-xs font-medium text-industrial-500' : ''}`}>
                {mode === 'recent' ? sample.createdDate : formatDate(sample.createdDate)}
              </td>
              {mode === 'full' && <td className="px-5 py-4 text-industrial-500 text-xs font-medium hidden sm:table-cell text-right">{formatDate(sample.endDate)}</td>}
              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                  {mode === 'full' && (
                    <button
                      onClick={() => navigate(`/samples/${encodeURIComponent(sample.sampleId)}`, { state: { sample } })}
                      title="View sample"
                      className="rounded-md border border-industrial-200 bg-white p-1.5 text-industrial-600 hover:text-brand-600 hover:bg-brand-50/50 transition-colors focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(sample)}
                    title="Download sample"
                    className="rounded-md border border-industrial-200 bg-white p-1.5 text-industrial-600 hover:text-brand-600 hover:bg-brand-50/50 transition-colors focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedSampleForDownload && (
        <DownloadModal
          isOpen={Boolean(selectedSampleForDownload)}
          onClose={() => setSelectedSampleForDownload(null)}
          filePath={`DCN_FOLDER/${selectedSampleForDownload.sampleId}.csv`}
          fileName={`${selectedSampleForDownload.sampleId}.csv`}
          fileDate={selectedSampleForDownload.createdDate ? formatDate(selectedSampleForDownload.createdDate) : new Date().toLocaleDateString()}
        />
      )}
    </div>
  );
};

export default SampleTable;
