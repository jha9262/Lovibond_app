import { useState, useEffect, useRef } from 'react';
import { deviceWebSocket } from '../services/deviceWebSocket';

export const useOtherParamsWebSocket = (sampleId?: string) => {
  const [connectionStatus, setConnectionStatus] = useState<string>('DISCONNECTED');
  const [liveData, setLiveData] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const unsubMessage = deviceWebSocket.onMessage((data: any) => {
      if (isMountedRef.current && data) {
        // Accept data for module 3 / OTHER_PARAM
        const isOtherParamData = Boolean(
          data['3'] ||
          String(data.PROCESS_MODULE) === '3' ||
          String(data.PROCESS_MODULE) === 'OTHER_PARAM' ||
          String(data.SELECTED_DEVICE) === 'OTHER_PARAM'
        );
        if (isOtherParamData || (!data['1'] && !data['2'] && String(data.PROCESS_MODE) !== '1' && String(data.PROCESS_MODE) !== '2')) {
          setLiveData(data);
        }
      }
    });

    const unsubStatus = deviceWebSocket.onStatusChange((status: string) => {
      if (isMountedRef.current) {
        setConnectionStatus(status);
        if (status === 'CONNECTED' || status === 'DISCONNECTED' || status === 'ERROR') {
          setIsConnecting(false);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      setLiveData(null);
      unsubMessage();
      unsubStatus();
      deviceWebSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!sampleId) {
      setLiveData(null);
    }
  }, [sampleId]);

  const setInitialData = (data: any) => {
    if (isMountedRef.current) setLiveData(data);
  };

  const connect = async () => {
    if (!sampleId) return;
    setIsConnecting(true);
    try {
      await deviceWebSocket.connect(sampleId);
    } catch (err) {
      console.error('WebSocket connect failed:', err);
      if (isMountedRef.current) setIsConnecting(false);
      throw err;
    }
  };

  const disconnect = async () => {
    await deviceWebSocket.disconnect();
  };

  return { connectionStatus, liveData, isConnecting, setInitialData, connect, disconnect };
};
