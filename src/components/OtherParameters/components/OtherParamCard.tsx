import React from 'react';
import { Clock, Activity } from 'lucide-react';

const formatTime = (ts: any) => {
  if (!ts || ts === '00:00:00' || String(ts).trim() === '') return null;
  if (typeof ts === 'string') {
    if (ts.includes('T')) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${y}/${m}/${day} ${hh}:${mm}:${ss}`;
      }
    }
    return ts.replace('T', ' ').replace('Z', '');
  }
  if (!isNaN(Number(ts)) && String(ts).trim() !== '') {
    const n = Number(ts);
    const d = new Date(n < 100000000000 ? n * 1000 : n);
    return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
  }
  return String(ts);
};

interface OtherParamCardProps {
  parmName: string;
  parmValue?: string | number;
  parmUnit?: string;
  createDateTime?: string;
  status?: string;
  onValueChange?: (newValue: string) => void;
}

const OtherParamCard: React.FC<OtherParamCardProps> = ({
  parmName,
  parmValue,
  parmUnit,
  createDateTime,
  status,
  onValueChange,
}) => {
  const isExplicitlyEmpty = status === '' || status === undefined || status === null;
  const isSaved = String(status || '').toUpperCase() === 'SAVED';
  const timeStr = formatTime(createDateTime);
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // remove all comas and speacil charater 
    value = value.replace(/[^a-zA-Z0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }
    // only 15 charaters are allowed
    if (value.length > 15) {
      value = value.slice(0, 15)
    }
    onValueChange?.(value)

  }


  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white p-4 shadow-xs transition-all duration-200 hover:border-brand-300 hover:shadow-md ${isSaved ? 'border-emerald-200/90' : 'border-industrial-200/90'
        }`}
    >
      {/* Decorative accent bar on left */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${isSaved ? 'bg-emerald-500' : 'bg-brand-500'
          }`}
      />

      <div className="pl-1.5">
        {/* Card Header: Title + Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Activity
              size={15}
              className={isSaved ? 'text-emerald-600 shrink-0' : 'text-brand-600 shrink-0'}
            />
            <h3 className="text-xs font-black uppercase tracking-wider text-industrial-800 truncate">
              {parmName || '--'}
            </h3>
          </div>

          {!isExplicitlyEmpty && (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border shrink-0 ${isSaved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-industrial-50 text-industrial-500 border-industrial-200/70 font-semibold'
                }`}
            >
              {status}
            </span>
          )}
        </div>

        {/* Editable Value Input Field */}
        <div className="relative">
          <input
            type="text"
            value={parmValue !== undefined && parmValue !== null ? String(parmValue) : ''}
            onChange={handleValueChange}
            maxLength={15}
            placeholder="0.00"
            className="w-full rounded-xl border border-industrial-200 bg-industrial-50/50 py-2 pl-3.5 pr-14 text-2xl font-black tabular-nums tracking-tight text-industrial-900 outline-none transition-all placeholder:text-industrial-300 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 hover:border-industrial-300"
          />
          {parmUnit && parmUnit !== 'N/A' && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-industrial-400">
              {parmUnit}
            </span>
          )}
        </div>
      </div>

      {/* Timestamp footer */}
      <div className="mt-3 flex items-center justify-between text-industrial-400 pl-1.5 pt-2 border-t border-industrial-100/70 text-[10px]">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-industrial-400" />
          <span className="font-medium tracking-wide">
            {timeStr || 'Last update: --'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OtherParamCard;
