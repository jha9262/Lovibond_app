import React from 'react';
import { Clock, Activity } from 'lucide-react';

const formatTime = (ts: any) => {
  if (!ts || ts === '00:00:00') return null;
  if (typeof ts === 'string' && ts.includes('-')) return ts;
  if (!isNaN(Number(ts)) && String(ts).trim() !== '') {
    const n = Number(ts);
    const d = new Date(n < 100000000000 ? n * 1000 : n);
    return Number.isNaN(d.getTime()) ? ts : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return ts;
};

interface ParameterCardProps {
  parmName: string;
  parmValue?: string;
  parmUnit?: string;
  tempValue?: string;
  createDateTime?: string;
  status?: string;
  isActive?: boolean;
  parmDefault?: string;
  onClick?: () => void;
}

const ParameterCard: React.FC<ParameterCardProps> = ({ parmName, parmValue, parmUnit, tempValue, createDateTime, status, isActive, parmDefault, onClick }) => {
  const isExplicitlyEmpty = status === '';
  const displayStatus = isExplicitlyEmpty ? '' : (status || 'NOT_SAVED');
  const isSaved = displayStatus.toUpperCase() === 'SAVED';

  // Base card styles
  let cardStyles = 'bg-white border-industrial-100 shadow-sm';
  if (isActive) {
    cardStyles = 'bg-white border-brand-500 shadow-[0_0_15px_rgba(91,69,255,0.2)] ring-1 ring-brand-500 z-10';
  } else if (isSaved) {
    cardStyles = 'bg-emerald-50/30 border-emerald-200 shadow-sm';
  }

  // Hover styles (if clickable)
  const hoverStyles = onClick ? 'hover:-translate-y-1 hover:shadow-md cursor-pointer' : '';

  // Badge styles
  const badgeStyles = isSaved
    ? 'bg-emerald-100 text-emerald-600 border-emerald-100'
    : 'bg-industrial-50 text-industrial-400 border-industrial-100';

  // Value text styles
  const valueStyles = isSaved ? 'text-emerald-600' : 'text-industrial-900';

  const timeStr = formatTime(createDateTime);

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 h-full ${cardStyles} ${hoverStyles}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isActive ? 'bg-brand-500' : isSaved ? 'bg-emerald-400' : 'bg-industrial-200'}`} />

      <div className="px-4 py-3 flex items-center justify-between pl-5">
        <div className="flex items-center gap-2 min-w-0">
          <Activity size={14} className={isActive ? 'text-brand-500' : isSaved ? 'text-emerald-500' : 'text-industrial-400 shrink-0'} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-industrial-700 truncate">{parmName}</h3>
        </div>
        {parmDefault && parmDefault.trim() !== '' && (
          <span className="text-[10px] font-medium text-industrial-400 shrink-0 ml-2">
            {parmDefault}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pl-5 justify-between">
        <div>
          <div className="flex items-end gap-1.5 flex-wrap">
            <span className={`text-4xl font-black tabular-nums tracking-tight leading-none ${valueStyles}`}>
              {parmValue !== undefined && parmValue !== null && parmValue !== '' ? parmValue : '--'}
            </span>
            {parmUnit && parmUnit !== 'N/A' && (
              <span className="text-sm font-bold text-industrial-400 mb-1">{parmUnit}</span>
            )}
          </div>
          {tempValue !== undefined && tempValue !== null && tempValue !== '' && (
            <span className="text-[10px] font-medium text-industrial-400 mt-1 block">
              {typeof tempValue === 'string' ? tempValue.replace(' C', ' °C') : tempValue}
            </span>
          )}

          <div className="mt-2.5 flex items-center">
            {!isExplicitlyEmpty && displayStatus && (
              <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${badgeStyles}`}>
                {displayStatus.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>

        {timeStr && (
          <div className="mt-3 flex items-center gap-1 text-industrial-400/70">
            <Clock size={10} />
            <p className="text-[9px] font-medium tracking-wide">{timeStr}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterCard;