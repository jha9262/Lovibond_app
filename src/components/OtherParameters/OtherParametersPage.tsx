import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Save, Loader2, MapPin, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import SampleSelector from './components/SampleSelector';
import OtherParamCard from './components/OtherParamCard';
import { useOtherParamsWebSocket } from './hooks/useOtherParamsWebSocket';
import { deviceService } from './services/otherParamsDeviceService';
import { deviceWebSocket } from './services/deviceWebSocket';
import { Sample, LocationData } from '../../types';
import { getExactLocation } from '../../services/locationService';
import { getLoggerConfig } from '../../services/deviceService';

const getErrorMessage = (err: any, fallback: string) => {
  const data = err?.response?.data;
  let backendError = '';

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      backendError = parsed.MESSAGE || parsed.message;
    } catch {
      backendError = data;
    }
  } else if (data && typeof data === 'object') {
    backendError = data.MESSAGE || data.message;
  }

  return typeof backendError === 'string' && backendError.trim() ? backendError : fallback;
};

const getCleanParamKey = (item: any, index: number): string => {
  const rawKey = item.PARM_NAME || item.PARAM || item.key || `param_${index}`;
  return String(rawKey).trim().toUpperCase();
};

interface OtherParametersPageProps {
  samples: Sample[];
}

const OtherParametersPage: React.FC<OtherParametersPageProps> = ({ samples }) => {
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Local editable values mapped by parameter key / name
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [sampleLocation, setSampleLocation] = useState<LocationData | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const { connectionStatus, liveData, setInitialData } =
    useOtherParamsWebSocket(selectedSample?.sampleId);

  // Safely parse raw response if it's a string
  let rawData = liveData;
  if (typeof rawData === 'string') {
    try {
      rawData = JSON.parse(rawData);
    } catch { }
  }

  const dataToUse = rawData || deviceInfo;

  const procModule = (typeof dataToUse?.PROCESS_MODULE === 'object' && dataToUse?.PROCESS_MODULE !== null)
    ? dataToUse.PROCESS_MODULE
    : (dataToUse?.['3'] || dataToUse);

  const listsObj = procModule?.LISTS || dataToUse?.LISTS || {};

  // Extract all items from backend LISTS dynamically (100% data-driven, unique by param name)
  const listItems: any[] = [];
  const seenKeys = new Set<string>();
  if (Array.isArray(listsObj)) {
    listsObj.forEach((item: any, index: number) => {
      if (item && typeof item === 'object') {
        const cleanKey = getCleanParamKey(item, index);
        if (!seenKeys.has(cleanKey)) {
          seenKeys.add(cleanKey);
          listItems.push(item);
        }
      }
    });
  } else if (typeof listsObj === 'object' && listsObj !== null) {
    Object.entries(listsObj).forEach(([k, v]: [string, any], index) => {
      if (v && typeof v === 'object') {
        const itemObj = { key: k, ...v };
        const cleanKey = getCleanParamKey(itemObj, index);
        if (!seenKeys.has(cleanKey)) {
          seenKeys.add(cleanKey);
          listItems.push(itemObj);
        }
      }
    });
  }

  // Reset local edits whenever selected sample changes
  useEffect(() => {
    setLocalValues({});
  }, [selectedSample?.sampleId]);

  const handleValueChange = (paramKey: string, newValue: string) => {
    const cleanKey = String(paramKey).trim().toUpperCase();
    setLocalValues((prev) => ({
      ...prev,
      [cleanKey]: newValue,
    }));
  };

  const handleUpdateClick = async () => {
    if (isSaving) return;
    if (!selectedSample) {
      toast.error('No sample selected');
      return;
    }

    setIsSaving(true);
    try {
      // Build snapshot payload merging raw values with any local edits
      const valuesToSave: Record<string, any> = {};
      listItems.forEach((item, index) => {
        const key = getCleanParamKey(item, index);
        const rawVal = item.PARM_VALUE !== undefined && item.PARM_VALUE !== null ? item.PARM_VALUE : item.VALUE;
        valuesToSave[key] = localValues[key] !== undefined ? localValues[key] : (rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : '');
      });

      const res = await deviceService.saveSnapshot(selectedSample.sampleId, valuesToSave);
      if ((res?.STATUS_CODE && res.STATUS_CODE >= 400) || res?.success === false) {
        throw { response: { data: res } };
      }
      const successMsg = res?.MESSAGE || res?.message || 'Other Parameters saved successfully!';
      toast.success(successMsg);
      setShowConfirmModal(false);
      setLocalValues({});

      // Re-fetch live data to update displayed values and status directly from backend
      try {
        const updated = await deviceService.getLiveData(selectedSample.sampleId);
        setInitialData(updated);
        setDeviceInfo((prev: any) => ({ ...prev, ...updated }));
      } catch (refreshErr) {
        console.warn('Could not refresh live data after save:', refreshErr);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save snapshot'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSample = useCallback(async (sample: Sample | null) => {
    // 1. Immediately wipe previous sample data & set loading state
    await deviceWebSocket.disconnect();
    setSelectedSample(sample);
    setInitialData(null);
    setDeviceInfo(null);     // <-- Wipes Sample A device info instantly
    setLocalValues({});      // <-- Wipes Sample A edits
    setSampleLocation(null);

    if (sample) {
      const targetId = sample.sampleId || (sample as any).SAMPLE_ID;
      if (targetId) {
        setIsLoadingSample(true); // <-- Start loading spinner/skeleton
        try {
          // Geolocation in background
          getExactLocation().then(async (loc) => {
            if (loc && loc.latitude !== 0) {
              setSampleLocation(loc);
              await deviceService.sendSampleLocation(targetId, loc);
            }
          }).catch(() => { });

          // Sync Sample Selection FIRST, then fetch fresh Live Data
          const sampleName = (sample as any).SAMPLE_NAME || sample.userName || targetId;
          try {
            const selectRes = await deviceService.selectSample(targetId, sampleName);
            if (selectRes && typeof selectRes === 'object') {
              setDeviceInfo((prev: any) => ({ ...prev, ...selectRes }));
            }
          } catch (err) {
            console.warn('Sample manager selection warning:', err);
          }

          try {
            const initialData = await deviceService.getLiveData(targetId);
            if (initialData && typeof initialData === 'object') {
              setInitialData(initialData);
              setDeviceInfo((prev: any) => ({ ...prev, ...initialData }));
            }
          } catch (err) {
            console.error('Failed to fetch initial data from backend:', err);
            toast.error(getErrorMessage(err, 'Failed to load live data'));
          }

          try {
            await deviceWebSocket.connect(targetId);
          } catch (err) {
            console.warn('WebSocket connect notice:', err);
          }

          // Device logger information
          getLoggerConfig()
            .then((loggerRes) => {
              const info = loggerRes?.DEVICE_LOGGER_INFORMATION || loggerRes;
              if (info && typeof info === 'object') {
                setDeviceInfo((prev: any) => ({
                  ...prev,
                  ZONE_NAME: prev?.ZONE_NAME || info.ZONE_NAME || loggerRes?.ZONE_NAME || loggerRes?.ZONE,
                  WIFI_STRENGTH: prev?.WIFI_STRENGTH || info.WIFI_STRENGTH || loggerRes?.WIFI_STRENGTH || loggerRes?.WIFI,
                  DCN_TIME: prev?.DCN_TIME || info.DATE_TIME || info.DCN_TIME || loggerRes?.DCN_TIME || loggerRes?.DATE_TIME,
                  SYSTEM_STATUS: prev?.SYSTEM_STATUS || info.STATUS || loggerRes?.SYSTEM_STATUS || loggerRes?.STATUS,
                }));
              }
            })
            .catch(() => { });
        } catch (err) {
          console.error('Failed to load sample data:', err);
        } finally {
          setIsLoadingSample(false); // <-- Done loading Sample B
        }
      } else {
        setIsLoadingSample(false);
      }
    } else {
      setDeviceInfo(null);
      setIsLoadingSample(false);
    }
  }, [setInitialData]);

  const currentData = {
    ...(deviceInfo && typeof deviceInfo === 'object' ? deviceInfo : {}),
    ...(rawData && typeof rawData === 'object' ? rawData : {}),
  };

  const rawStatus =
    currentData?.SYSTEM_STATUS ||
    currentData?.STATUS ||
    deviceInfo?.SYSTEM_STATUS ||
    deviceInfo?.STATUS;

  const systemStatus = String(
    rawStatus || (connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'CONNECTING' ? 'CONNECTING' : 'OFFLINE')
  ).toUpperCase();

  const fullLocationStr =
    sampleLocation?.formattedAddress ||
    sampleLocation?.shortAddress ||
    selectedSample?.testAddress ||
    selectedSample?.district ||
    selectedSample?.testDistrict ||
    currentData?.LOCATION ||
    deviceInfo?.LOCATION ||
    '--';

  const displayLocationStr =
    sampleLocation?.formattedAddress ||
    sampleLocation?.shortAddress ||
    selectedSample?.testAddress ||
    selectedSample?.district ||
    selectedSample?.testDistrict ||
    currentData?.LOCATION ||
    deviceInfo?.LOCATION ||
    '--';

  const dcnTimeStr =
    currentData?.DCN_TIME ||
    currentData?.DCN__TIME ||
    currentData?.DCN_UPTIME ||
    currentData?.DATE_TIME ||
    deviceInfo?.DCN_TIME ||
    deviceInfo?.DATE_TIME ||
    deviceInfo?.SET_DATE_AND_TIME ||
    '--';

  const zoneNameStr =
    currentData?.ZONE_NAME ||
    currentData?.ZONE ||
    deviceInfo?.ZONE_NAME ||
    deviceInfo?.ZONE ||
    '--';

  const wifiStrengthStr =
    currentData?.WIFI_STRENGTH ||
    currentData?.WIFI ||
    deviceInfo?.WIFI_STRENGTH ||
    deviceInfo?.WIFI ||
    '--';

  return (
    <div className="w-full space-y-5">
      {/* Top Header Card */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Other Parameters</p>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Other Parameters</h1>
        </div>

        {/* Status Indicators: Loaded when a sample is selected */}
        {selectedSample && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 relative z-10 bg-industrial-50/80 px-4 py-2.5 rounded-xl border border-industrial-100">
            <div className="group relative flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 flex items-center gap-1 mb-0.5">
                <MapPin size={10} className="text-brand-500" />
                LOCATION
              </span>
              {isFetchingLocation ? (
                <span className="text-xs font-semibold text-industrial-400 animate-pulse">Detecting GPS...</span>
              ) : (
                <span
                  className="text-xs font-bold text-industrial-900 sm:text-right max-w-[180px] sm:max-w-[260px] md:max-w-[340px] lg:max-w-[420px] truncate cursor-help transition-colors hover:text-brand-600"
                  title={fullLocationStr}
                >
                  {displayLocationStr}
                </span>
              )}

              {/* Hover Tooltip for Complete Location */}
              {!isFetchingLocation && fullLocationStr !== '--' && (
                <div className="pointer-events-none absolute right-0 top-full z-50 mt-1.5 hidden w-72 rounded-xl border border-industrial-200 bg-white p-3 text-xs shadow-xl group-hover:block transition-all animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-brand-50 text-brand-600 shrink-0 mt-0.5 border border-brand-100">
                      <MapPin size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-industrial-400">Complete Location</p>
                      <p className="mt-0.5 text-xs font-semibold text-industrial-800 leading-snug break-words">
                        {fullLocationStr}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block h-7 w-px bg-industrial-200"></div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 mb-0.5">STATUS</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-md ${systemStatus === 'ONLINE' || systemStatus === 'CONNECTED'
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : systemStatus === 'CONNECTING'
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>
                {systemStatus}
              </span>
            </div>

            <div className="hidden sm:block h-7 w-px bg-industrial-200"></div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 mb-0.5">DCN TIME</span>
              <span className="text-xs font-bold text-industrial-900">{dcnTimeStr}</span>
            </div>

            <div className="hidden sm:block h-7 w-px bg-industrial-200"></div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 mb-0.5">ZONE</span>
              <span className="text-xs font-bold text-industrial-900">{zoneNameStr}</span>
            </div>

            <div className="hidden sm:block h-7 w-px bg-industrial-200"></div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 mb-0.5">WIFI</span>
              <span className="text-xs font-bold text-industrial-900">{wifiStrengthStr}</span>
            </div>
          </div>
        )}
      </header>

      {/* Sample Selector Bar */}
      <SampleSelector
        selectedSample={selectedSample}
        onSelectSample={handleSelectSample}
        loading={isLoadingSample}
        searchDisabled={isSaving}
        availableSamples={samples}
      />

      {/* Empty State when no sample is selected */}
      {!selectedSample && (
        <div className="rounded-2xl border border-industrial-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-3 border border-brand-100">
            <Sliders size={22} />
          </div>
          <h3 className="text-base font-bold text-industrial-900">Select a Sample</h3>
          <p className="mt-1 text-xs text-industrial-500 max-w-sm mx-auto">
            Choose a sample from the selector above to load, edit, and update the associated physical and sensory parameters.
          </p>
        </div>
      )}

      {/* Main Parameters Section + Connected Action Bar */}
      {selectedSample && (
        <section className="space-y-4">
          {isLoadingSample ? (
            <div className="rounded-2xl border border-industrial-200 bg-white p-12 text-center text-industrial-500 text-xs font-medium flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-brand-600" />
              <span>Loading parameters for {selectedSample.sampleId}...</span>
            </div>
          ) : (
            <>
              {/* Parameter Cards: Balanced 3-column grid taking full width */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {listItems.length === 0 ? (
                  <div className="col-span-3 rounded-2xl border border-industrial-200 bg-white p-12 text-center text-industrial-500 text-xs font-medium">
                    No parameter data received from device for this sample.
                  </div>
                ) : (
                  listItems.map((item, index) => {
                    const paramKey = getCleanParamKey(item, index);
                    const rawVal = item.PARM_VALUE !== undefined && item.PARM_VALUE !== null ? item.PARM_VALUE : item.VALUE;
                    const currentValue = localValues[paramKey] !== undefined ? localValues[paramKey] : (rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : '');
                    const paramName = (item.PARM_NAME || item.PARAM || item.key || '').trim();
                    const paramUnit = item.PARM_UNIT || item.UNIT;
                    const createDateTime = item.CREATE_DATE_TIME || item.DATE_TIME || item.SAMPLE_DATE_TIME;

                    return (
                      <OtherParamCard
                        key={`${selectedSample.sampleId}_${paramKey}`}
                        parmName={paramName}
                        parmValue={currentValue}
                        parmUnit={paramUnit}
                        createDateTime={createDateTime}
                        status={item.STATUS}
                        onValueChange={(val) => handleValueChange(paramKey, val)}
                      />
                    );
                  })
                )}
              </div>

              {/* Action Button: Clean right-aligned */}
              {listItems.length > 0 && (
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSaving}
                    style={{ backgroundColor: '#4a35e8' }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-brand-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Save & Update</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200 border border-industrial-200">
            <h3 className="text-base font-black tracking-tight text-industrial-900 uppercase mb-2">
              Confirm Save & Update
            </h3>
            <p className="text-xs font-medium text-industrial-600 leading-relaxed mb-6">
              Are you sure you want to save and update the parameter values for sample <span className="font-bold text-industrial-900 font-mono bg-industrial-100 px-1.5 py-0.5 rounded">{selectedSample?.sampleId}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-industrial-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2 rounded-xl border border-industrial-200 text-xs font-bold text-industrial-700 hover:bg-industrial-50 transition-colors uppercase tracking-wider"
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateClick}
                style={{ backgroundColor: '#4a35e8' }}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md shadow-brand-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] uppercase tracking-wider"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>{isSaving ? "Saving..." : "Yes, Save"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherParametersPage;
