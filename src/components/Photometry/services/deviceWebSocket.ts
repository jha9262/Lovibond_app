import { getDeviceWsUrl } from '../../../config';

const getWsUrl = () => getDeviceWsUrl('LIVE_DATA');


let _ws: WebSocket | null = null;
let _listeners: ((data: any) => void)[] = [];
let _statusListeners: ((status: string) => void)[] = [];
let _connectionState = 'DISCONNECTED';
let _currentSampleId: string | null = null;

const notify = (payload: any) => _listeners.forEach((cb) => cb(payload));
const setStatus = (status: string) => { _connectionState = status; _statusListeners.forEach((cb) => cb(status)); };

export const deviceWebSocket = {
  async connect(sampleId: string) {
    if (_currentSampleId !== sampleId && (_connectionState === 'CONNECTED' || _connectionState === 'CONNECTING')) {
      if (_ws) { _ws.close(); _ws = null; }
      setStatus('DISCONNECTED');
    }

    _currentSampleId = sampleId;
    if (_connectionState === 'CONNECTED' || _connectionState === 'CONNECTING') return;
    setStatus('CONNECTING');

    // Only establish WebSocket — the HTTP DEVICE_CONNECTION call is already done by handleToggleDevice
    const wsUrl = getWsUrl();
    _ws = new WebSocket(wsUrl);
    _ws.onopen = () => { setStatus('CONNECTED'); };
    _ws.onmessage = (event) => {
      try { notify(JSON.parse(event.data)); } catch (err) { console.error('[deviceWebSocket] Parse error', err); }
    };
    _ws.onerror = (error) => console.error('[deviceWebSocket] Error:', error);
    _ws.onclose = () => { setStatus('DISCONNECTED'); _ws = null; };
  },

  async disconnect() {
    // Only close WebSocket — the HTTP DEVICE_CONNECTION DISCONNECT call is already done by handleToggleDevice
    if (_ws) { _ws.close(); _ws = null; setStatus('DISCONNECTED'); }
  },

  onMessage(cb: (data: any) => void) {
    _listeners.push(cb);
    return () => { _listeners = _listeners.filter((l) => l !== cb); };
  },

  onStatusChange(cb: (status: string) => void) {
    _statusListeners.push(cb);
    cb(_connectionState);
    return () => { _statusListeners = _statusListeners.filter((l) => l !== cb); };
  },

  getStatus() { return _connectionState; },
};