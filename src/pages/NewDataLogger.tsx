import React, { useState, useEffect } from 'react';
import { RefreshCcw, Save, Wifi, Bluetooth, Network, Database, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLoggerConfig, updateLoggerConfig } from '../services/deviceService';

const Card = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="rounded-xl border border-industrial-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
    <div className="border-b border-industrial-100 bg-industrial-50/50 px-5 py-3.5 flex items-center gap-2">
      <div className="text-industrial-500">{icon}</div>
      <h3 className="text-sm font-bold text-industrial-900 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-5 flex-1 flex flex-col space-y-4">
      {children}
    </div>
  </div>
);

const Input = ({ label, type = 'text', ...props }: any) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-industrial-600 mb-1.5">{label}</label>
    <input type={type} className="w-full rounded-lg border border-industrial-200 bg-white px-3 py-2 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-industrial-50 disabled:text-industrial-500" {...props} />
  </div>
);

const Select = ({ label, children, ...props }: any) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-industrial-600 mb-1.5">{label}</label>
    <select className="w-full rounded-lg border border-industrial-200 bg-white px-3 py-2 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" {...props}>
      {children}
    </select>
  </div>
);

const NewDataLogger: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawConfig, setRawConfig] = useState<any>(null);

  // Data Collector
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  
  // Wi-Fi
  const [apSsid, setApSsid] = useState('');
  const [apPassword, setApPassword] = useState('');
  const [wifiMode, setWifiMode] = useState('ACCESS_POINT_MODE');
  
  // Bluetooth
  const [bleName, setBleName] = useState('');
  const [blePin, setBlePin] = useState('');
  
  // Protocol
  const [activeProtocol, setActiveProtocol] = useState('MQTT');
  const [mqttHost, setMqttHost] = useState('');
  const [mqttPort, setMqttPort] = useState('');
  const [ftpHost, setFtpHost] = useState('');
  const [ftpPort, setFtpPort] = useState('');

  const fetchConfig = async (isSync = false) => {
    try {
      if (isSync) setSyncing(true); else setLoading(true);
      const res = await getLoggerConfig();
      setRawConfig(res);

      const di = res?.DEVICE_LOGGER_INFORMATION || {};
      setSerialNumber(di.SERIAL_NUMBER || 'NA');
      setDeviceName(di.DEVICE_NAME || '');
      setZoneName(di.ZONE_NAME || '');
      setServerUrl(di.SERVER_URL || '');

      const wc = res?.WIFI_CONFIGURATION || {};
      setApSsid(wc.AP_SSID_STA_MODE || '');
      setApPassword(wc.AP_PASSWORD_STA_MODE || '');
      setWifiMode(wc.WIFI_MODE || 'ACCESS_POINT_MODE');

      const bc = res?.BLUETOOTH_CONFIGURATION || {};
      setBleName(bc.DEVICE_NAME || '');
      setBlePin(bc.PIN || '');

      const pc = res?.PROTOCOL_CONFIGURATION || {};
      setActiveProtocol(pc.PROTOCOL || 'MQTT');
      const mc = pc.MQTT_CONFIGURATION || {};
      setMqttHost(mc.BROKER || '');
      setMqttPort(mc.PORT ? String(mc.PORT) : '');
      const fc = pc.FTP_CONFIGURATION || {};
      setFtpHost(fc.HOST || '');
      setFtpPort(fc.PORT ? String(fc.PORT) : '');

      if (isSync) toast.success('Configuration synchronized from device.');
    } catch (err: any) {
      toast.error('Failed to load device configuration.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...(rawConfig || {}),
        DEVICE_LOGGER_INFORMATION: {
          ...(rawConfig?.DEVICE_LOGGER_INFORMATION || {}),
          DEVICE_NAME: deviceName,
          ZONE_NAME: zoneName,
          SERVER_URL: serverUrl,
        },
        WIFI_CONFIGURATION: {
          ...(rawConfig?.WIFI_CONFIGURATION || {}),
          AP_SSID_STA_MODE: apSsid,
          AP_PASSWORD_STA_MODE: apPassword,
          WIFI_MODE: wifiMode,
        },
        BLUETOOTH_CONFIGURATION: {
          ...(rawConfig?.BLUETOOTH_CONFIGURATION || {}),
          DEVICE_NAME: bleName,
          PIN: blePin,
        },
        PROTOCOL_CONFIGURATION: {
          ...(rawConfig?.PROTOCOL_CONFIGURATION || {}),
          PROTOCOL: activeProtocol,
          MQTT_CONFIGURATION: {
            ...(rawConfig?.PROTOCOL_CONFIGURATION?.MQTT_CONFIGURATION || {}),
            BROKER: mqttHost,
            PORT: mqttPort ? Number(mqttPort) : undefined,
          },
          FTP_CONFIGURATION: {
            ...(rawConfig?.PROTOCOL_CONFIGURATION?.FTP_CONFIGURATION || {}),
            HOST: ftpHost,
            PORT: ftpPort ? Number(ftpPort) : undefined,
          }
        }
      };

      await updateLoggerConfig(payload);
      toast.success('Configuration saved successfully.');
      fetchConfig();
    } catch (err) {
      toast.error('Failed to save configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><RefreshCcw className="animate-spin text-industrial-400" size={32} /></div>;
  }

  return (
    <div className={`space-y-6 ${!isEmbedded ? 'p-6 max-w-7xl mx-auto' : ''}`}>
      {!isEmbedded && (
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-industrial-900 uppercase">Data Logger Configuration</h1>
        </div>
      )}

      <div className="flex justify-end gap-3 mb-4">
        <button onClick={() => fetchConfig(true)} disabled={syncing} className="inline-flex items-center gap-2 rounded-lg border border-industrial-200 bg-white px-4 py-2 text-sm font-bold text-industrial-700 shadow-sm hover:bg-industrial-50 transition disabled:opacity-50">
          <RefreshCcw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Config'}
        </button>
        <button onClick={handleSave} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition disabled:opacity-50">
          <Save size={16} className={isSubmitting ? 'animate-pulse' : ''} /> {isSubmitting ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Device Information" icon={<SettingsIcon size={18} />}>
          <Input label="Serial Number" value={serialNumber} disabled />
          <Input label="Device Name" value={deviceName} onChange={(e: any) => setDeviceName(e.target.value)} />
          <Input label="Zone Name" value={zoneName} onChange={(e: any) => setZoneName(e.target.value)} />
          <Input label="Server URL" value={serverUrl} onChange={(e: any) => setServerUrl(e.target.value)} />
        </Card>

        <Card title="Wi-Fi Settings" icon={<Wifi size={18} />}>
          <Input label="SSID" value={apSsid} onChange={(e: any) => setApSsid(e.target.value)} />
          <Input label="Password" type="password" value={apPassword} onChange={(e: any) => setApPassword(e.target.value)} />
          <Select label="Wi-Fi Mode" value={wifiMode} onChange={(e: any) => setWifiMode(e.target.value)}>
            <option value="ACCESS_POINT_MODE">Access Point Mode</option>
            <option value="STATION_MODE">Station Mode</option>
          </Select>
        </Card>

        <Card title="Bluetooth Settings" icon={<Bluetooth size={18} />}>
          <Input label="BLE Device Name" value={bleName} onChange={(e: any) => setBleName(e.target.value)} />
          <Input label="Pairing PIN" value={blePin} onChange={(e: any) => setBlePin(e.target.value)} />
        </Card>

        <Card title="Protocol Settings" icon={<Network size={18} />}>
          <Select label="Active Protocol" value={activeProtocol} onChange={(e: any) => setActiveProtocol(e.target.value)}>
            <option value="MQTT">MQTT</option>
            <option value="FTP">FTP</option>
          </Select>
          
          {activeProtocol === 'MQTT' ? (
            <>
              <Input label="MQTT Broker" value={mqttHost} onChange={(e: any) => setMqttHost(e.target.value)} />
              <Input label="MQTT Port" type="number" value={mqttPort} onChange={(e: any) => setMqttPort(e.target.value)} />
            </>
          ) : (
            <>
              <Input label="FTP Host" value={ftpHost} onChange={(e: any) => setFtpHost(e.target.value)} />
              <Input label="FTP Port" type="number" value={ftpPort} onChange={(e: any) => setFtpPort(e.target.value)} />
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default NewDataLogger;