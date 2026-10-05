import { LocationData } from '../types';

const locationCache = new Map<string, LocationData>();

export const clearLocationCache = () => locationCache.clear();

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

const getBrowserCoordinates = (): Promise<{ latitude: number, longitude: number, accuracy: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
        accuracy: Math.round(position.coords.accuracy),
      }),
      (error) => {
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: 'Location access was denied.',
          [error.POSITION_UNAVAILABLE]: 'Location information is currently unavailable.',
          [error.TIMEOUT]: 'Location request timed out.',
        };
        reject(new Error(messages[error.code] || 'Unable to retrieve location.'));
      },
      { enableHighAccuracy: true, timeout: 3000, maximumAge: 60000 }
    );
  });
};

const reverseGeocodeOSM = async (coords: { latitude: number, longitude: number, accuracy: number }): Promise<LocationData> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`;
  const res = await fetchWithTimeout(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'LovibondWaterApp/1.0' } }, 3000);
  if (!res.ok) throw new Error(`OSM error: ${res.status}`);
  const data = await res.json();
  const addr = data.address || {};
  const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || '';
  const district = addr.county || addr.state_district || '';
  const state = addr.state || '';
  const country = addr.country || '';
  const neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
  const parts = [addr.road, neighbourhood, city, district, state].filter(Boolean);
  return {
    ...coords,
    formattedAddress: parts.concat(country).join(', ') || data.display_name || `${coords.latitude}, ${coords.longitude}`,
    shortAddress: parts.length > 0 ? parts.join(', ') : `${coords.latitude}, ${coords.longitude}`,
    city, district, state, country,
    postalCode: addr.postcode || '',
    source: 'OpenStreetMap',
  };
};

const reverseGeocodeBigDataCloud = async (coords: { latitude: number, longitude: number, accuracy: number }): Promise<LocationData> => {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`;
  const res = await fetchWithTimeout(url, {}, 4000);
  if (!res.ok) throw new Error(`BigDataCloud error: ${res.status}`);
  const data = await res.json();
  const city = data.city || data.locality || '';
  const state = data.principalSubdivision || '';
  const country = data.countryName || '';
  const district = data.localityInfo?.administrative?.[2]?.name || '';
  const parts = [city, district, state].filter(Boolean);
  return {
    ...coords,
    formattedAddress: [data.locality, city, state, country].filter(Boolean).join(', ') || `${coords.latitude}, ${coords.longitude}`,
    shortAddress: parts.length > 0 ? parts.join(', ') : `${coords.latitude}, ${coords.longitude}`,
    city, district, state, country,
    postalCode: data.postcode || '',
    source: 'BigDataCloud',
  };
};

export const getExactLocation = async (): Promise<LocationData> => {
  let coords;
  try {
    coords = await getBrowserCoordinates();
  } catch (err: any) {
    console.warn('[location] GPS unavailable:', err.message);
    return { latitude: 0, longitude: 0, accuracy: 0, formattedAddress: 'Location unavailable', shortAddress: 'Location unavailable', city: '', district: '', state: '', country: '', postalCode: '', source: 'GPS_BLOCKED' };
  }

  const cacheKey = `${coords.latitude},${coords.longitude}`;
  if (locationCache.has(cacheKey)) return locationCache.get(cacheKey)!;

  try {
    const result = await reverseGeocodeOSM(coords);
    locationCache.set(cacheKey, result);
    return result;
  } catch (osmErr: any) {
    console.warn('[location] OSM failed, trying BigDataCloud:', osmErr.message);
  }

  try {
    const result = await reverseGeocodeBigDataCloud(coords);
    locationCache.set(cacheKey, result);
    return result;
  } catch (bdcErr: any) {
    console.warn('[location] BigDataCloud failed:', bdcErr.message);
  }

  return {
    ...coords,
    formattedAddress: `Lat: ${coords.latitude}, Lng: ${coords.longitude}`,
    shortAddress: `${coords.latitude}, ${coords.longitude}`,
    city: '', district: '', state: '', country: '', postalCode: '',
    source: 'GPS_RAW',
  };
};