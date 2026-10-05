import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SamplesLayout from '../../components/Samples/SamplesLayout';
import DeleteSampleModal from '../../components/Samples/DeleteSampleModal';
import { sampleService } from '../../services/sampleService';
import { formatDate } from '../../utils/dateTime';
import { Sample } from '../../types';

const DetailItem = ({ label, value }: { label: string, value: any }) => (
  <div className="space-y-1">
    <p className="text-xs font-bold uppercase tracking-wider text-industrial-400">{label}</p>
    <p className="text-sm font-semibold text-industrial-900 break-words">
      {value !== undefined && value !== null && String(value).trim() !== '' && value !== 0 ? String(value) : (value === 0 ? '0' : '—')}
    </p>
  </div>
);

const SampleDetails: React.FC = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [sample, setSample] = useState<Sample | null>(location.state?.sample || null);
  const [loading, setLoading] = useState(!location.state?.sample);
  const [error, setError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSample = async () => {
      try {
        if (!sample) setLoading(true);
        const data = await sampleService.getSampleById(sampleId!);
        if (isMounted) {
          setSample(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted && !sample) setError(err?.message || 'Sample not found');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (sampleId) fetchSample();
    return () => { isMounted = false; };
  }, [sampleId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await sampleService.deleteSample(sampleId!);
      toast.success('Sample deleted successfully.');
      navigate('/samples');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to delete sample.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SamplesLayout>
      <div className="w-full space-y-6">
        <div>
          <Link to="/samples" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-industrial-500 hover:text-brand-600 transition-colors">
            <ArrowLeft size={14} /> <span>Back to Samples</span>
          </Link>
        </div>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Samples / Details</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Sample Details</h1>
          </div>
          {sample && !loading && (
            <div className="relative z-10 flex items-center gap-2.5">
              <button onClick={() => navigate(`/samples/${encodeURIComponent(sampleId!)}/edit`, { state: { sample } })} className="inline-flex items-center gap-1.5 rounded-xl border border-industrial-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-industrial-700 shadow-xs hover:bg-industrial-50">
                <Edit2 size={14} /> <span>Edit</span>
              </button>
              <button onClick={() => setDeleteModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 shadow-xs hover:bg-red-50">
                <Trash2 size={14} /> <span>Delete</span>
              </button>
            </div>
          )}
        </header>

        {loading ? (
          <div className="animate-pulse h-64 bg-white rounded-xl border border-industrial-200"></div>
        ) : error || !sample ? (
          <div className="rounded-xl border border-industrial-200 bg-white p-12 text-center shadow-sm">
            <AlertCircle size={24} className="mx-auto text-industrial-500 mb-4" />
            <h3 className="text-lg font-bold text-industrial-900">Sample not found</h3>
          </div>
        ) : (
          <section className="overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
            <div className="border-b border-industrial-100 px-6 py-5">
              <h2 className="text-lg font-bold text-industrial-900">Sample Information</h2>
            </div>

            <div className="p-0">
              {/* CORE INFO */}
              <div className="px-6 py-6 border-b border-industrial-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-industrial-500 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Core Details
                </h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-12 md:grid-cols-3">
                  <DetailItem label="Sample ID" value={sample.sampleId} />
                  <DetailItem label="User ID" value={sample.userId} />
                  <DetailItem label="Customer" value={sample.customer} />

                  <DetailItem label="Sample Type" value={sample.sampleType} />
                  <DetailItem label="Mode of Sample" value={sample.modeOfSample} />
                  <DetailItem label="Habitation" value={sample.habitation} />

                  <DetailItem label="Sample Date of Issue" value={sample.sampleDateOfIssue} />
                  <DetailItem label="Sample Submitted Date" value={sample.sampleSubmittedDate} />
                  <DetailItem label="Created Date" value={formatDate(sample.createdDate)} />
                </div>
              </div>

              {/* SOURCE INFO */}
              <div className="px-6 py-6 border-b border-industrial-100 bg-industrial-50/50">
                <h3 className="text-sm font-bold uppercase tracking-wider text-industrial-500 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Source Information
                </h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-12 md:grid-cols-2">
                  <DetailItem label="Main Source" value={sample.mainSource} />
                  <DetailItem label="Sample Source" value={sample.source} />
                </div>
              </div>

              {/* LOCATION INFO */}
              <div className="px-6 py-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-industrial-500 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Test Location
                </h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-12 md:grid-cols-3">
                  <DetailItem label="Village" value={sample.testVillage} />
                  <DetailItem label="Taluka" value={sample.testTaluka} />
                  <DetailItem label="District" value={sample.testDistrict || sample.district} />

                  <div className="md:col-span-3">
                    <DetailItem label="Test Address" value={sample.testAddress} />
                  </div>

                  <DetailItem label="Latitude" value={sample.latitude} />
                  <DetailItem label="Longitude" value={sample.longitude} />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <DeleteSampleModal isOpen={deleteModalOpen} sampleId={sampleId} onConfirm={handleDelete} onCancel={() => setDeleteModalOpen(false)} loading={isDeleting} />
    </SamplesLayout>
  );
};

export default SampleDetails;