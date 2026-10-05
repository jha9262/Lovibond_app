import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Portal } from '../../components/ui';
import SamplesLayout from '../../components/Samples/SamplesLayout';
import DeleteSampleModal from '../../components/Samples/DeleteSampleModal';
import SampleForm from '../../components/Samples/SampleForm';
import { sampleService } from '../../services/sampleService';
import { Sample } from '../../types';
import SampleTable from '../../components/Samples/SampleTable';

const PAGE_SIZE = 5;

const SamplesDirectory: React.FC = () => {
  const navigate = useNavigate();

  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState<Sample | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const requestRef = useRef({ page: 1, limit: PAGE_SIZE, search: '' });

  const loadSamples = useCallback(async (params: { page?: number; search?: string } = {}) => {
    const request = {
      page: params.page ?? requestRef.current.page,
      limit: PAGE_SIZE,
      search: params.search ?? requestRef.current.search,
    };

    requestRef.current = request;

    try {
      setLoading(true);
      setError(false);

      const result = await sampleService.getSamples(request);

      setSamples(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      console.error('Failed to load samples:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSamples({ page: 1, search: '' });
  }, [loadSamples]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    loadSamples({ page: 1, search: val });
  };

  // ─── Delete ───────────────────────────────────────────
  const openDeleteModal = (sample: Sample) => {
    setSampleToDelete(sample);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setSampleToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!sampleToDelete) return;
    setIsDeleting(true);
    try {
      await sampleService.deleteSample(sampleToDelete.sampleId);
      toast.success('Sample deleted successfully.');
      closeDeleteModal();
      // Stay on current page (or go back if last item was deleted)
      loadSamples();
    } catch (err: any) {
      console.error('Error deleting sample:', err);
      toast.error(err?.message || 'Unable to delete sample.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Create ───────────────────────────────────────────
  const handleCreateSample = async (formData: Partial<Sample>) => {
    setIsCreating(true);
    try {
      await sampleService.createSample(formData);
      toast.success('Sample created successfully.');
      setCreateModalOpen(false);
      // Go to first page after creating
      loadSamples({ page: 1 });
    } catch (err: any) {
      console.error('Failed to create sample:', err);
      toast.error(err?.message || 'Unable to create sample.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SamplesLayout>
      <div className="w-full space-y-6 relative">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">
                Home / Samples
              </p>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">
              Samples
            </h1>
          </div>
          <div className="relative z-10">
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{ backgroundColor: '#4a35e8' }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 active:scale-[0.99] transition-all"
            >
              <Plus size={16} />
              <span>Create Sample</span>
            </button>
          </div>
        </header>

        {/* Table Section */}
        <section className="overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm flex flex-col">
          <div className="flex flex-col gap-3 border-b border-industrial-100 p-4 sm:flex-row sm:items-center sm:justify-between bg-industrial-50/50">
            <h2 className="text-base font-bold text-industrial-900">SAMPLE DIRECTORY</h2>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <label className="relative block sm:w-64">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400"
                  size={15}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search samples..."
                  className="w-full rounded-lg border border-industrial-200 py-2 pl-9 pr-3 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </label>
            </div>
          </div>

          <SampleTable
            samples={samples}
            loading={loading}
            error={error}
            mode="full"
            startIndex={(pagination.page - 1) * pagination.limit}
            onRetry={() => loadSamples()}
            onCreateSample={() => setCreateModalOpen(true)}
            searchQuery={searchQuery}
          // Pass delete handler if your SampleTable supports it
          // onDelete={openDeleteModal}
          />

          {/* Pagination */}
          {!loading && !error && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-industrial-100 px-5 py-4 bg-white">
              <p className="text-sm text-industrial-500">
                {pagination.total === 0 ? (
                  'No samples found'
                ) : (
                  <>
                    Showing{' '}
                    <span className="font-semibold text-brand-700">
                      {Math.min((pagination.page - 1) * PAGE_SIZE + 1, pagination.total)}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold text-brand-700">
                      {Math.min(pagination.page * PAGE_SIZE, pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-industrial-900">{pagination.total}</span>{' '}
                    samples
                  </>
                )}
              </p>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadSamples({ page: pagination.page - 1 })}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 text-xs font-bold text-industrial-700 bg-white border border-industrial-200 rounded-lg hover:bg-industrial-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 15) }, // max 15 page buttons
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => loadSamples({ page: pageNum })}
                        className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-colors ${pageNum === pagination.page
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-industrial-700 hover:bg-industrial-100 border border-transparent'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => loadSamples({ page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 text-xs font-bold text-industrial-700 bg-white border border-industrial-200 rounded-lg hover:bg-industrial-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Delete Modal */}
      <DeleteSampleModal
        isOpen={deleteModalOpen}
        sampleId={sampleToDelete?.sampleId}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
        loading={isDeleting}
      />

      {/* Create Modal */}
      <Portal>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <section className="overflow-hidden rounded-xl bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="border-b border-industrial-100 px-6 py-4 flex items-center justify-between bg-industrial-50/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Plus size={18} className="text-brand-500" />
                  <h2 className="text-base font-bold text-industrial-900">CREATE NEW SAMPLE</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={isCreating}
                  className="rounded-lg p-1.5 text-industrial-400 hover:bg-industrial-100 hover:text-industrial-700 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <SampleForm
                  onSubmit={handleCreateSample}
                  onCancel={() => setCreateModalOpen(false)}
                  submitLabel="Create Sample"
                  isSubmitting={isCreating}
                />
              </div>
            </section>
          </div>
        )}
      </Portal>
    </SamplesLayout>
  );
};

export default SamplesDirectory;