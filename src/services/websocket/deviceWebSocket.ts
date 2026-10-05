import { WS_RECONNECT_INTERVAL, getDeviceWsUrl } from '../../config';
import USE_MOCK, { generateMockData } from './mocks';
import { WebSocketPayload } from '../../types';

let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
const listeners = new Set<(payload: WebSocketPayload) => void>();

export const subscribe = (fn: (payload: WebSocketPayload) => void) => listeners.add(fn);
export const unsubscribe = (fn: (payload: WebSocketPayload) => void) => listeners.delete(fn);

const emit = (data: WebSocketPayload) => listeners.forEach((fn) => fn(data));

export const connect = () => {
  if (USE_MOCK) {
    reconnectTimer = setInterval(() => emit(generateMockData()), 1000) as unknown as NodeJS.Timeout;
    return;
  }

  socket = new WebSocket(getDeviceWsUrl('ws'));


  socket.onmessage = (e) => emit(JSON.parse(e.data));
  socket.onclose = () => {
    reconnectTimer = setTimeout(connect, WS_RECONNECT_INTERVAL) as unknown as NodeJS.Timeout;
  };
};

export const disconnect = () => {
  if (reconnectTimer) {
    clearInterval(reconnectTimer);
    clearTimeout(reconnectTimer);
  }
  socket?.close();
  socket = null;
};