import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import deviceService from '../../../services/deviceService.ts';
import toast from 'react-hot-toast';
import { X, Loader2, Pencil } from 'lucide-react';
import Button from '../../ui/Button';
import PrintableReport from '../../../reports/PrintableReport';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const DownloadModal = ({ isOpen, onClose, filePath, fileName, fileDate }) => {
  const [editableFileName, setEditableFileName] = useState(
    fileName ? fileName.replace(/\.[^/.]+$/, "") : ""
  );
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  useEffect(() => {
    if (fileName) {
      setEditableFileName(fileName.replace(/\.[^/.]+$/, ""));
    }
  }, [fileName]);

  if (!isOpen) return null;

  const handleFileNameEdit = () => setIsEditingFileName(true);

  const handleFileNameSave = () => {
    if (editableFileName.trim()) setIsEditingFileName(false);
  };

  const handleFileNameCancel = () => {
    setEditableFileName(fileName.replace(/\.[^/.]+$/, ""));
    setIsEditingFileName(false);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress('Fetching report data...');

      const baseFileName = editableFileName.trim() || (fileName ? fileName.replace(/\.[^/.]+$/, "") : "") || `batch_${Date.now()}`;
      const originalSampleId = fileName ? fileName.replace(/\.[^/.]+$/, "") : baseFileName;

      // Step 1: Fetch report data from the API
      let json;
      try {
        json = await deviceService.get(`/REPORT_DOWNLOAD`, { params: { ID: originalSampleId } });
      } catch (apiErr) {
        console.error("API /REPORT_DOWNLOAD error:", apiErr);
        const errMsg = typeof apiErr === 'string' ? apiErr : (apiErr?.message || "Report data not found on device for this sample.");
        toast.error(errMsg);
        setIsDownloading(false);
        setDownloadProgress('');
        return;
      }

      let data = json;
      if (typeof json === 'string') {
        try {
          data = JSON.parse(json);
        } catch (e) {
          console.error("Failed to parse JSON string:", e);
        }
      }

      if (!data || !(data.SD_DOWNLOAD_RECORD || data.SD_LOG_RECORD || data.META_DETAILS)) {
        toast.error("Invalid or empty report data received from device");
        setIsDownloading(false);
        setDownloadProgress('');
        return;
      }

      setDownloadProgress('Rendering report...');

      // Step 2: Create a hidden off-screen container and render PrintableReport into it
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      container.style.zIndex = '-9999';
      container.style.pointerEvents = 'none';
      container.style.opacity = '0.01'; // Measurable by html2canvas without visual flash
      container.style.background = '#ffffff';
      document.body.appendChild(container);

      // Use createRoot to render the PrintableReport
      const root = createRoot(container);
      await new Promise((resolve) => {
        root.render(<PrintableReport data={data} />);
        // Give React time to render
        setTimeout(resolve, 600);
      });

      const reportElement = container.querySelector('#printable-report');
      if (!reportElement) {
        throw new Error("Report layout failed to render");
      }

      setDownloadProgress('Generating PDF...');

      // Step 3: Use html2canvas to capture the rendered report
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Step 4: Create PDF using jsPDF (resolving constructor safely)
      const PDFDoc = typeof jsPDF === 'function' ? jsPDF : (jsPDF?.jsPDF || jsPDF?.default);
      if (!PDFDoc) {
        throw new Error("PDF generator library could not be loaded");
      }

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      const pdf = new PDFDoc({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate the aspect ratio to fit the report on the page
      const canvasAspectRatio = canvas.width / canvas.height;
      const pageAspectRatio = pdfWidth / pdfHeight;

      let imgWidth, imgHeight;
      if (canvasAspectRatio > pageAspectRatio) {
        // Canvas is wider relative to page
        imgWidth = pdfWidth;
        imgHeight = pdfWidth / canvasAspectRatio;
      } else {
        // Canvas is taller relative to page
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * canvasAspectRatio;
      }

      // Center the image on the page
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = 0;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

      // Step 5: Save the PDF
      const pdfFileName = baseFileName.endsWith('.pdf') ? baseFileName : `${baseFileName}.pdf`;
      pdf.save(pdfFileName);

      setDownloadProgress('');
      toast.success("PDF Downloaded successfully!");

      // Cleanup
      try {
        root.unmount();
        document.body.removeChild(container);
      } catch (cleanupErr) {
        console.warn("Cleanup warning:", cleanupErr);
      }
      onClose();
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(error?.message || "Failed to generate PDF. Please try again.");
      setDownloadProgress('');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-industrial-900/40 backdrop-blur-sm p-4 z-50 w-full animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-industrial-200 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-industrial-100 bg-industrial-50/50">
          <h2 className="text-sm font-black text-industrial-900 tracking-wider uppercase">DOWNLOAD LOG</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-industrial-200 text-industrial-400 hover:text-industrial-900 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-industrial-400 mb-2">FILE NAME</h3>
            {isEditingFileName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editableFileName}
                  onChange={(e) => setEditableFileName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-industrial-50 border border-industrial-200 rounded-lg text-sm font-medium text-industrial-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  placeholder="Enter file name"
                  autoFocus
                />
                <Button label="SAVE" variant="primary" onClick={handleFileNameSave} className="!px-4 !py-2" />
                <Button label="CANCEL" variant="secondary" onClick={handleFileNameCancel} className="!px-4 !py-2" />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-industrial-50 rounded-lg border border-industrial-100">
                <span className="text-sm font-bold text-industrial-800">{editableFileName}</span>
                <button onClick={handleFileNameEdit} className="p-1.5 text-industrial-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors" title="Edit filename">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2 mt-3 text-[11px] text-industrial-500 font-medium">
              <span className="uppercase tracking-widest font-bold">Created:</span>
              <span>{fileDate}</span>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-industrial-400 mb-2">CHOOSE FORMAT</h3>
            <div className="w-full px-3 py-2.5 bg-industrial-50 border border-industrial-200 rounded-lg text-sm font-bold text-industrial-600 cursor-not-allowed">
              PDF Document (.pdf)
            </div>
          </div>

          {downloadProgress && (
            <div className="flex items-center gap-2 text-sm text-brand-600 font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{downloadProgress}</span>
            </div>
          )}
        </div>

        <div className="flex flex-row justify-end p-5 gap-3 border-t border-industrial-100 bg-industrial-50/50">
          <Button
            label={isDownloading ? "GENERATING..." : "DOWNLOAD"}
            variant="primary"
            onClick={handleDownload}
            disabled={isDownloading}
            icon={isDownloading ? Loader2 : null}
            className={isDownloading ? "animate-pulse" : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
