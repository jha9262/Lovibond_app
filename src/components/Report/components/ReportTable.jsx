import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import { ChevronLeft, ChevronRight, FileText, Database, Loader2 } from "lucide-react";

const ReportTable = ({ data, page, rowsPerPage, setPage, setRowsPerPage, totalLogs, loading, error }) => {
  const navigate = useNavigate();
  const logs = data?.SD_LOG_RECORD?.REPORT_LOGS || [];
  const headers = data?.SD_LOG_RECORD?.LOGS_HEADER || [];

  const startLog = (page - 1) * rowsPerPage + 1;
  const endLog = Math.min(startLog + rowsPerPage - 1, totalLogs);
  const totalPages = Math.ceil(totalLogs / rowsPerPage) || 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-industrial-100 shadow-sm">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="mt-4 text-industrial-500 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
        <p className="text-red-500 font-black tracking-widest uppercase text-sm">Failed to retrieve report content</p>
        <p className="mt-2 text-red-400 text-xs font-semibold">{typeof error === 'object' ? (error?.message || 'Error loading reports') : String(error)}</p>
        <Button label="RETRY" variant="danger" className="mt-6" onClick={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-industrial-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button label="BACK" icon={ChevronLeft} variant="secondary" onClick={() => navigate(-1)} />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-industrial-900 tracking-tight">Report Contents</h2>
            <p className="text-xs font-bold text-industrial-400 tracking-widest uppercase mt-0.5">
              Showing logs {startLog} - {endLog} of {totalLogs}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-industrial-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-industrial-50 text-[10px] font-bold uppercase tracking-wider text-industrial-500 border-b border-industrial-200">
            <tr>
              <th className="px-5 py-4 whitespace-nowrap bg-industrial-100/50">#</th>
              {headers.map((header, index) => (
                <th key={index} className="px-5 py-4 whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-100">
            {logs.length > 0 ? (
              logs.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-industrial-50/50 transition-colors group">
                  <td className="px-5 py-4 text-[11px] font-mono font-bold text-industrial-400 bg-industrial-50/30">
                    {startLog + rowIndex}
                  </td>
                  {headers.map((_, colIndex) => {
                    let value = "-";
                    if (Array.isArray(row)) {
                      // Handle if row is just an array of values
                      value = row[colIndex] ?? "-";
                    } else if (typeof row === 'object' && row !== null) {
                      // Handle if row is an object
                      const headerName = headers[colIndex];
                      value = row[`LOG_${colIndex + 1}`] ?? row[headerName] ?? Object.values(row)[colIndex] ?? "-";
                    }
                    return (
                      <td key={colIndex} className="px-5 py-4 text-[12px] font-medium text-industrial-700 whitespace-nowrap">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <Database className="w-8 h-8 text-industrial-300 mb-3" />
                    <p className="text-industrial-500 font-bold text-sm tracking-wide">No logs found in this report</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalLogs > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-industrial-200 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-industrial-500 tracking-widest uppercase">Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border-none bg-industrial-50 text-industrial-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {[10, 20, 50, 100].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-industrial-200 text-industrial-600 hover:bg-industrial-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-industrial-700 mx-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-industrial-200 text-industrial-600 hover:bg-industrial-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
