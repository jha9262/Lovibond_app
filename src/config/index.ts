// In development on localhost, fallback to ESP32_IP (e.g. 192.168.4.1).
// In production on ESP32, use relative URLs ('') for HTTP API endpoints.
// This allows the app to dynamically work on AP mode (192.168.4.1), STA mode (router IP), or mDNS (hostname.local).
export const ESP32_IP = import.meta.env.VITE_ESP32_IP || '192.168.4.1';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const REQUEST_TIMEOUT = 10000;
export const WS_RECONNECT_INTERVAL = 3000;

/**
 * Returns the WebSocket URL for device communication.
 * In production on ESP32, dynamically detects window.location.host so the IP is NEVER hardcoded.
 * Supports forced protocol via VITE_WS_PROTOCOL ('ws' or 'wss'), or auto-detects from page protocol.
 */
export const getDeviceWsUrl = (endpoint: string = 'LIVE_DATA'): string => {
  // Explicit override if provided
  if (import.meta.env.VITE_DEVICE_WS_URL) {
    return import.meta.env.VITE_DEVICE_WS_URL;
  }

  const isBrowser = typeof window !== 'undefined' && Boolean(window.location?.host);
  const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const host = isLocalhost ? ESP32_IP : (isBrowser ? window.location.host : ESP32_IP);

  let protocol = 'ws:';
  const forcedProtocol = import.meta.env.VITE_WS_PROTOCOL;
  if (forcedProtocol === 'wss' || forcedProtocol === 'wss:') {
    protocol = 'wss:';
  } else if (forcedProtocol === 'ws' || forcedProtocol === 'ws:') {
    protocol = 'ws:';
  } else if (isBrowser && window.location.protocol === 'https:') {
    protocol = 'wss:';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${protocol}//${host}/${cleanEndpoint}`;
};

