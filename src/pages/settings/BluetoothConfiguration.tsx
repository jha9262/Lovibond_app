import React, { useState } from 'react';
import { Bluetooth, Loader2 } from 'lucide-react';
import SettingsLayout from './SettingsLayout';

const BluetoothConfiguration: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate a scan process
    setTimeout(() => {
      setIsScanning(false);
      // We can leave it empty to match the empty state in the screenshot,
      // or optionally populate it if needed. For now, empty state.
      setDevices([]);
    }, 2000);
  };

  const Wrapper = isTab ? React.Fragment : SettingsLayout;

  return (
    <Wrapper>
      <div className="w-full space-y-3">
        {!isTab && (
          <div className="mb-1">
            <h2 className="text-2xl font-bold text-industrial-900">Bluetooth Configuration</h2>
            <p className="text-sm text-industrial-500 mt-1">Scan and manage connected Bluetooth devices.</p>
          </div>
        )}

        <section className="w-full overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-industrial-100 px-6 py-3.5 bg-industrial-50/50">
            <h3 className="text-xs font-bold text-industrial-900 uppercase tracking-wider">DISCOVERED DEVICES</h3>
            <button
              onClick={handleScan}
              disabled={isScanning}
              style={{ backgroundColor: '#4a35e8' }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-brand-700 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isScanning ? <Loader2 size={13} className="animate-spin" /> : <Bluetooth size={13} />}
              <span>{isScanning ? 'Scanning...' : 'Scan Devices'}</span>
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-industrial-50/50 text-[10px] font-bold uppercase tracking-wider text-industrial-500 border-b border-industrial-100">
                <tr>
                  <th className="px-6 py-4 w-1/4">DEVICE NAME</th>
                  <th className="px-6 py-4 w-1/4">MAC ADDRESS</th>
                  <th className="px-6 py-4 w-1/6">RSSI</th>
                  <th className="px-6 py-4 w-1/6">STATUS</th>
                  <th className="px-6 py-4 w-1/6 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100">
                {devices.length > 0 ? (
                  devices.map((device, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="px-6 py-4 font-semibold text-industrial-900">{device.name}</td>
                      <td className="px-6 py-4 font-mono text-industrial-500">{device.mac}</td>
                      <td className="px-6 py-4 text-industrial-600">{device.rssi} dBm</td>
                      <td className="px-6 py-4 text-industrial-600">{device.status}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-brand-600 font-semibold hover:text-brand-700">Connect</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Bluetooth size={32} className="text-industrial-300 mb-4" />
                        <h4 className="text-base font-bold text-industrial-900">No devices scanned yet</h4>
                        <p className="text-sm text-industrial-500 mt-1">Click "Scan Devices" to discover nearby Bluetooth devices.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Wrapper>
  );
};

export default BluetoothConfiguration;