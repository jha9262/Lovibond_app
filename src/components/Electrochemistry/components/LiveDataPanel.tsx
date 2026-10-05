import React from 'react';
import { Loader2, Power, Zap } from 'lucide-react';

const formatTime = (ts: any) => {
  if (!ts || ts === '00:00:00') return '--';
  if (typeof ts === 'string' && ts.includes('-')) return ts;
  if (!isNaN(Number(ts)) && String(ts).trim() !== '') {
    const n = Number(ts);
    const d = new Date(n < 100000000000 ? n * 1000 : n);
    return Number.isNaN(d.getTime()) ? ts : d.toLocaleTimeString();
  }
  return ts;
};

interface LiveDataPanelProps {
  activeTest?: string;
  upperDis?: string;
  lowerDis?: string;
  deviceStatus?: string;
  deviceLastSync?: string;
  deviceName?: string;
  onToggleDevice: (state: boolean) => void;
  isDeviceMeasuring: boolean;
  isTogglingDevice: boolean;
}

const LiveDataPanel: React.FC<LiveDataPanelProps> = ({ activeTest, upperDis, lowerDis, deviceStatus, deviceLastSync, deviceName, onToggleDevice, isDeviceMeasuring, isTogglingDevice }) => {
  const isConnected = deviceStatus === 'CONNECTED';
  const statusColor = isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : deviceStatus === 'ERROR' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';

  return (
    <div className="flex flex-col rounded-xl border border-brand-900 bg-[#0c0a20] text-white shadow-xl overflow-hidden relative min-h-[300px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-400/10 rounded-full blur-[60px] -z-10 pointer-events-none -translate-x-1/4 translate-y-1/4"></div>

      <div className="border-b border-white/5 px-5 py-4 flex justify-between items-center bg-white/5 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-brand-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-100">{deviceName || 'LIVE DATA'}</h2>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <span className={`h-2 w-2 rounded-full ${statusColor} ${isConnected ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{deviceStatus || 'UNKNOWN'}</span>
        </div>
      </div>

      <div className="flex flex-col p-5 z-10 flex-1 justify-between">
        <div className="space-y-4">
          {activeTest && (
            <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/5 shadow-inner">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-300 mb-1">ACTIVE TEST</p>
              <p className="text-base font-bold tracking-tight text-white leading-none">{activeTest}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/5 shadow-inner flex flex-col justify-center min-h-[64px]">
              <p className="text-2xl font-black tabular-nums tracking-tight text-white leading-none">{upperDis || '--'}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/5 shadow-inner flex flex-col justify-center min-h-[64px]">
              <p className="text-2xl font-black tabular-nums tracking-tight text-white leading-none">{lowerDis || '--'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex justify-between items-center text-[11px] text-white/50 px-1">
            <span className="font-semibold uppercase tracking-wider">Last Sync</span>
            <span className="font-bold text-white/80">{formatTime(deviceLastSync)}</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleDevice(!isDeviceMeasuring)}
            disabled={isTogglingDevice}
            className={`flex w-full items-center justify-center gap-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed ${isDeviceMeasuring
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.3)]'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_4px_12px_rgba(52,211,153,0.3)]'
              }`}
          >
            {isTogglingDevice ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
            {isTogglingDevice ? (isDeviceMeasuring ? 'Disconnecting...' : 'Connecting...') : (isDeviceMeasuring ? 'Disconnect Device' : 'Connect Device')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveDataPanel;