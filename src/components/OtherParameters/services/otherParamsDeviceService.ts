import axios from 'axios';
import { API_BASE_URL } from '../../../config';

const API_URL = API_BASE_URL;
const MODULE = 3; // Module 3 = Other Parameters

export const deviceService = {
  // Fetch sample configuration directory
  getSampleConfiguration: async () => {
    const response = await axios.get(`${API_URL}/SAMPLE_CONFIGURATION`, { timeout: 15000 });
    return response.data;
  },

  // 1. Sample Selection: GET /SAMPLE_MANAGER_CONFIGURATION?ID={sampleId}&MODULE=3
  selectSample: async (id: string, name?: string) => {
    const sId = id || name || '';
    const response = await axios.get(`${API_URL}/SAMPLE_MANAGER_CONFIGURATION`, {
      params: { ID: sId, MODULE },
      timeout: 15000,
    });
    let data = response.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { }
    }
    return data;
  },

  // 2. Live Data: GET /LIVE_DATA?ID={sampleId}&MODULE=3
  getLiveData: async (sampleId: string) => {
    const sId = sampleId || '';
    const response = await axios.get(`${API_URL}/LIVE_DATA`, {
      params: { ID: sId, MODULE },
      timeout: 15000,
    });
    let data = response.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { }
    }
    return data;
  },

  // 3. Save & Update: GET /SAVE_UPDATE?ID={sampleId}&MODULE=3&COLOUR=...&ODOUR=...&TASTE=...
  saveSnapshot: async (sampleId: string, values?: Record<string, any>) => {
    const sId = (sampleId || '').trim();
    const params: Record<string, any> = { ID: sId, MODULE };
    if (values && typeof values === 'object') {
      Object.entries(values).forEach(([k, v]) => {
        const cleanKey = String(k).trim().toUpperCase();
        if (cleanKey && cleanKey !== 'ID' && cleanKey !== 'MODULE') {
          params[cleanKey] = typeof v === 'string' ? v.trim() : v;
        }
      });
    }
    console.log('[OtherParameters deviceService] saveSnapshot final params:', params);
    const response = await axios.get(`${API_URL}/SAVE_UPDATE`, {
      params,
      timeout: 15000,
    });
    return response.data;
  },

  // 4. Sample Location: GET /SAMPLE_LOCATION?ID={sampleId}&MODULE=3&LATITUDE=...&LONGITUDE=...
  sendSampleLocation: async (sampleId: string, locationData: any) => {
    const sId = sampleId || '';
    try {
      const response = await axios.get(`${API_URL}/SAMPLE_LOCATION`, {
        params: {
          ID: sId,
          MODULE,
          LATITUDE: locationData?.latitude,
          LONGITUDE: locationData?.longitude,
          ADDRESS: locationData?.formattedAddress || locationData?.shortAddress,
          CITY: locationData?.city,
          STATE: locationData?.state,
        },
        timeout: 10000,
      });
      return response.data;
    } catch (err: any) {
      console.warn('[OtherParameters deviceService] Could not persist sample location:', err?.message);
      return null;
    }
  },
};

export default deviceService;
