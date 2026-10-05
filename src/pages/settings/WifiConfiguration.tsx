import React, { useEffect, useState } from 'react';
import { Wifi, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SettingsLayout from './SettingsLayout';
import { getLoggerConfig, updateLoggerConfig } from '../../services/deviceService';
import WifiScan from '../../components/WifiScanRate';

const WifiConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWifiConfigOpen, setIsWifiConfigOpen] = useState(false);
  const [rawConfig, setRawConfig] = useState<any>(null);

  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enableWifi, setEnableWifi] = useState(true);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const res = await getLoggerConfig();
      const info = res?.DEVICE_LOGGER_INFORMATION || {};
      setRawConfig(info); // Store the flat config

      setSsid(info.WIFI_SSID || '');
      setPassword(info.WIFI_PASSWORD || '');
      setEnableWifi(info.WIFI_MODE !== 'ACCESS_POINT_MODE'); // Just as a guess, use WIFI_MODE to map to toggle

    } catch (err: any) {
      console.error('Failed to load WiFi config:', err);
      setFetchError('Unable to retrieve Wi-Fi configuration. Please check the connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleEnableWifi = async () => {
    if (isSubmitting || loading) return;

    const nextEnabled = !enableWifi;
    setEnableWifi(nextEnabled);
    setIsSubmitting(true);
    try {
      await updateLoggerConfig({
        DEVICE_LOGGER_INFORMATION: {
          ...(rawConfig || {}),
          WIFI_MODE: nextEnabled ? 'STATION_MODE' : 'ACCESS_POINT_MODE',
        },
      });
      toast.success(`Wi-Fi ${nextEnabled ? 'enabled' : 'disabled'}.`);
    } catch (err: any) {
      setEnableWifi(!nextEnabled);
      toast.error(typeof err === 'string' ? err : 'Failed to update Wi-Fi status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="w-full space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Settings / WiFi Configuration</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">WiFi Configuration</h1>
          </div>
          <div className="relative z-10 hidden sm:block">
            <p className="text-xs font-semibold text-industrial-500">Configure wireless interface and access credentials</p>
          </div>
        </header>

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
          <div className="border-b border-industrial-100 px-6 py-4">
            <h2 className="text-base font-bold text-industrial-900">Wireless Access Details</h2>
            <p className="mt-0.5 text-xs text-industrial-500">Configure wireless network credentials and access point</p>
          </div>

          <div className="space-y-3 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-industrial-600">SSID</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Wifi className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400" size={16} />
                  <input
                    type="text"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder="ENTER SSID"
                    disabled={isSubmitting || loading}
                    className="w-full h-[42px] rounded-lg border border-industrial-200 bg-white py-2 pl-10 pr-4 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 placeholder:text-industrial-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsWifiConfigOpen(true)}
                  disabled={isSubmitting || loading}
                  style={{ backgroundColor: '#4a35e8' }}
                  className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-50 shrink-0"
                >
                  <span>CONFIG</span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-industrial-600">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER PASSWORD"
                  disabled={isSubmitting || loading}
                  className="w-full h-[42px] rounded-lg border border-industrial-200 bg-white py-2 pl-4 pr-10 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 placeholder:text-industrial-400"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-industrial-400 hover:text-industrial-600">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-industrial-100 bg-industrial-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-3 gap-5 text-xs">
              <div><p className="text-[9px] font-bold uppercase text-industrial-400">Station IP</p><p className="font-bold text-industrial-800">{rawConfig?.STATION_IP || 'NA'}</p></div>
              <div><p className="text-[9px] font-bold uppercase text-industrial-400">Access Point IP</p><p className="font-bold text-industrial-800">{rawConfig?.ACCESS_POINT_IP || 'NA'}</p></div>
              <div><p className="text-[9px] font-bold uppercase text-industrial-400">WiFi Strength</p><p className="font-bold text-industrial-800">{rawConfig?.WIFI_STRENGTH || 'NA'}</p></div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase text-industrial-800">
              <input type="checkbox" checked={enableWifi} onChange={handleEnableWifi} disabled={isSubmitting || loading} className="h-4 w-4 rounded accent-brand-500" />
              Enable
            </label>
          </div>
        </section>

        {isWifiConfigOpen && (
          <WifiScan
            onClose={() => setIsWifiConfigOpen(false)}
            setWifiSSID={setSsid}
            setWifiPassword={setPassword}
            wifiSSID={ssid}
            wifiPassword={password}
          />
        )}
      </div>
    </SettingsLayout>
  );
};

export default WifiConfiguration;
