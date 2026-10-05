import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports, deleteReport } from "../../services/deviceService";
import Button from "../ui/Button";
import { Loader2, Folder, FileText, Trash2, Download, Menu, Eye } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationModal from "./components/ConfirmationModal";
import DownloadModal from "./components/DownloadModal";
import HomeSidebar from "../Home/HomeSidebar";

const ReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [path, setPath] = useState("");
  const navigate = useNavigate();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedFileInfo, setSelectedFileInfo] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState(() => {
    const savedFolder = sessionStorage.getItem("report_selected_folder");
    return savedFolder ? JSON.parse(savedFolder) : { path: "DCN_FOLDER", pathType: "DCN_FOLDER" };
  });

  const fetchReportData = async (folder = selectedFolder) => {
    try {
      setIsLoading(true);
      const data = await getReports(folder.path, folder.pathType);
      const folderData = [];
      const folderCount = data.SD_CARD_FOLDER_RECORD?.FOLDER_COUNT || 0;

      for (let i = 1; i <= folderCount; i++) {
        const folderItem = data.SD_CARD_FOLDER_RECORD[`FOLDER_DATA_${i}`];
        if (folderItem) {
          folderData.push({
            name: folderItem[0],
            path: folderItem[1],
            type: folderItem[2],
            createdDate: folderItem[3],
            modifiedDate: folderItem[4],
            content: folderItem[5],
            brand: folderItem[6] !== "N/A" ? folderItem[6] : null,
            model: folderItem[7] !== "N/A" ? folderItem[7] : null,
            totalLogs: folderItem[8] !== undefined ? folderItem[8] : null,
            size: folderItem[9] !== undefined ? folderItem[9] : null,
            fileType: folderItem[10],
          });
        }
      }
      setReportData(folderData);
    } catch (error) {
      setError(error?.message || (typeof error === 'string' ? error : "FAILED TO LOAD REPORT DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    sessionStorage.setItem("report_selected_folder", JSON.stringify(selectedFolder));
  }, [selectedFolder]);

  const showBrand = reportData.some((item) => item.brand && item.brand !== "N/A");
  const showModel = reportData.some((item) => item.model && item.model !== "N/A");
  const showTotalLogs = reportData.some((item) => item.totalLogs && item.totalLogs !== "N/A");
  const showSize = reportData.some((item) => item.size && item.size !== "N/A");
  const showContent = reportData.some((item) => item.content && item.content !== "N/A");

  const handleFolderClick = (folder, fileType) => {
    if (folder.fileType === "FOLDER") {
      setSelectedFolder({ path: folder.path, pathType: folder.type });
    }
    if (fileType === "FILE") {
      navigate("/ReportView", { state: { path: folder.path, total_Logs: folder.totalLogs ?? 0 } });
    }
  };

  const handleDelete = async (deletePath) => {
    try {
      const message = await deleteReport(deletePath);
      toast.success(message || "DELETED SUCCESSFULLY", { duration: 1500 });
      setReportData((prevData) => prevData.filter((item) => item.path !== deletePath));
    } catch (error) {
      toast.error(error?.message || (typeof error === 'string' ? error : "FAILED DELETING FOLDER"));
    } finally {
      setShowConfirmation(false);
    }
  };

  const handleBack = () => {
    if (selectedFolder.path === "DCN_FOLDER") return;
    const pathParts = selectedFolder.path.split("/");
    pathParts.pop();
    const parentPath = pathParts.join("/") || "DCN_FOLDER";
    const newPathType = selectedFolder.pathType === "SUB_FOLDER" ? "DCN_FOLDER" : "SUB_FOLDER";
    setSelectedFolder({ path: parentPath, pathType: newPathType });
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full bg-industrial-50 text-industrial-900">
      <div className="hidden shrink-0 md:block">
        <HomeSidebar activeSection="report" />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" End of the Test Report onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-industrial-900/40 backdrop-blur-xs" />
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
          <span className="text-sm font-black text-industrial-900 uppercase tracking-wide">REPORT</span>
        </div>

        {showConfirmation && (
          <ConfirmationModal message={"Are you sure you want to delete this item?"} onConfirm={() => handleDelete(path)} onCancel={() => setShowConfirmation(false)} />
        )}

        <div className="w-full space-y-5 p-6 sm:p-8 lg:p-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Report</p>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Report</h1>
            </div>
          </header>

          <div className="bg-white border border-industrial-200 p-4 rounded-xl shadow-sm flex justify-between items-center">
            <h2 className="text-[11px] font-bold text-industrial-500 tracking-widest uppercase flex items-center gap-2">
              <span className="text-brand-600">CURRENT DIRECTORY:</span> {selectedFolder.path}
            </h2>
            {selectedFolder.pathType !== "DCN_FOLDER" && (
              <Button label="BACK" variant="secondary" onClick={handleBack} disabled={isLoading} className="!px-6 uppercase tracking-widest text-[10px] shadow-sm" />
            )}
          </div>

          <div>
            {isLoading ? (
              <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-industrial-200 shadow-sm">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-xl border border-red-100 shadow-sm">
                <p className="text-red-500 font-black tracking-widest uppercase text-sm">Failed to retrieve data</p>
                <p className="mt-2 text-red-400 text-xs font-semibold">{typeof error === 'object' ? (error?.message || 'Failed to load report data') : String(error)}</p>
                <Button label="RETRY" variant="danger" className="mt-6" onClick={() => fetchReportData()} />
              </div>
            ) : (
              <div className="overflow-x-auto relative rounded-xl border border-industrial-200 bg-white shadow-sm">
                <table className="min-w-full">
                  <thead className="bg-industrial-50 border-b border-industrial-200">
                    <tr>
                      <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">SR No</th>
                      <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">NAME</th>
                      <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">DATE CREATED</th>
                      <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">DATE MODIFIED</th>
                      {showContent && <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">CONTENT</th>}
                      {showBrand && <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">MAKE</th>}
                      {showModel && <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">MODEL</th>}
                      {showTotalLogs && <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">LOGS</th>}
                      {showSize && <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">SIZE (KB)</th>}
                      <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-industrial-500 font-bold whitespace-nowrap">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-industrial-100">
                    {reportData.map((item, index) => (
                      <tr key={index} className="hover:bg-industrial-50/50 transition-colors group">
                        <td className="px-5 py-4 text-[11px] text-industrial-400 font-mono font-bold">{index + 1}</td>
                        <td onClick={() => handleFolderClick(item, item.fileType)} className={`px-5 py-4 ${item.fileType === "FOLDER" ? "cursor-pointer" : ""}`}>
                          <div className="flex items-center space-x-3">
                            {item.fileType === "FOLDER" ? (
                              <Folder className="w-5 h-5 text-brand-500" fill="currentColor" fillOpacity={0.2} />
                            ) : (
                              <FileText className="w-5 h-5 text-industrial-400" />
                            )}
                            <span className={`font-bold text-[12px] tracking-wide ${item.fileType === "FOLDER" ? "text-brand-700 hover:text-brand-600 transition" : "text-industrial-700"}`}>
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-industrial-500 text-[12px] font-medium">{item.createdDate}</td>
                        <td className="px-5 py-4 text-industrial-500 text-[12px] font-medium">{item.modifiedDate}</td>
                        {showContent && <td className="px-5 py-4 text-industrial-500 text-[12px] font-medium">{item.content}</td>}
                        {showBrand && <td className="px-5 py-4 text-industrial-500 text-[12px] font-medium">{item.brand || "-"}</td>}
                        {showModel && <td className="px-5 py-4 text-industrial-500 text-[12px] font-medium">{item.model || "-"}</td>}
                        {showTotalLogs && <td className="px-5 py-4 text-[12px] text-brand-600 font-mono font-bold">{item.totalLogs ?? "N/A"}</td>}
                        {showSize && <td className="px-5 py-4 text-industrial-500 text-[12px] font-medium">{item.size || "-"}</td>}
                        <td className="px-5 py-4 flex items-center gap-2">
                          <button
                            type="button"
                            title="Delete"
                            disabled={item.fileType === "FILE" && item.name === "DEVICE_RECORDS.csv"}
                            className="p-1.5 text-industrial-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={(e) => { e.stopPropagation(); setPath(item.path); setShowConfirmation(true); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {item.fileType === "FILE" && (
                            <>
                              <button
                                type="button"
                                title="Preview / Generate PDF"
                                className="p-1.5 text-industrial-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/reports/${encodeURIComponent(item.path)}/preview`, { state: { report: item } });
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Download Data"
                                className="p-1.5 text-industrial-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFileInfo({ filePath: item.path, fileName: item.name, fileDate: item.createdDate });
                                  setShowDownloadModal(true);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reportData.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-5 py-12 text-center text-industrial-400 font-medium text-sm">
                          No files or folders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDownloadModal && selectedFileInfo && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          filePath={selectedFileInfo.filePath}
          fileName={selectedFileInfo.fileName}
          fileDate={selectedFileInfo.fileDate}
        />
      )}
    </main>
  );
};

export default ReportPage;
