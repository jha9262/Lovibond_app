import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, Menu } from 'lucide-react';
import { sampleService } from '../services/sampleService';
import toast from 'react-hot-toast';
import { Sample } from '../types';
import HomeSidebar from '../components/Home/HomeSidebar';

const ReportViewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sampleId = new URLSearchParams(location.search).get('sampleId');

  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!sampleId) {
      toast.error('No sample ID provided');
      navigate('/report');
      return;
    }

    const fetchSample = async () => {
      try {
        setLoading(true);
        const data = await sampleService.getSampleById(sampleId);
        setSample(data);
      } catch (err: any) {
        toast.error('Failed to load sample details');
        navigate('/report');
      } finally {
        setLoading(false);
      }
    };
    fetchSample();
  }, [sampleId, navigate]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-industrial-50 text-industrial-900">
      <div className="hidden shrink-0 md:block">
        <HomeSidebar activeSection="report" />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-industrial-900/40 backdrop-blur-xs"
          />
          <div className="relative h-full w-72">
            <HomeSidebar
              mobile
              activeSection="report"
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-industrial-200 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg bg-industrial-100 p-2 text-industrial-700 hover:bg-industrial-200 transition-colors"
            aria-label="Open sidebar navigation"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-black text-industrial-900 uppercase tracking-wide">
            REPORT DETAILS
          </span>
        </div>

        <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Report / Details</p>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Report Details</h1>
            </div>
            <div className="relative z-10">
              <Link to="/report" className="inline-flex items-center gap-1.5 rounded-xl border border-industrial-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-industrial-700 shadow-xs hover:bg-industrial-50">
                <ArrowLeft size={14} /> Back to Reports
              </Link>
            </div>
          </header>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 size={32} className="animate-spin text-industrial-400" /></div>
          ) : sample ? (
            <div className="bg-white rounded-xl shadow-sm border border-industrial-200 overflow-hidden">
              <div className="p-4 border-b border-industrial-100 bg-industrial-50/50 flex items-center gap-2">
                <FileText size={16} className="text-industrial-500" />
                <h2 className="text-sm font-bold text-industrial-900 uppercase tracking-wide">Sample {sample.sampleId}</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-industrial-400">Sample ID</p>
                  <p className="text-sm font-bold text-industrial-900">{sample.sampleId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-industrial-400">User ID</p>
                  <p className="text-sm font-bold text-industrial-900">{sample.userId || '--'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-industrial-400">Sample Type</p>
                  <p className="text-sm font-bold text-industrial-900">{sample.sampleType || '--'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-industrial-400">District</p>
                  <p className="text-sm font-bold text-industrial-900">{sample.district || '--'}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default ReportViewPage;