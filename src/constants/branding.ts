/** Shared device-hosted logo used by the application and generated reports. */
// Resolve against the current host so the image follows the device's active IP,
// hostname, and protocol instead of being tied to one network address.
export const BRAND_LOGO_URL = typeof window !== 'undefined'
  ? new URL('/LOGO.png', window.location.origin).toString()
  : '/LOGO.png';

/** Local logo served from Vite's public folder and included in ESP32 packages. */
export const BRAND_LOGO_FALLBACK_URL = typeof window !== 'undefined'
  ? new URL('/logo.png', window.location.origin).toString()
  : '/logo.png';
