import React, { useEffect, useState } from 'react';
import { Save, ArrowLeftRight, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SettingsLayout from './SettingsLayout';
import { getLoggerConfig, updateLoggerConfig } from '../../services/deviceService';

const SelectField = ({ label, value, onChange, options, disabled }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none rounded-lg border border-industrial-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-industrial-900 outline-none transition focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-industrial-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </div>
    </div>
  </div>
);

const ProtocolConfiguration: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawConfig, setRawConfig] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [protocol, setProtocol] = useState('MODBUS_RTU');
  const [baudRate, setBaudRate] = useState('9600');
  const [parity, setParity] = useState('NONE');
  const [stopBits, setStopBits] = useState('1');
  const [dataBits, setDataBits] = useState('8');

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await getLoggerConfig();
      const info = res?.DEVICE_LOGGER_INFORMATION || {};
      setRawConfig(info);

      setProtocol(info.DEVICE_PROTOCOL || 'MODBUS_RTU');
      setBaudRate(String(info.DEVICE_BAUD_RATE || '9600'));
      setParity(info.DEVICE_PARITY || 'NONE');
      setStopBits(String(info.DEVICE_STOP_BITS || '1'));
      setDataBits(String(info.DEVICE_DATA_BITS || '8'));
    } catch (err: any) {
      setFetchError('Unable to retrieve protocol configuration. Please check the connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        DEVICE_LOGGER_INFORMATION: {
          ...(rawConfig || {}), // Keep the rest of the configuration
          DEVICE_PROTOCOL: protocol,
          DEVICE_BAUD_RATE: baudRate, // the device returns it as string, I should just send the string or parse to number? wait, in the curl it was "9600", let's send string to be safe. Wait, the curl response had "DEVICE_BAUD_RATE":"9600".
          DEVICE_PARITY: parity,
          DEVICE_STOP_BITS: stopBits,
          DEVICE_DATA_BITS: dataBits,
        },
      };

      await updateLoggerConfig(payload);
      toast.success('Protocol configuration saved successfully.');
    } catch (err: any) {
      console.error(err);
      toast.error(typeof err === 'string' ? err : 'Failed to save protocol configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Wrapper = isTab ? React.Fragment : SettingsLayout;

  return (
    <Wrapper>
      <div className="w-full space-y-2.5">
        {!isTab && (
          <div>
            <h2 className="text-2xl font-bold text-industrial-900">Protocol Configuration</h2>
            <p className="text-sm text-industrial-500 mt-1">Configure communication protocol parameters for connected devices.</p>
          </div>
        )}

        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
            <div>
              <h4 className="text-sm font-bold text-red-900">Configuration Unreachable</h4>
              <p className="text-sm text-red-700 mt-0.5">{fetchError}</p>
            </div>
          </div>
        )}

        <section className="w-full overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
          <div className="border-b border-industrial-100 px-6 py-4 flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-industrial-500" />
            <h3 className="text-xs font-bold text-industrial-900 uppercase tracking-wider">Communication Settings</h3>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="PROTOCOL"
                value={protocol}
                onChange={(e: any) => setProtocol(e.target.value)}
                disabled={isSubmitting || loading}
                options={[
                  { label: 'MODBUS_RTU', value: 'MODBUS_RTU' },
                  { label: 'MODBUS_TCP', value: 'MODBUS_TCP' }
                ]}
              />
              <SelectField
                label="BAUD RATE"
                value={baudRate}
                onChange={(e: any) => setBaudRate(e.target.value)}
                disabled={isSubmitting || loading}
                options={[
                  { label: '9600', value: '9600' },
                  { label: '19200', value: '19200' },
                  { label: '38400', value: '38400' },
                  { label: '57600', value: '57600' },
                  { label: '115200', value: '115200' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                label="PARITY"
                value={parity}
                onChange={(e: any) => setParity(e.target.value)}
                disabled={isSubmitting || loading}
                options={[
                  { label: 'NONE', value: 'NONE' },
                  { label: 'EVEN', value: 'EVEN' },
                  { label: 'ODD', value: 'ODD' }
                ]}
              />
              <SelectField
                label="STOP BITS"
                value={stopBits}
                onChange={(e: any) => setStopBits(e.target.value)}
                disabled={isSubmitting || loading}
                options={[
                  { label: '1', value: '1' },
                  { label: '2', value: '2' }
                ]}
              />
              <SelectField
                label="DATA BITS"
                value={dataBits}
                onChange={(e: any) => setDataBits(e.target.value)}
                disabled={isSubmitting || loading}
                options={[
                  { label: '8', value: '8' },
                  { label: '7', value: '7' }
                ]}
              />
            </div>

            <div className="flex justify-end pt-6 border-t border-industrial-100">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                style={{ backgroundColor: '#4a35e8' }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /><span>Saving...</span></> : <><Save size={16} /><span>Save Changes</span></>}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Wrapper>
  );
};

export default ProtocolConfiguration;