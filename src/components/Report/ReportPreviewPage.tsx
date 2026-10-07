import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileOutput, Loader2, AlertCircle, Download } from 'lucide-react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import HomeSidebar from '../Home/HomeSidebar';
import { ReportDocument } from '../../reports/PrintableReport';
import deviceService from '../../services/deviceService';
import toast from 'react-hot-toast';

const ReportPreviewPage: React.FC = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const reportInfo = location.state?.report || { name: '', createdDate: new Date().toLocaleDateString(), path: '', totalLogs: 0 };

  const [reportData,    setReportData]    = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  /* ── fetch ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      if (!reportInfo.path && !reportInfo.name && !reportInfo.sampleId) {
        setIsLoadingData(false);
        return;
      }
      try {
        setIsLoadingData(true);
        const id   = reportInfo.sampleId || (reportInfo.name ? reportInfo.name.replace(/\.[^/.]+$/, '') : '');
        const json: any = await deviceService.get('/REPORT_DOWNLOAD', { params: { ID: id } });
        const data = typeof json === 'string' ? JSON.parse(json) : json;

        if (data && (data.SD_DOWNLOAD_RECORD || data.SD_LOG_RECORD || data.META_DETAILS)) {
          setReportData(data);
        } else {
          setReportData(null);
          toast.error('Invalid or empty report data received');
        }
      } catch (err) {
        console.error('Failed to load report data:', err);
        setReportData(null);
        toast.error('Failed to download report data');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [reportInfo]);

  /* ── auto-download ──────────────────────────────────────────────── */
  useEffect(() => {
    if (location.state?.autoDownload && !isLoadingData && reportData && !isDownloading) {
      handleDownload();
    }
  }, [isLoadingData, reportData]);

  /* ── download ───────────────────────────────────────────────────────
     pdf() renders the exact same ReportDocument used in PDFViewer,
     so the downloaded file is byte-for-byte identical to the preview.  */
  const handleDownload = async () => {
    if (!reportData) return;
    setIsDownloading(true);
    try {
      const blob = await pdf(<ReportDocument data={reportData} />).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${reportInfo.sampleId || reportInfo.name?.replace(/\.[^/.]+$/, '') || 'report'}_report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
      if (location.state?.autoDownload) setTimeout(() => navigate(-1), 800);
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full bg-industrial-50 text-industrial-900">
      <div className="hidden shrink-0 md:block print:hidden">
        <HomeSidebar activeSection="report" />
      </div>

      <div className="min-w-0 flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* ── page header ─────────────────────────────────────────── */}
        <div className="bg-white border-b border-industrial-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-industrial-100 text-industrial-600 hover:bg-industrial-200 transition-colors"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-industrial-900 uppercase display-font">Report Preview</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] font-bold text-industrial-500 tracking-widest uppercase flex items-center gap-1">
                  <FileOutput size={12} /> {reportInfo.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {reportData && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isDownloading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Download size={16} />}
                <span>{isDownloading ? 'Preparing…' : 'Download PDF'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── preview area ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center h-full text-industrial-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold tracking-widest uppercase text-sm">Loading Report Data…</p>
            </div>
          ) : reportData ? (
            /* PDFViewer renders the exact same component as the download */
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <ReportDocument data={reportData} />
            </PDFViewer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-industrial-500">
              <AlertCircle className="w-10 h-10 mb-4 text-red-500" />
              <p className="font-bold tracking-widest uppercase text-sm">Report Data Not Found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ReportPreviewPage;
