import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import SamplesLayout from '../../components/Samples/SamplesLayout';
import SampleForm from '../../components/Samples/SampleForm';
import { sampleService } from '../../services/sampleService';
import { formatDate } from '../../utils/dateTime';
import { Sample } from '../../types';

const editableFields: (keyof Sample)[] = [
  'sampleId', 'userId', 'createdDate', 'endDate', 'modeOfSample', 'sampleType',
  'source', 'mainSource', 'customer', 'customerAddress', 'sampleDateOfIssue',
  'habitation', 'testVillage', 'testTaluka', 'testDistrict', 'testAddress',
  'latitude', 'longitude', 'sampleSubmittedDate', 'customerReferenceNo',
  'sampleSubmittedBy', 'testReportNo',
];

const comparableValue = (field: keyof Sample, value: unknown) => {
  const text = String(value ?? '').trim();
  if (field === 'createdDate' || field === 'endDate') {
    const match = text.match(/^(\d{4})[/-](\d{2})[/-](\d{2})[-T ](\d{2}):(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
  }
  return text;
};

const EditSample: React.FC = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [initialData, setInitialData] = useState<Sample | null>(location.state?.sample || null);
  const [loading, setLoading] = useState(!location.state?.sample);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSample = async () => {
      try {
        if (!initialData) setLoading(true);
        const data = await sampleService.getSampleById(sampleId!);
        if (isMounted) {
          setInitialData(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted && !initialData) setError(err?.message || 'Sample not found');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (sampleId) fetchSample();
    return () => { isMounted = false; };
  }, [sampleId]);

  const handleUpdate = async (formData: Partial<Sample>) => {
    setIsSubmitting(true);
    try {
      const hasChanges = editableFields.some((field) =>
        comparableValue(field, initialData?.[field]) !== comparableValue(field, formData[field])
      );
      const listState = {
        returnPage: Number(location.state?.returnPage) || 1,
        returnSearch: typeof location.state?.returnSearch === 'string' ? location.state.returnSearch : '',
      };

      if (!hasChanges) {
        toast.success('No changes to save.');
        navigate('/samples', { state: listState });
        return;
      }

      await sampleService.updateSample(sampleId!, formData);
      toast.success('Sample updated successfully.');
      navigate('/samples', { state: listState });
    } catch (err: any) {
      toast.error(err?.message || 'Unable to update sample');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SamplesLayout>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Samples / Edit</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Edit Sample</h1>
          </div>
          <div className="relative z-10">
            <Link
              to={`/samples/${encodeURIComponent(sampleId!)}`}
              state={{
                sample: initialData,
                returnPage: location.state?.returnPage,
                returnSearch: location.state?.returnSearch,
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-industrial-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-industrial-700 shadow-xs hover:bg-industrial-50"
            >
              <ArrowLeft size={14} /> <span>Back to Details</span>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="animate-pulse h-64 bg-white rounded-xl border border-industrial-200"></div>
        ) : error || !initialData ? (
          <div className="rounded-xl border border-industrial-200 bg-white p-12 text-center shadow-sm">
            <AlertCircle size={24} className="mx-auto text-industrial-500 mb-4" />
            <h3 className="text-lg font-bold text-industrial-900">Sample not found</h3>
          </div>
        ) : (
          <section className="overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
            <div className="border-b border-industrial-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg font-bold text-industrial-900">Sample Information</h2>
              {initialData.createdDate && (
                <div className="flex items-center gap-1.5 text-xs text-industrial-500 font-medium">
                  <Calendar size={14} className="text-industrial-400" />
                  <span>Created: {formatDate(initialData.createdDate)}</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <SampleForm
                initialValues={initialData}
                onSubmit={handleUpdate}
                onCancel={() => navigate(`/samples/${encodeURIComponent(sampleId!)}`, {
                  state: {
                    sample: initialData,
                    returnPage: location.state?.returnPage,
                    returnSearch: location.state?.returnSearch,
                  },
                })}
                submitLabel="Save Changes"
                isSubmitting={isSubmitting}
                isEdit={true}
              />
            </div>
          </section>
        )}
      </div>
    </SamplesLayout>
  );
};

export default EditSample;
