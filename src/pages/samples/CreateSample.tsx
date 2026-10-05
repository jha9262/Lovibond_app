import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import SamplesLayout from '../../components/Samples/SamplesLayout';
import SampleForm from '../../components/Samples/SampleForm';
import { sampleService } from '../../services/sampleService';
import { Sample } from '../../types';

const CreateSample: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSample = async (formData: Partial<Sample>) => {
    setIsSubmitting(true);
    try {
      const response = await sampleService.createSample(formData);
      toast.success('Sample created successfully');

      const createdId = response?.sample?.sampleId || formData.sampleId;
      if (createdId) {
        navigate(`/samples/${encodeURIComponent(createdId)}`);
      } else {
        navigate('/samples');
      }
    } catch (err: any) {
      console.error('Failed to create sample:', err);
      toast.error(err?.message || 'Unable to create sample');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SamplesLayout>
      <div className="w-full space-y-6">
        <div>
          <Link to="/samples" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-industrial-500 hover:text-brand-600 transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Samples</span>
          </Link>
        </div>

        <header>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Create Sample</h1>
          <p className="mt-1 text-sm text-industrial-500">Add a new sample and enter its collection information.</p>
        </header>

        <section className="overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
          <div className="border-b border-industrial-100 px-6 py-5">
            <h2 className="text-lg font-bold text-industrial-900">Sample Information</h2>
          </div>
          <div className="p-6">
            <SampleForm onSubmit={handleCreateSample} onCancel={() => navigate('/samples')} submitLabel="Create Sample" isSubmitting={isSubmitting} />
          </div>
        </section>
      </div>
    </SamplesLayout>
  );
};

export default CreateSample;