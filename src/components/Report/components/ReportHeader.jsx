import React from "react";

const ReportHeader = ({ reportMetaData }) => {
  const metadataItems = Object.entries(reportMetaData || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => [key.replace(/_/g, " "), value]);

  return (
    <div className="flex h-full flex-col rounded-lg border border-industrial-200 bg-industrial-900 text-white shadow-sm overflow-hidden">
      <div className="border-b border-industrial-800 px-5 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-industrial-400">
          SYSTEM METADATA
        </h2>
      </div>
      <div className="flex flex-1 flex-col p-5 gap-3">
        {metadataItems.map(([label, value]) => (
          <div key={label} className="border-b border-industrial-800 pb-2 last:border-0 last:pb-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-industrial-400 mb-0.5">{label}</p>
            <p className="text-sm font-bold tracking-tight text-white">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportHeader;
