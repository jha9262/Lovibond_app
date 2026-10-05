import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Save, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import SampleSelector from './components/SampleSelector';
import ParameterCard from './components/ParameterCard';
import LiveDataPanel from './components/LiveDataPanel';
import { usePhotometryWebSocket } from './hooks/usePhotometryWebSocket';
import { deviceService } from './services/deviceService';
import { deviceWebSocket } from './services/deviceWebSocket';
import { getExactLocation } from '../../services/locationService';
import { Sample, LocationData } from '../../types';

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

interface PhotometryPageProps {
  samples: Sample[];
}

const PhotometryPage: React.FC<PhotometryPageProps> = ({ samples }) => {
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [sampleLocation, setSampleLocation] = useState<LocationData | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeviceMeasuring, setIsDeviceMeasuring] = useState(false);
  const [isTogglingDevice, setIsTogglingDevice] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null);

  const { connectionStatus, liveData, isConnecting, setInitialData } =
    usePhotometryWebSocket(selectedSample?.sampleId || '');

  // Sync device measuring state from WebSocket connection status
  useEffect(() => {
    if (connectionStatus === 'CONNECTED') {
      setIsDeviceMeasuring(true);
    } else if (connectionStatus === 'DISCONNECTED' && !isTogglingDevice) {
      // Only reset if we're not in the middle of toggling
      // Don't reset here — let handleToggleDevice manage the state
    }
  }, [connectionStatus, isTogglingDevice]);

  // Track the latest measurement state for the cleanup function
  const isMeasuringRef = React.useRef(isDeviceMeasuring);
  useEffect(() => {
    isMeasuringRef.current = isDeviceMeasuring;
  }, [isDeviceMeasuring]);

  // Cleanup: Send HTTP DISCONNECT when the user navigates away from this page
  useEffect(() => {
    return () => {
      if (isMeasuringRef.current) {
        console.log('[Photometry] Unmounting while device is measuring. Sending DISCONNECT...');
        deviceService.setDeviceState(false).catch(err =>
          console.error('[Photometry] Failed to send DISCONNECT on unmount:', err)
        );
      }
    };
  }, []);

  const handleConfirmSave = async () => {
    if (isSaving) return;
    if (!selectedSample) {
      toast.error('No sample selected');
      return;
    }

    const moduleData = liveData?.['2'] || (liveData?.['1'] ? undefined : (liveData?.PROCESS_MODULE || liveData));
    const liveDataObj = moduleData?.LIVE_DATA || {};
    let activeTest = liveDataObj?.ACTIVE_TEST || '';
    if (activeTest.toUpperCase() === 'N/A') activeTest = '';

    let formattedTest = activeTest;

    const testToSave = formattedTest;

    setIsSaving(true);
    try {
      const res = await deviceService.saveSnapshot(selectedSample.sampleId, testToSave);
      if ((res?.STATUS_CODE && res.STATUS_CODE >= 400) || res?.success === false) {
        throw { response: { data: res } };
      }
      const successMsg = res?.MESSAGE || res?.message || 'Snapshot saved successfully!';
      toast.success(successMsg);
      setShowConfirmModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save snapshot'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSample = useCallback(async (sample: Sample | null) => {
    await deviceWebSocket.disconnect();
    setSelectedSample(sample);
    setIsDeviceMeasuring(false);
    setSampleLocation(null);
    setSelectedParameter(null);

    if (sample) {
      const targetId = sample.sampleId || (sample as any).SAMPLE_ID;
      if (targetId) {
        try {
          await deviceService.selectSample(targetId, (sample as any).SAMPLE_NAME || sample.userName || targetId);
        } catch (err) {
          console.error('Failed to sync selected sample with hardware:', err);
          toast.error(getErrorMessage(err, 'Failed to sync sample with device'));
        }

        try {
          const initialData = await deviceService.getLiveData(targetId);
          setInitialData(initialData);
        } catch (err) {
          console.error('Failed to fetch initial data from backend:', err);
        }

        try {
          setIsFetchingLocation(true);
          const location = await getExactLocation();
          setSampleLocation(location);
          await deviceService.sendSampleLocation(targetId, location);
        } catch (locErr: any) {
          console.warn('[Photometry] Geolocation notice:', locErr.message);
        } finally {
          setIsFetchingLocation(false);
        }
      }
    }
  }, [setInitialData]);

  const handleToggleDevice = async (newState: boolean) => {
    setIsTogglingDevice(true);
    try {
      const res = await deviceService.setDeviceState(newState);
      if ((res?.STATUS_CODE && res.STATUS_CODE >= 400) || res?.success === false) {
        throw { response: { data: res } };
      }
      if (newState) {
        await deviceWebSocket.connect(selectedSample?.sampleId || '');
      } else {
        await deviceWebSocket.disconnect();
      }
      setIsDeviceMeasuring(newState);
      const successMsg = res?.MESSAGE || res?.message || (newState ? 'Device connected and streaming' : 'Device disconnected');
      toast.success(successMsg);
    } catch (err) {
      console.error('Toggle device error:', err);
      toast.error(getErrorMessage(err, 'Failed to change device state'));
    } finally {
      setIsTogglingDevice(false);
    }
  };

  const moduleData = liveData?.['2'] || (liveData?.['1'] ? undefined : (liveData?.PROCESS_MODULE || liveData));
  const liveDataObj = moduleData?.LIVE_DATA || {};
  const listsObj = moduleData?.LISTS || {};
  const listArray: any[] = Object.values(listsObj);
  const systemStatus = String(liveData?.SYSTEM_STATUS || 'ONLINE').toUpperCase();

  let activeTest = liveDataObj?.ACTIVE_TEST || '';
  if (activeTest.toUpperCase() === 'N/A') activeTest = '';
  let formattedTest = activeTest;
  const activeTestStatus = String(
    listArray.find((item) => String(item?.PARM_NAME || '').toUpperCase() === formattedTest.toUpperCase())?.STATUS
    || liveDataObj?.TEST_STATUS
    || liveDataObj?.STATUS
    || ''
  ).trim().toUpperCase();
  const terminalTestStatuses = ['COMPLETED', 'CANCELLED', 'CANCELED', 'STOPPED', 'RESET', 'SAVED', 'NOT_SAVED', 'IDLE'];
  const isSampleSearchLocked = Boolean(
    selectedSample && (
      listArray.some((item) => String(item?.STATUS || '').trim().toUpperCase() === 'IN_PROGRESS')
      || (formattedTest && !terminalTestStatuses.includes(activeTestStatus))
    )
  );

  return (
    <div className="w-full space-y-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Home / Photometer</p>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">Photometer</h1>
        </div>
        {liveData && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 relative z-10 bg-industrial-50/80 px-4 py-2.5 rounded-xl border border-industrial-100">
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 flex items-center gap-1 mb-0.5">
                <MapPin size={10} className="text-brand-500" />
                LOCATION
              </span>
              {isFetchingLocation ? (
                <span className="text-xs font-semibold text-industrial-400 animate-pulse">Detecting GPS...</span>
              ) : sampleLocation && sampleLocation.source !== 'GPS_BLOCKED' ? (
                <span className="text-xs font-bold text-industrial-900 sm:text-right max-w-[150px] truncate" title={sampleLocation.formattedAddress}>
                  {sampleLocation.shortAddress || sampleLocation.formattedAddress}
                </span>
              ) : (
                <span className="text-xs font-bold text-industrial-400">--</span>
              )}
            </div>
            <div className="hidden sm:block h-7 w-px bg-industrial-200"></div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 mb-0.5">STATUS</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-md ${systemStatus === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                {systemStatus}
              </span>
            </div>
            <div className="hidden sm:block h-7 w-px bg-industrial-200"></div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 mb-0.5">DCN TIME</span>
              <span className="text-xs font-bold text-industrial-900">{liveData?.DCN_TIME || liveData?.DCN__TIME || liveData?.DCN_UPTIME || '--'}</span>
            </div>
            <div className="hidden sm:block h-7 w-px bg-industrial-200"></div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 mb-0.5">ZONE</span>
              <span className="text-xs font-bold text-industrial-900">{liveData?.ZONE_NAME || '--'}</span>
            </div>
            <div className="hidden sm:block h-7 w-px bg-industrial-200"></div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-industrial-400 mb-0.5">WIFI</span>
              <span className="text-xs font-bold text-industrial-900">{liveData?.WIFI_STRENGTH || '--'}</span>
            </div>
          </div>
        )}
      </header>

      <SampleSelector selectedSample={selectedSample} onSelectSample={handleSelectSample} loading={false} searchDisabled={isSampleSearchLocked} availableSamples={samples} />

      {!selectedSample && (
        <div className="rounded-lg border border-industrial-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-bold text-industrial-900">Select a sample to begin.</p>
        </div>
      )}

      {selectedSample && !liveData && (
        <div className="rounded-lg border border-industrial-200 bg-white p-8 text-center shadow-sm">
          <Loader2 size={26} className="animate-spin mx-auto text-industrial-400" />
          <p className="mt-3 text-xs font-bold text-industrial-500">
            {isConnecting ? 'Establishing connection...' : 'Fetching initial data...'}
          </p>
        </div>
      )}

      {selectedSample && liveData && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex-1">
            {listArray.length === 0 ? (
              <div className="rounded-lg border border-industrial-200 bg-white p-12 text-center shadow-sm h-full flex items-center justify-center">
                <p className="text-sm font-bold text-industrial-900">No live parameters available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {listArray.map((item, index) => {
                  const isActive = item.PARM_NAME?.toUpperCase() === formattedTest?.toUpperCase();

                  return (
                    <ParameterCard
                      key={index}
                      parmName={item.PARM_NAME}
                      parmValue={item.PARM_VALUE}
                      parmUnit={item.PARM_UNIT}
                      tempValue={item.TEMP_VALUE}
                      createDateTime={item.CREATE_DATE_TIME}
                      status={item.STATUS}
                      isActive={isActive}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-4">
            <div>
              <LiveDataPanel
                activeTest={liveDataObj?.ACTIVE_TEST}
                upperDis={liveDataObj?.UPPER_DIS}
                lowerDis={liveDataObj?.LOWER_DIS}
                deviceStatus={isDeviceMeasuring ? 'CONNECTED' : 'DISCONNECTED'}
                deviceLastSync={liveDataObj?.DEVICE_LAST_SYNC}
                deviceName={liveData?.SELECTED_DEVICE || liveData?.DEVICE}
                onToggleDevice={handleToggleDevice}
                isDeviceMeasuring={isDeviceMeasuring}
                isTogglingDevice={isTogglingDevice}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSaving || !isDeviceMeasuring}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-4 text-base font-bold text-white shadow-[0_4px_14px_rgba(91,69,255,0.3)] transition-all hover:bg-brand-600 hover:shadow-[0_6px_20px_rgba(91,69,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? 'SAVING...' : 'SAVE & UPDATE'}
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black tracking-tight text-industrial-900 uppercase mb-2">
              Confirm Save
            </h3>
            <p className="text-sm font-medium text-industrial-500 mb-6">
              Are you sure you want to save and update the current test values?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-lg border border-industrial-200 text-sm font-bold text-industrial-700 hover:bg-industrial-50 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSave}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-sm font-bold text-white shadow-md hover:bg-brand-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotometryPage;
