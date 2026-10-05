import React, { useEffect, useState } from 'react';
import { RotateCcw, Link2, Clock3, CalendarDays, Loader2, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SettingsLayout from './SettingsLayout';
import { getLoggerConfig, updateLoggerConfig } from '../../services/deviceService';
import { getISTDateTime } from '../../utils/dateTime';

const ConfigSkeleton = () => (
  <div className="space-y-6 p-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-3 w-28 rounded bg-industrial-200" />
      <div className="h-10 w-full rounded-lg bg-industrial-100" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-10 rounded-lg bg-industrial-100" />
      <div className="h-10 rounded-lg bg-industrial-100" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-10 rounded-lg bg-industrial-100" />
      <div className="h-10 rounded-lg bg-industrial-100" />
    </div>
  </div>
);

const DataCollectorConfiguration: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawConfig, setRawConfig] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [serialNumber, setSerialNumber] = useState('');
  const [dataCollectorName, setDataCollectorName] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [syncTime, setSyncTime] = useState('');
  const [lastSync, setLastSync] = useState('');
  const [inventory, setInventory] = useState('');
  const [sampleDeleteTime, setSampleDeleteTime] = useState('');
  const [dateAndTime, setDateAndTime] = useState('');

  const [wifiStrength, setWifiStrength] = useState('');
  const [wifiMode, setWifiMode] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [deviceUptime, setDeviceUptime] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchConfig = async (isSyncAction = false) => {
    try {
      if (isSyncAction) setSyncing(true);
      else setLoading(true);
      setFetchError(null);

      const res = await getLoggerConfig();
      setRawConfig(res || {});

      const info = res?.DEVICE_LOGGER_INFORMATION || {};

      setSerialNumber(info.SERIAL_NUMBER || 'NA');
      setDataCollectorName(info.DEVICE_NAME || '');
      setZoneName(info.ZONE_NAME || '');
      setServerUrl(info.SERVER_URL || '');
      setSyncTime(info.SYNCHRONIZE_TIME !== undefined ? String(info.SYNCHRONIZE_TIME) : '');
      setLastSync(info.LAST_SYNC || 'Not synced yet');
      setInventory(info.INVENTORY !== undefined ? String(info.INVENTORY) : '');
      setSampleDeleteTime(info.SAMPLE_DELETE_TIME || '');
      setDateAndTime(info.SET_DATE_AND_TIME || '');

      setWifiStrength(info.WIFI_STRENGTH || '--');
      setWifiMode(info.WIFI_MODE || '--');
      setMacAddress(info.MAC_ADDRESS || '--');
      setDateTime(info.DATE_TIME || '--');
      setDeviceUptime(info.DEVICE_UPTIME || '--');

      if (isSyncAction) toast.success('Hardware synchronized successfully.');
    } catch (err: any) {
      console.error('Failed to load data collector configuration:', err);
      setFetchError(typeof err === 'string' ? err : 'Unable to retrieve data collector configuration. Please check the connection.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!dataCollectorName.trim()) nextErrors.dataCollectorName = 'Data Collector Name is required.';
    else if (dataCollectorName.length > 15) nextErrors.dataCollectorName = 'Maximum 15 characters allowed.';

    if (zoneName.length > 15) nextErrors.zoneName = 'Maximum 15 characters allowed.';
    if (serverUrl.length > 60) nextErrors.serverUrl = 'Maximum 60 characters allowed.';

    if (dateAndTime.trim()) {
      const datePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      if (!datePattern.test(dateAndTime)) {
        nextErrors.setDateAndTime = 'Format must be DD/MM/YYYY (e.g., 18/4/2026).';
      }
    }

    if (syncTime && Number(syncTime) < 1) nextErrors.syncTime = 'Synchronize time must be at least 1.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    const dt = getISTDateTime();

    try {
      const payload = {
        DEVICE_LOGGER_INFORMATION: {
          ...(rawConfig || {}), // Keep the rest of the configuration
          CREATE_TIME: dt.time,
          CREATE_DATE: dt.date,
          DATE_TIME: dt.iso,
          DEVICE_NAME: dataCollectorName.trim(),
          ZONE_NAME: zoneName.trim(),
          SERVER_URL: serverUrl.trim(),
          SYNCHRONIZE_TIME: syncTime !== '' ? Number(syncTime) : '',
          INVENTORY: inventory.trim(),
          SAMPLE_DELETE_TIME: sampleDeleteTime,
          SET_DATE_AND_TIME: dateAndTime.trim(),
        },
      };

      await updateLoggerConfig(payload);
      toast.success('Data Collector configuration saved successfully.');
      fetchConfig();
    } catch (err: any) {
      console.error('Failed to save data collector configuration:', err);
      toast.error(typeof err === 'string' ? err : 'Failed to save configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Wrapper = isTab ? React.Fragment : SettingsLayout;

  return (
    <Wrapper>
      <div className="w-full space-y-2">
        {!isTab && (
          <div className="mb-1">
            <h2 className="text-xl font-bold text-industrial-900">Data Collector Configuration</h2>
            <p className="text-xs text-industrial-500 mt-0.5">Configure your data collector settings.</p>
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
          <div className="flex items-center justify-between border-b border-industrial-100 px-6 py-3.5 bg-industrial-50/50">
            <h3 className="text-sm font-bold text-industrial-900 uppercase tracking-wide">Data Collector Information</h3>
            <button
              type="button"
              onClick={() => fetchConfig(true)}
              disabled={syncing || loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-industrial-200 bg-white px-3 py-1.5 text-xs font-bold text-industrial-700 shadow-2xs hover:bg-industrial-50 hover:border-industrial-300 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <RotateCcw size={13} className={syncing ? 'animate-spin text-brand-600' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Hardware'}</span>
            </button>
          </div>

          {loading ? <ConfigSkeleton /> : (
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 rounded-xl border border-brand-100 bg-brand-50 p-4 mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-industrial-500 mb-1">WIFI STRENGTH</span>
                  <span className="text-sm font-bold text-industrial-900 truncate" title={wifiStrength}>{wifiStrength}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-industrial-500 mb-1">WIFI MODE</span>
                  <span className="text-sm font-bold text-industrial-900 truncate" title={wifiMode}>{wifiMode}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-industrial-500 mb-1">MAC ADDRESS</span>
                  <span className="text-sm font-bold text-industrial-900 truncate" title={macAddress}>{macAddress}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-industrial-500 mb-1">DATE TIME</span>
                  <span className="text-sm font-bold text-industrial-900 truncate" title={dateTime}>{dateTime}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-industrial-500 mb-1">DEVICE UPTIME</span>
                  <span className="text-sm font-bold text-industrial-900 truncate" title={deviceUptime}>{deviceUptime}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-industrial-500 mb-1.5">Serial Number</label>
                  <input type="text" value={serialNumber} readOnly disabled className="w-full rounded-lg border border-industrial-200 bg-industrial-50 px-3.5 py-2.5 text-sm font-mono text-industrial-700 cursor-not-allowed" />
                </div>
                <div>
                  <label htmlFor="dataCollectorName" className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5">
                    Data Collector Name <span className="text-red-500">*</span>
                  </label>
                  <input id="dataCollectorName" type="text" value={dataCollectorName} onChange={(e) => { setDataCollectorName(e.target.value); if (errors.dataCollectorName) setErrors((prev) => ({ ...prev, dataCollectorName: '' })); }} placeholder="Enter data collector name" disabled={isSubmitting} className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${errors.dataCollectorName ? 'border-red-500' : 'border-industrial-200'}`} />
                  {errors.dataCollectorName && <p className="mt-1 text-xs font-medium text-red-500">{errors.dataCollectorName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="zoneName" className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5">Zone Name</label>
                  <input id="zoneName" type="text" value={zoneName} onChange={(e) => { setZoneName(e.target.value); if (errors.zoneName) setErrors((prev) => ({ ...prev, zoneName: '' })); }} placeholder="Enter zone name" disabled={isSubmitting} className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${errors.zoneName ? 'border-red-500' : 'border-industrial-200'}`} />
                  {errors.zoneName && <p className="mt-1 text-xs font-medium text-red-500">{errors.zoneName}</p>}
                </div>
                <div>
                  <label htmlFor="serverUrl" className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5">Server URL</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400"><Link2 size={15} /></div>
                    <input id="serverUrl" type="url" value={serverUrl} onChange={(e) => { setServerUrl(e.target.value); if (errors.serverUrl) setErrors((prev) => ({ ...prev, serverUrl: '' })); }} placeholder="https://example.com" disabled={isSubmitting} className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3.5 text-sm text-industrial-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${errors.serverUrl ? 'border-red-500' : 'border-industrial-200'}`} />
                  </div>
                  {errors.serverUrl && <p className="mt-1 text-xs font-medium text-red-500">{errors.serverUrl}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="syncTime" className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5">Synchronize Time (seconds)</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400"><Clock3 size={15} /></div>
                    <input id="syncTime" type="number" min="1" value={syncTime} onChange={(e) => { setSyncTime(e.target.value); if (errors.syncTime) setErrors((prev) => ({ ...prev, syncTime: '' })); }} placeholder="60" disabled={isSubmitting} className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3.5 text-sm text-industrial-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${errors.syncTime ? 'border-red-500' : 'border-industrial-200'}`} />
                  </div>
                  {errors.syncTime && <p className="mt-1 text-xs font-medium text-red-500">{errors.syncTime}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-industrial-500 mb-1.5">Last Sync</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400"><CalendarDays size={15} /></div>
                    <input type="text" value={lastSync} readOnly disabled className="w-full rounded-lg border border-industrial-200 bg-industrial-50 py-2.5 pl-9 pr-3.5 text-sm text-industrial-600 cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="inventory" className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5">Inventory</label>
                  <input id="inventory" type="text" value={inventory} onChange={(e) => setInventory(e.target.value)} placeholder="Enter inventory" disabled={isSubmitting} className="w-full rounded-lg border border-industrial-200 bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                </div>
                <div>
                  <label htmlFor="sampleDeleteTime" className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5">Sample Delete Time</label>
                  <div className="relative">
                    <input id="sampleDeleteTime" type="time" value={sampleDeleteTime} onChange={(e) => setSampleDeleteTime(e.target.value)} placeholder="Select time" disabled={isSubmitting} className="w-full rounded-lg border border-industrial-200 bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="setDateAndTime" className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5">Set Date and Time</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400"><CalendarDays size={15} /></div>
                    <input id="setDateAndTime" type="text" value={dateAndTime} onChange={(e) => { setDateAndTime(e.target.value); if (errors.setDateAndTime) setErrors((prev) => ({ ...prev, setDateAndTime: '' })); }} placeholder="18/4/2026" disabled={isSubmitting} className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3.5 text-sm text-industrial-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${errors.setDateAndTime ? 'border-red-500' : 'border-industrial-200'}`} />
                  </div>
                  {errors.setDateAndTime && <p className="mt-1 text-xs font-medium text-red-500">{errors.setDateAndTime}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-industrial-100">
                <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#4a35e8' }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /><span>Saving...</span></> : <><Save size={16} /><span>Save Changes</span></>}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </Wrapper>
  );
};

export default DataCollectorConfiguration;