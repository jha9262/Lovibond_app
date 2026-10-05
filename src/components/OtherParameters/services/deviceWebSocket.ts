import { getDeviceWsUrl } from '../../../config';

const getWsUrl = () => getDeviceWsUrl('LIVE_DATA');


let _ws: WebSocket | null = null;
let _listeners: ((data: any) => void)[] = [];
let _statusListeners: ((status: string) => void)[] = [];
let _connectionState = 'DISCONNECTED';
let _currentSampleId: string | null = null;

const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;
let _retryCount = 0;

const scheduleReconnect = () => {
  const delay = Math.min(BASE_DELAY_MS * 2 ** _retryCount, MAX_DELAY_MS);
  _retryCount += 1;
  const jitter = Math.random() * delay * 0.1;
  const finalDelay = Math.round(delay + jitter);
  console.warn(`[OtherParams deviceWebSocket] Reconnect attempt #${_retryCount} in ${finalDelay} ms`);
  setTimeout(() => {
    if (_currentSampleId) {
      deviceWebSocket.connect(_currentSampleId).catch(() => { });
    }
  }, finalDelay);
};

const notify = (payload: any) => _listeners.forEach((cb) => cb(payload));
const setStatus = (status: string) => { _connectionState = status; _statusListeners.forEach((cb) => cb(status)); };

export const deviceWebSocket = {
  async connect(sampleId: string) {
    if (_currentSampleId !== sampleId && (_connectionState === 'CONNECTED' || _connectionState === 'CONNECTING')) {
      if (_ws) {
        _ws.onmessage = null;
        _ws.close();
        _ws = null;
      }
      setStatus('DISCONNECTED');
    }

    _currentSampleId = sampleId;
    if (_connectionState === 'CONNECTED' || _connectionState === 'CONNECTING') return;
    setStatus('CONNECTING');

    const wsUrl = getWsUrl();
    _ws = new WebSocket(wsUrl);
    _ws.onopen = () => { setStatus('CONNECTED'); };
    _ws.onmessage = (event) => {
      try { notify(JSON.parse(event.data)); } catch (err) { console.error('[OtherParams deviceWebSocket] Parse error', err); }
    };
    _ws.onerror = (error) => console.error('[OtherParams deviceWebSocket] Error:', error);
    _ws.onclose = () => { setStatus('DISCONNECTED'); _ws = null; };
  },

  async disconnect() {
    _currentSampleId = null;
    if (_ws) {
      _ws.onmessage = null;
      _ws.close();
      _ws = null;
      setStatus('DISCONNECTED');
    }
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
