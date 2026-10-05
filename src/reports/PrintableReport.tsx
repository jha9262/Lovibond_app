import React from 'react';
import { MOCK_REPORT_DATA } from './mockReportData';

const PrintableReport = ({ data = MOCK_REPORT_DATA }) => {
  const meta = data?.META_DETAILS || data?.SD_DOWNLOAD_RECORD?.META_DETAILS || {};
  const topHeader = data?.META_TOP_DETAILS || data?.SD_DOWNLOAD_RECORD?.META_TOP_DETAILS || {};
  const logsObj = data?.REPORT_LOGS || data?.SD_DOWNLOAD_RECORD?.REPORT_LOGS || {};

  const metaKeys = Object.keys(meta);
  const leftColKeys = metaKeys.slice(0, Math.ceil(metaKeys.length / 2));
  const rightColKeys = metaKeys.slice(Math.ceil(metaKeys.length / 2));

  const getSafeVal = (val: any) => val ?? '-';

  const logsArray = Object.keys(logsObj)
    .sort((a, b) => parseInt(a.replace('R_', '')) - parseInt(b.replace('R_', '')))
    .map((k, index) => {
      const rawRow = logsObj[k];
      if (!rawRow) return [(index + 1).toString(), '-', '-', '-', '-', '-', '-'];
      if (Array.isArray(rawRow) && rawRow.length >= 7 && !isNaN(parseInt(rawRow[0])) && rawRow[0].length <= 3) {
        return rawRow;
      }
      if (Array.isArray(rawRow)) {
        return [
          (index + 1).toString(),
          rawRow[3] || '-',
          '-',
          rawRow[5] || '-',
          rawRow[4] || '-',
          rawRow[6] || '-',
          '-'
        ];
      }
      return [
        (index + 1).toString(),
        rawRow.PARAM || rawRow.param || rawRow.name || '-',
        '-',
        rawRow.VALUE || rawRow.val || rawRow.value || '-',
        rawRow.UNIT || rawRow.unit || '-',
        rawRow.METHOD || rawRow.method || '-',
        '-'
      ];
    });

  const formatKey = (key: string) => {
    const map: Record<string, string> = {
      'DATE OF SAMPLE RECEIPT': 'SAMPLE RECEIPT DT.',
      'ANALYSIS STARTING DATE': 'ANALYSIS START',
      'ANALYSIS COMPLETION DATE': 'ANALYSIS END',
      'CUSTOMER REFERENCE NO': 'CUST. REF NO',
      'SAMPLE SUBMITTED BY': 'SUBMITTED BY',
      'MAIN SOURCE': 'SOURCE',
    };
    return map[key] || key;
  };

  return (
    <div id="printable-report" className="bg-[#ffffff] mx-auto text-[#000000] font-sans w-[210mm] min-h-[297mm] px-[15mm] py-[15mm] relative shadow-2xl print:shadow-none print:w-full print:h-full print:m-0 flex flex-col box-border">
      {/* Overall Frame Border */}
      <div className="absolute inset-0 m-[8mm] border-[1.5px] border-[#000000] pointer-events-none z-10"></div>

      {/* Header (Approx 20-25mm) */}
      <div className="flex justify-between items-center border-b-[1.5px] border-[#2B5BA4] pb-2 mb-3 shrink-0">
        <div className="w-10 h-10 bg-[#2B5BA4] rounded flex items-center justify-center text-[#ffffff] shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a2.218 2.218 0 0 0 1.934 3.45h10.692a2.218 2.218 0 0 0 1.934-3.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
            <path d="M8.5 2h7M14 9.5l-4 0" />
          </svg>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-[17px] font-bold text-[#111827] leading-tight">{topHeader.MIDDLE_HEADER || "DISTRICT LABORATORY"}</h1>
          <p className="text-[10px] text-[#4b5563] uppercase tracking-widest mt-1">Water Analysis Center</p>
          <p className="text-[10px] text-[#4b5563] uppercase tracking-widest mt-0.5">Main Civil Ring Road, Phase 4</p>
        </div>
        <div className="w-10 h-10 bg-[#2B5BA4] rounded flex items-center justify-center text-[#ffffff] shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a2.218 2.218 0 0 0 1.934 3.45h10.692a2.218 2.218 0 0 0 1.934-3.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
            <path d="M8.5 2h7M14 9.5l-4 0" />
          </svg>
        </div>
      </div>

      <h2 className="text-[14px] font-bold text-center underline tracking-wider mb-3 shrink-0">TEST REPORT</h2>

      {/* Metadata (Approx 45-55mm) */}
      <div className="w-full mb-3 border-t border-l border-[#000000] shrink-0">
        {Array.from({ length: Math.max(leftColKeys.length, rightColKeys.length) }).map((_, i) => {
          const leftKey = leftColKeys[i];
          const rightKey = rightColKeys[i];
          return (
            <div className="flex border-b border-[#000000] text-[9px]" key={i}>
              <div className="flex-1 flex border-r border-[#000000] min-h-[22px] items-stretch">
                {leftKey && (
                  <>
                    <div className="w-[45%] bg-[#f3f4f6] font-bold border-r border-[#000000] py-1.5 px-2.5 flex items-center leading-tight whitespace-pre-wrap" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{formatKey(leftKey)}</div>
                    <div className="w-[55%] text-[#374151] py-1.5 px-2.5 flex items-center leading-tight">{getSafeVal(meta[leftKey])}</div>
                  </>
                )}
              </div>
              <div className="flex-1 flex border-r border-[#000000] min-h-[22px] items-stretch">
                {rightKey && (
                  <>
                    <div className="w-[45%] bg-[#f3f4f6] font-bold border-r border-[#000000] py-1.5 px-2.5 flex items-center leading-tight whitespace-pre-wrap" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{formatKey(rightKey)}</div>
                    <div className="w-[55%] text-[#374151] py-1.5 px-2.5 flex items-center leading-tight">{getSafeVal(meta[rightKey])}</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Text before Table */}
      <p className="text-[9px] text-[#111827] mt-1 mb-1 font-medium text-left shrink-0">
        Kindly find herewith the analytical result:
      </p>

      {/* Results Table (Approx 65-75mm) */}
      <div className="w-full flex flex-col border-t border-l border-[#000000] shrink-0">
        <div className="flex bg-[#f3f4f6] border-b border-[#000000] min-h-[24px]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="w-[5%] shrink-0 font-bold text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-1">Sr. No.</div>
          <div className="w-[20%] shrink-0 font-bold text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-1">Parameter</div>
          <div className="w-[7%] shrink-0 font-bold text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-1">Unit</div>
          <div className="w-[30%] shrink-0 font-bold text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-1">Reference Method</div>
          <div className="w-[12%] shrink-0 font-bold text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-1">Result</div>
          <div className="w-[13%] shrink-0 font-bold text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-1 leading-tight">Acceptable Limit</div>
          <div className="w-[13%] shrink-0 font-bold text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-1 leading-tight">Permissible Limit</div>
        </div>
        {logsArray.map((row, index) => (
          <div className="flex border-b border-[#000000] min-h-[20px]" key={index}>
            <div className="w-[5%] shrink-0 text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-0.5">{getSafeVal(row[0])}</div>
            <div className="w-[20%] shrink-0 text-[8px] border-r border-[#000000] flex items-center px-2 py-0.5">{getSafeVal(row[1])}</div>
            <div className="w-[7%] shrink-0 text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-0.5">{getSafeVal(row[2])}</div>
            <div className="w-[30%] shrink-0 text-[7.5px] leading-[1.1] border-r border-[#000000] flex items-center px-1.5 py-0.5 break-words whitespace-pre-wrap">{getSafeVal(row[3])}</div>
            <div className="w-[12%] shrink-0 text-[8px] font-bold border-r border-[#000000] text-center flex items-center justify-center px-1 py-0.5">{getSafeVal(row[4])}</div>
            <div className="w-[13%] shrink-0 text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-0.5">{getSafeVal(row[5])}</div>
            <div className="w-[13%] shrink-0 text-[8px] border-r border-[#000000] text-center flex items-center justify-center px-1 py-0.5">{getSafeVal(row[6])}</div>
          </div>
        ))}
      </div>

      {/* Terms */}
      <div className="mb-1 shrink-0 mt-2">
        <h3 className="text-[10.5px] font-bold mb-0.5 leading-tight text-[#111827]">This Report is issued under the following terms & conditions:</h3>
        <p className="text-[9.5px] text-[#1f2937] leading-[1.4]">1. This report is referring only to the tested sample and for applicable parameters.</p>
        <p className="text-[9.5px] text-[#1f2937] leading-[1.4]">2. This sample will be destroyed after retention time unless otherwise specified specially.</p>
        <p className="text-[9.5px] text-[#1f2937] leading-[1.4]">3. This report is not to be reproduced wholly or in part, and can't be used as evidence in court of law.</p>
        <p className="text-[9.5px] text-[#1f2937] leading-[1.4]">4. Please refer back page for IS 10500:2012 (2nd Revision) limits.</p>
      </div>

      {/* Spacer removed for natural flow */}

      {/* Signatures */}
      <div className="flex justify-between items-end mt-2.5 mb-2 px-6 shrink-0">
        <div className="flex flex-col items-center w-[110px]">
          <span className="text-[9px] font-bold mb-1 text-[#111827]">Reviewed by:</span>
          <div className="w-full bg-[#e5e7eb] py-1 flex flex-col items-center justify-center print:bg-[#e5e7eb]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <span className="text-[8.5px] text-[#374151]">NAME</span>
            <span className="text-[8.5px] text-[#374151]">POST</span>
          </div>
        </div>

        <div className="w-[130px] h-[35px] bg-[#e5e7eb] flex items-center justify-center print:bg-[#e5e7eb]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <span className="text-[9px] text-[#374151]">STAMP</span>
        </div>

        <div className="flex flex-col items-center w-[110px]">
          <span className="text-[9px] font-bold mb-1 text-[#111827]">Issued by:</span>
          <div className="w-full bg-[#e5e7eb] py-1 flex flex-col items-center justify-center print:bg-[#e5e7eb]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <span className="text-[8.5px] text-[#374151]">NAME</span>
            <span className="text-[8.5px] text-[#374151]">POST</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col items-center shrink-0 pt-2 pb-1">
        <p className="text-[10px] font-bold text-[#374151] text-center mb-1">
          <span className="text-[#9ca3af] font-normal">------------------------- </span>
          End of the Test Report
          <span className="text-[#9ca3af] font-normal"> -------------------------</span>
        </p>

        <div className="w-full flex justify-between px-10 mb-0.5">
          <span className="text-[9.5px] text-[#374151]">O.W.No. DL/GNR/</span>
          <span className="text-[9.5px] text-[#374151]">/ of 2026, Dt.    /    /    / 2026</span>
        </div>

        <p className="text-[9.5px] text-[#374151] leading-tight mb-0.5">Ground Floor, GITI, G-Road, Sec-15, Gandhinagar</p>
        <p className="text-[9.5px] text-[#374151] leading-tight mb-1">E-mail: districtlabgandhinagar@gmail.com</p>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { 
            visibility: visible; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #printable-report { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            margin: 0 !important;
            padding: 15mm !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            box-shadow: none !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default PrintableReport;
