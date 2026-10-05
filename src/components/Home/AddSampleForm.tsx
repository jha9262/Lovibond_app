import React, { useState, useEffect } from 'react';
import { Button } from '../ui';
import { Plus, X } from 'lucide-react';
import { Sample } from '../../types';
import { SAMPLE_LIMITS } from '../../constants/sampleLimits';

interface AddSampleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSample: (sample: Partial<Sample>) => Promise<boolean>;
}

const AddSampleForm: React.FC<AddSampleFormProps> = ({ isOpen, onClose, onSubmitSample }) => {
  const [values, setValues] = useState({ sampleId: '', userId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setValues({ sampleId: '', userId: '' });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateField = (field: string, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSampleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    updateField('sampleId', val);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    updateField('userId', val);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const sampleId = values.sampleId.trim();
    if (!sampleId) {
      nextErrors.sampleId = 'Required.';
    } else if (!/^[A-Z0-9]+$/.test(sampleId)) {
      nextErrors.sampleId = 'Uppercase letters and digits only.';
    } else if (sampleId.length > SAMPLE_LIMITS.SAMPLE_ID) {
      nextErrors.sampleId = `Max ${SAMPLE_LIMITS.SAMPLE_ID} characters.`;
    }

    const userId = values.userId.trim();
    if (!userId) {
      nextErrors.userId = 'Required.';
    } else if (!/^[A-Z0-9]+$/.test(userId)) {
      nextErrors.userId = 'Uppercase letters and digits only.';
    } else if (userId.length > SAMPLE_LIMITS.USER_ID) {
      nextErrors.userId = `Max ${SAMPLE_LIMITS.USER_ID} characters.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const success = await onSubmitSample({
      sampleId: values.sampleId.trim(),
      userId: values.userId.trim()
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <section className="overflow-hidden rounded-xl bg-white shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="border-b border-industrial-100 px-6 py-4 flex items-center justify-between bg-industrial-50/50">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-brand-500" />
            <h2 className="text-base font-bold text-industrial-900">CREATE NEW SAMPLE</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-industrial-400 hover:bg-industrial-100 hover:text-industrial-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6">
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-industrial-700">Sample ID</label>
              <input
                type="text"
                value={values.sampleId}
                onChange={handleSampleIdChange}
                placeholder="Enter sample ID"
                className={`w-full rounded-lg bg-[#f0f4f8] px-4 py-3 text-sm font-medium text-industrial-900 outline-none transition focus:ring-2 focus:ring-brand-500/20 ${errors.sampleId || values.sampleId.length > SAMPLE_LIMITS.SAMPLE_ID ? 'border border-red-500' : 'border border-transparent'}`}
              />
              {errors.sampleId && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.sampleId}</p>}
              {!errors.sampleId && values.sampleId.length > SAMPLE_LIMITS.SAMPLE_ID && <p className="mt-1.5 text-xs font-semibold text-red-500">Max {SAMPLE_LIMITS.SAMPLE_ID} characters.</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-industrial-700">User ID</label>
              <input
                type="text"
                value={values.userId}
                onChange={handleUserIdChange}
                placeholder="Enter user ID"
                className={`w-full rounded-lg bg-[#f0f4f8] px-4 py-3 text-sm font-medium text-industrial-900 outline-none transition focus:ring-2 focus:ring-brand-500/20 ${errors.userId || values.userId.length > SAMPLE_LIMITS.USER_ID ? 'border border-red-500' : 'border border-transparent'}`}
              />
              {errors.userId && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.userId}</p>}
              {!errors.userId && values.userId.length > SAMPLE_LIMITS.USER_ID && <p className="mt-1.5 text-xs font-semibold text-red-500">Max {SAMPLE_LIMITS.USER_ID} characters.</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-5 border-t border-industrial-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-industrial-700 hover:bg-industrial-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={values.sampleId.length > SAMPLE_LIMITS.SAMPLE_ID || values.userId.length > SAMPLE_LIMITS.USER_ID}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-600 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Sample
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddSampleForm;
