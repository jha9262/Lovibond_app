import React, { useState } from 'react';
import SettingsLayout from './SettingsLayout';
import DataCollectorConfiguration from './DataCollectorConfiguration';
import BluetoothConfiguration from './BluetoothConfiguration';
import ProtocolConfiguration from './ProtocolConfiguration';
import { Sliders, Bluetooth, ArrowLeftRight } from 'lucide-react';

type TabType = 'data-collector' | 'bluetooth' | 'protocol';

const DeviceCommunicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('data-collector');

  return (
    <SettingsLayout>
      <div className="w-full space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Settings / Device Communication</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Device Communication</h1>
          </div>
          <div className="relative z-10 hidden sm:block">
            <p className="text-xs font-semibold text-industrial-500">Configure collector, Bluetooth, and protocol settings</p>
          </div>
        </header>

        <div>
          <div className="flex border-b border-industrial-200">
            <button
              onClick={() => setActiveTab('data-collector')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'data-collector'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-industrial-500 hover:text-industrial-700 hover:border-industrial-300'
                }`}
            >
              <Sliders size={16} />
              Data Collector
            </button>
            <button
              onClick={() => setActiveTab('bluetooth')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bluetooth'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-industrial-500 hover:text-industrial-700 hover:border-industrial-300'
                }`}
            >
              <Bluetooth size={16} />
              Bluetooth
            </button>
            <button
              onClick={() => setActiveTab('protocol')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'protocol'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-industrial-500 hover:text-industrial-700 hover:border-industrial-300'
                }`}
            >
              <ArrowLeftRight size={16} />
              Protocol
            </button>
          </div>

          <div className="mt-3.5">
            {activeTab === 'data-collector' && <DataCollectorConfiguration isTab />}
            {activeTab === 'bluetooth' && <BluetoothConfiguration isTab />}
            {activeTab === 'protocol' && <ProtocolConfiguration isTab />}
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default DeviceCommunicationPage;
