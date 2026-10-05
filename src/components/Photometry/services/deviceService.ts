import axios from 'axios';
import { API_BASE_URL } from '../../../config';

const API_URL = API_BASE_URL;
const MODULE = 2;

export const deviceService = {
  getSampleConfiguration: async () => {
    const response = await axios.get(`${API_URL}/SAMPLE_CONFIGURATION`, { timeout: 15000 });
    return response.data;
  },

  // GET /SAMPLE_MANAGER_CONFIGURATION?ID={sampleId}&MODULE=2
  selectSample: async (id: string, name: string) => {
    const sId = id || name || '';
    const response = await axios.get(`${API_URL}/SAMPLE_MANAGER_CONFIGURATION`, {
      params: { ID: sId, MODULE },
      timeout: 15000,
    });
    return response.data;
  },

  getLiveData: async (sampleId: string) => {
    const sId = sampleId || '';
    const response = await axios.get(`${API_URL}/LIVE_DATA`, {
      params: { ID: sId, MODULE },
      timeout: 15000,
    });
    return response.data;
  },

  // GET /DEVICE_CONNECTION?STATE=CONNECT&MODULE=2  (or STATE=DISCONNECT)
  setDeviceState: async (isOn: boolean) => {
    const stateStr = isOn ? 'CONNECT' : 'DISCONNECT';
    const response = await axios.get(`${API_URL}/DEVICE_CONNECTION`, {
      params: { STATE: stateStr, MODULE },
      timeout: 15000,
    });
    return response.data;
  },

  // GET /SAVE_UPDATE?ID={sampleId}&MODULE=2&ACTIVE_TEST={testName}
  saveSnapshot: async (sampleId: string, activeTest: string) => {
    const sId = sampleId || '';
    const response = await axios.get(`${API_URL}/SAVE_UPDATE`, {
      params: { ID: sId, MODULE, ACTIVE_TEST: activeTest },
      timeout: 15000,
    });
    return response.data;
  },

  // GET /SAMPLE_LOCATION?ID={sampleId}&MODULE=2&LATITUDE=...&LONGITUDE=...&ADDRESS=...&CITY=...&STATE=...
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
      console.warn('[Photometry deviceService] Could not persist sample location:', err.message);
      return null;
    }
  },
};
