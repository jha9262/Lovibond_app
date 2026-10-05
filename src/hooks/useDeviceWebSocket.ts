import { useEffect, useState } from 'react';
import { connect, disconnect, subscribe, unsubscribe } from '../services/websocket/deviceWebSocket';
import { WebSocketPayload } from '../types';

export const useDeviceWebSocket = () => {
  const [data, setData] = useState<WebSocketPayload | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handler = (payload: WebSocketPayload) => {
      setData(payload);
      setConnected(true);
    };
    subscribe(handler);
    connect();
    return () => {
      unsubscribe(handler);
      disconnect();
    };
  }, []);

  return { data, connected };
};