import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileOutput, Loader2, AlertCircle } from 'lucide-react';
import HomeSidebar from '../Home/HomeSidebar';
import PrintableReport from '../../reports/PrintableReport';
import { API_BASE_URL as BASE_URL } from '../../config/index';
import deviceService, { getReportLogs } from '../../services/deviceService';
import toast from 'react-hot-toast';
// import html2canvas
// import jsPDF

const ReportPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportInfo = location.state?.report || { name: 'SAM101.csv', createdDate: new Date().toLocaleDateString(), path: '', totalLogs: 0 };
  const [isDownloading, setIsDownloading] = useState(false);

  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      if (!reportInfo.path && !reportInfo.name && !reportInfo.sampleId) {
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        const id = reportInfo.sampleId || (reportInfo.name ? reportInfo.name.replace(/\.[^/.]+$/, "") : "");
        // The actual API endpoint is /REPORT_DOWNLOAD?ID=SAM201
        // Using deviceService automatically handles the base URL and Vite proxy for CORS
        const json: any = await deviceService.get(`/REPORT_DOWNLOAD`, { params: { ID: id } });

        let data = json;
        if (typeof json === 'string') {
          try {
            data = JSON.parse(json);
          } catch (e) {
            console.error("Failed to parse JSON string:", e);
          }
        }

        // The API returns the exact structure needed for PrintableReport!
        if (data && (data.SD_DOWNLOAD_RECORD || data.SD_LOG_RECORD || data.META_DETAILS)) {
          setReportData(data);
        } else {
          setReportData(null);
          toast.error("Invalid or empty report data received");
        }
      } catch (error) {
        console.error("Failed to load real report data:", error);
        setReportData(null);
        toast.error("Failed to download report data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchRealData();
  }, [reportInfo]);

  useEffect(() => {
    if (location.state?.autoDownload && !isLoadingData && reportData && !isDownloading) {
      handleAPIDownload();
    }
  }, [isLoadingData, reportData]);

  const handleAPIDownload = async () => {
    try {
      setIsDownloading(true);

      const element = document.getElementById('printable-report');
      if (!element) throw new Error("Report element not found");

      // Temporarily ensure the element is strictly A4 dimension for capture
      const originalTransform = element.style.transform;

      window.print();

      toast.success("PDF Downloaded successfully!");

      if (location.state?.autoDownload) {
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      }
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full bg-industrial-50 text-industrial-900">
      <div className="hidden shrink-0 md:block print:hidden">
        <HomeSidebar activeSection="report" />
      </div>

      <div className="min-w-0 flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden print:h-auto print:overflow-visible">
        {/* Header */}
        <div className="bg-white border-b border-industrial-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 print:hidden">
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
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="flex-1 bg-gray-200 p-8 flex justify-center overflow-auto print:p-0 print:bg-white print:overflow-visible">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center text-industrial-500 mt-20">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold tracking-widest uppercase text-sm">Loading Report Data...</p>
            </div>
          ) : reportData ? (
            <PrintableReport data={reportData} />
          ) : (
            <div className="flex flex-col items-center justify-center text-industrial-500 mt-20">
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
