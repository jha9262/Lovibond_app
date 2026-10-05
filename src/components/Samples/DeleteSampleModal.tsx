import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Portal } from '../ui';

interface DeleteSampleModalProps {
  isOpen: boolean;
  sampleId?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteSampleModal: React.FC<DeleteSampleModalProps> = ({ isOpen, sampleId, onConfirm, onCancel, loading = false }) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-900/50 backdrop-blur-xs">
        <div className="bg-white border border-industrial-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all animate-in fade-in zoom-in duration-150">
          <div className="bg-red-50/75 px-6 py-4 border-b border-red-100 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-industrial-900">
                Delete Sample?
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-industrial-400 hover:bg-industrial-100 hover:text-industrial-600 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-industrial-600 leading-relaxed">
              Are you sure you want to delete this sample{sampleId ? ` (${sampleId})` : ''}? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-lg border border-industrial-200 bg-white px-4 py-2 text-sm font-semibold text-industrial-700 shadow-xs hover:bg-industrial-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DeleteSampleModal;