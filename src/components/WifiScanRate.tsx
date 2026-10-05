import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast, { LoaderIcon } from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { validateStaticAndGatewayIP } from "../utils/utilityFunction";
import axios from "axios";
import { API_BASE_URL as BASE_URL } from "../config";
import { Button } from "./ui";

interface WifiScanProps {
  onClose: () => void;
  setWifiSSID: (ssid: string) => void;
  setWifiPassword: (pwd: string) => void;
  onSelectSSID?: (ssid: string) => void;
  wifiSSID?: string;
  wifiPassword?: string;
}

const WifiScan: React.FC<WifiScanProps> = ({
  onClose,
  setWifiSSID,
  setWifiPassword,
  onSelectSSID,
  wifiSSID = "",
  wifiPassword = "",
}) => {
  const [wifiNetworks, setWifiNetworks] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    ssid: "",
    password: "",
    ipType: "DYNAMIC",
    staticIp: "",
    gatewayIp: "",
    retryCount: 10,
    autoSwitching: false,
    networkScanRate: "",
    wifiMode: "",
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSSIDChange = (selectedOption: any) => {
    setFormState((prev) => ({
      ...prev,
      ssid: selectedOption ? selectedOption.value : "",
    }));
  };

  const fetchNetworkDetails = async () => {
    try {
      setLoadingConfig(true);
      const response = await axios.get(`${BASE_URL}/WIFI_CONFIGURATION`);
      const config = response?.data?.WIFI_CONFIGURATION;
      const setting = config?.WIFI_SETTING;

      setFormState({
        ssid: config?.AP_SSID_STA_MODE || wifiSSID,
        password: config?.AP_PASSWORD_STA_MODE || wifiPassword,
        ipType: setting?.STATIC_DYNAMIC_IP || "DYNAMIC",
        staticIp: setting?.STATIC_IP || "",
        gatewayIp: setting?.GATEWAY_IP || "",
        retryCount: setting?.MAX_CONN_RETRY ?? 10,
        autoSwitching: setting?.STA_AUTO_SWITCHING === "ENABLE",
        networkScanRate: setting?.STA_AUTO_SWITCHING_SCAN_RATE || "",
        wifiMode: setting?.WIFI_MODE || config?.WIFI_MODE || "STATION_MODE",
      });
    } catch (error) {
      console.error("Error fetching network config:", error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchWifiNetworks = async () => {
    setScanLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/GET_WIFI_AVAILABLE_NETWORK`);
      if (!response.ok) throw new Error("Network response not ok");

      const data = await response.json();
      const networks = (data.AVAILABLE_WIFI_NETWORKS || [])
        .filter((n: any) => n.SSID && n.SSID.trim() !== "")
        .map((n: any) => ({
          ssid: n.SSID,
          rssi: n.RSSI,
          channel: n.CHANNEL,
        }));

      setWifiNetworks(networks);
      toast.success("Scan complete");
    } catch (error) {
      console.error("Error fetching Wi-Fi networks:", error);
      toast.error("Failed to scan networks");
    } finally {
      setScanLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkDetails();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { ssid, password, ipType, staticIp, gatewayIp, retryCount, autoSwitching, networkScanRate, wifiMode } = formState;

    if (!ssid.trim()) {
      toast.error("Please select or enter an SSID");
      setIsSubmitting(false);
      return;
    }

    if (ipType === "STATIC" && (!staticIp.trim() || !gatewayIp.trim())) {
      toast.error("Please enter both Static IP and Gateway IP");
      setIsSubmitting(false);
      return;
    }

    if (staticIp && gatewayIp) {
      const isValid = validateStaticAndGatewayIP(staticIp, gatewayIp);
      if (!isValid.valid) {
        toast.error("Enter valid Static and Gateway IP");
        setIsSubmitting(false);
        return;
      }
    }

    setWifiSSID(ssid);
    setWifiPassword(password);
    if (onSelectSSID) onSelectSSID(ssid);

    const data = {
      WIFI_CONFIGURATION: {
        SSID: ssid,
        PASSWORD: password,
        WIFI_SETTING: {
          WIFI_MODE: wifiMode,
          STATIC_DYNAMIC_IP: ipType.toUpperCase(),
          GATEWAY_IP: gatewayIp,
          STATIC_IP: staticIp,
          MAX_CONN_RETRY: parseInt(String(retryCount)),
          STA_AUTO_SWITCHING: autoSwitching ? "ENABLE" : "DISABLE",
          STA_AUTO_SWITCHING_SCAN_RATE: networkScanRate || "",
        },
      },
    };

    try {
      const response = await axios.post(`${BASE_URL}/WIFI_CONFIGURATION`, data);
      const successMsg = typeof response.data === 'string'
        ? response.data
        : (response.data?.MESSAGE || response.data?.message || "Configured successfully");
      toast.success(successMsg);
      onClose();
    } catch (error: any) {
      const respData = error?.response?.data;
      const errorMsg = typeof respData === 'string'
        ? respData
        : (respData?.MESSAGE || respData?.message || error?.message || "Configuration failed");
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ssidOptions = wifiNetworks.map((network) => ({
    value: network.ssid,
    label: `${network.ssid} (${network.rssi} dBm)`,
    rssi: network.rssi,
    channel: network.channel,
  }));

  const selectedSSID = ssidOptions.find((option) => option.value === formState.ssid) ||
    (formState.ssid ? { value: formState.ssid, label: formState.ssid } : null);

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? "#fb923c" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(251, 146, 60, 0.4)" : "none",
      "&:hover": { borderColor: state.isFocused ? "#fb923c" : "#d1d5db" },
      borderRadius: "0.5rem",
      padding: "0.125rem",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "#fb923c" : state.isFocused ? "#fed7aa" : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:active": { backgroundColor: "#fb923c" },
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wifi-config-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="wifi-config-title" className="text-xl font-semibold text-gray-800">WIFI CONFIG</h2>
          <button type="button" className="rounded p-0.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800" onClick={onClose} aria-label="Close WiFi configuration"><X size={18} /></button>
        </div>

        {loadingConfig ? (
          <div className="flex justify-center items-center h-32">
            <LoaderIcon className="animate-spin" color="orange" />
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">SSID</label>
                <button type="button" onClick={fetchWifiNetworks} disabled={scanLoading} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {scanLoading ? "Scanning..." : "Scan"}
                </button>
              </div>
              <CreatableSelect
                value={selectedSSID}
                onChange={handleSSIDChange}
                options={ssidOptions}
                isClearable
                isSearchable
                placeholder="Select or enter SSID"
                styles={customSelectStyles}
                noOptionsMessage={() => "Click 'Scan' to find networks"}
                formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
                menuPlacement="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="text" name="password" required placeholder="Enter password" value={formState.password} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1"><input type="radio" name="ipType" required value="DYNAMIC" checked={formState.ipType === "DYNAMIC"} onChange={handleFormChange} className="accent-orange-500" />Dynamic</label>
                <label className="flex items-center gap-1"><input type="radio" name="ipType" required value="STATIC" checked={formState.ipType === "STATIC"} onChange={handleFormChange} className="accent-orange-500" />Static</label>
              </div>
            </div>

            {formState.ipType === "STATIC" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Static IP</label>
                  <input type="text" name="staticIp" required value={formState.staticIp} onChange={handleFormChange} placeholder="e.g. 192.168.1.50" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gateway IP</label>
                  <input type="text" name="gatewayIp" required value={formState.gatewayIp} onChange={handleFormChange} placeholder="e.g. 192.168.1.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection Retry Count</label>
              <select name="retryCount" value={formState.retryCount} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400 focus:outline-none">
                {[1, 3, 5, 10].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" name="autoSwitching" checked={formState.autoSwitching} onChange={handleFormChange} className="accent-orange-500" />
              <label className="text-sm text-gray-700">Enable Auto-Switching</label>
            </div>

            {formState.autoSwitching && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network Scan Rate (mSec)</label>
                <input type="number" name="networkScanRate" value={formState.networkScanRate} required onChange={handleFormChange} placeholder="Enter scan rate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WIFI MODE</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1"><input type="radio" name="wifiMode" value="ACCESS_POINT_MODE" required checked={formState.wifiMode === "ACCESS_POINT_MODE"} onChange={handleFormChange} className="accent-orange-500" />AP Mode</label>
                <label className="flex items-center gap-1"><input type="radio" name="wifiMode" value="STATION_MODE" required checked={formState.wifiMode === "STATION_MODE"} onChange={handleFormChange} className="accent-orange-500" />Station Mode</label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" disabled={isSubmitting} type="submit" label={isSubmitting ? <div className="flex justify-center items-center"><LoaderIcon className="animate-spin" color="white" /></div> : "SAVE"} />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WifiScan;
