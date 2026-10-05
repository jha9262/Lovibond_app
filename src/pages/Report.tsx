import React, { useState, useEffect } from 'react';
import { Download, Search, FileText, Calendar, Loader2, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sampleService } from '../services/sampleService';
import { Sample } from '../types';
import { formatDate } from '../utils/dateTime';
import HomeSidebar from '../components/Home/HomeSidebar';

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setLoading(true);
        const result = await sampleService.getSamples({ limit: 100 });
        setSamples(result.data || []);
      } catch (err) {
        toast.error('Failed to load samples for report');
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
  }, []);

  const filteredSamples = samples.filter(s =>
    (s.sampleId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.sampleType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.district || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCSV = () => {
    if (filteredSamples.length === 0) {
      toast.error('No data to download');
      return;
    }

    const headers = ['Sample ID', 'User ID', 'Sample Type', 'District', 'Created Date', 'End Date'];
    const csvContent = [
      headers.join(','),
      ...filteredSamples.map(s => [
        s.sampleId, s.userId, s.sampleType, s.district,
        s.createdDate ? new Date(s.createdDate).toISOString() : '',
        s.endDate ? new Date(s.endDate).toISOString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `samples_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded');
  };

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
            REPORT
          </span>
        </div>

        <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Report</p>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Report</h1>
            </div>
            <div className="relative z-10">
              <button onClick={downloadCSV} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-brand-700 transition">
                <Download size={15} /> Export CSV
              </button>
            </div>
          </header>

          <section className="bg-white rounded-xl shadow-sm border border-industrial-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-industrial-100 flex flex-col sm:flex-row items-center gap-4 justify-between bg-industrial-50/50">
              <h2 className="text-sm font-bold text-industrial-900 uppercase tracking-wide flex items-center gap-2">
                <FileText size={16} className="text-industrial-500" /> All Samples
              </h2>
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-industrial-200 bg-white py-2 pl-9 pr-3 text-sm text-industrial-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center"><Loader2 size={32} className="animate-spin text-industrial-400" /></div>
            ) : filteredSamples.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-industrial-50 text-[10px] font-bold uppercase tracking-wider text-industrial-500 border-b border-industrial-100">
                    <tr>
                      <th className="px-6 py-3">Sample ID</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">District</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-industrial-100">
                    {filteredSamples.map(sample => (
                      <tr
                        key={sample.sampleId}
                        className="hover:bg-industrial-50 transition cursor-pointer"
                        onClick={() => navigate(`/ReportView?sampleId=${encodeURIComponent(sample.sampleId)}`)}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-industrial-900">{sample.sampleId}</td>
                        <td className="px-6 py-4 text-sm text-industrial-600">{sample.sampleType || '--'}</td>
                        <td className="px-6 py-4 text-sm text-industrial-600">{sample.district || '--'}</td>
                        <td className="px-6 py-4 text-sm text-industrial-600 flex items-center gap-2">
                          <Calendar size={14} className="text-industrial-400" /> {formatDate(sample.createdDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-industrial-500 text-sm font-medium">No reports found matching your criteria.</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ReportPage;