import React from 'react';
import SettingsLayout from './SettingsLayout';
import SampleLogs from '../../components/Settings/SampleLogs';

const SampleLogsPage: React.FC = () => {
  return (
    <SettingsLayout>
      <div className="w-full h-full max-w-[1600px] mx-auto space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Settings / Test Parameter</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Test Parameter</h1>
          </div>
          <div className="relative z-10 hidden sm:block">
            <p className="text-xs font-semibold text-industrial-500">Manage water analysis parameters, reference methods and limits</p>
          </div>
        </header>

        <SampleLogs />
      </div>
    </SettingsLayout>
  );
};

export default SampleLogsPage;

