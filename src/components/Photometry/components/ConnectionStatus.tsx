import React from 'react';
import { Wifi, WifiOff, Loader, AlertTriangle } from 'lucide-react';
import { ConnectionStatusType } from '../../../types';

const STATUS_CONFIG: Record<string, any> = {
  CONNECTED: { label: 'ONLINE', sublabel: 'Connected', dotClass: 'bg-emerald-500', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700', Icon: Wifi, pulse: true },
  CONNECTING: { label: 'CONNECTING', sublabel: 'Connecting...', dotClass: 'bg-amber-400', badgeClass: 'border-amber-200 bg-amber-50 text-amber-700', Icon: Loader, spin: true },
  DISCONNECTED: { label: 'OFFLINE', sublabel: 'Disconnected', dotClass: 'bg-industrial-400', badgeClass: 'border-industrial-200 bg-industrial-100 text-industrial-600', Icon: WifiOff },
  ERROR: { label: 'ERROR', sublabel: 'Connection failed', dotClass: 'bg-red-500', badgeClass: 'border-red-200 bg-red-50 text-red-700', Icon: AlertTriangle },
};

const ConnectionStatus: React.FC<{ status: ConnectionStatusType | string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DISCONNECTED;
  const IconComponent = cfg.Icon;
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 ${cfg.badgeClass}`}>
      <span className="relative flex items-center">
        <span className={`h-2.5 w-2.5 rounded-full ${cfg.dotClass}`} />
        {cfg.pulse && <span className={`absolute h-2.5 w-2.5 animate-ping rounded-full ${cfg.dotClass} opacity-60`} />}
      </span>
      <div>
        <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em]">
          <IconComponent size={12} className={cfg.spin ? 'animate-spin' : ''} />
          {cfg.label}
        </p>
        <p className="mt-0.5 text-[10px] font-medium opacity-80">{cfg.sublabel}</p>
      </div>
    </div>
  );
};

export default ConnectionStatus;