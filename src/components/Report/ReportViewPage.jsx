import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getReportLogs } from "../../services/deviceService";
import ReportHeader from "./components/ReportHeader";
import ReportTable from "./components/ReportTable";
import { Loader2, Menu, ArrowLeft } from "lucide-react";
import HomeSidebar from "../Home/HomeSidebar";

const ReportViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { path, total_Logs } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (path) fetchReportData(path, page, rowsPerPage);
  }, [path, page, rowsPerPage]);

  const fetchReportData = async (path, page, rowsPerPage) => {
    setLoading(true);
    setError("");
    const LOG_START = (page - 1) * rowsPerPage + 1;
    const LOG_END = LOG_START + rowsPerPage - 1;
    try {
      const data = await getReportLogs({ FILE_PATH: path, LOG_START, LOG_END, PAGE_NO: page, MAX_LOG_COUNT: total_Logs });
      setReportData(data);
    } catch (error) {
      setError(error?.message || (typeof error === 'string' ? error : "FAILED TO LOAD REPORT. TRY AGAIN..."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full bg-industrial-50 text-industrial-900">
      <div className="hidden shrink-0 md:block">
        <HomeSidebar activeSection="report" />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-industrial-900/40 backdrop-blur-xs" />
          <div className="relative h-full w-72">
            <HomeSidebar mobile activeSection="report" onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1 w-full flex flex-col">
        <div className="flex items-center gap-3 border-b border-industrial-200 bg-white px-4 py-3 md:hidden">
          <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="rounded-lg bg-industrial-100 p-2 text-industrial-700 hover:bg-industrial-200 transition-colors" aria-label="Open sidebar navigation">
            <Menu size={20} />
          </button>
          <span className="text-sm font-black text-industrial-900 uppercase tracking-wide">REPORT VIEW</span>
        </div>

        <div className="w-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/report')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-industrial-200 bg-white text-xs font-bold text-industrial-700 hover:bg-industrial-50 shadow-xs transition-colors"
              >
                <ArrowLeft size={14} />
                BACK TO REPORTS
              </button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6 items-start">
              <div className="w-full sticky top-6">
                <ReportHeader reportMetaData={reportData?.SD_LOG_RECORD?.META_DETAILS} />
              </div>
              <div className="w-full overflow-hidden">
                <ReportTable
                  error={error}
                  loading={loading}
                  totalLogs={total_Logs}
                  data={reportData}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  setPage={setPage}
                  setRowsPerPage={setRowsPerPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReportViewPage;
