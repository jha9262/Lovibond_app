import axios from 'axios';
import { API_BASE_URL as BASE_URL } from '../config';

const deviceService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

deviceService.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.message || 'Network Error';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        try {
          const parsed = JSON.parse(error.response.data);
          message = parsed.MESSAGE || parsed.message || error.response.data;
        } catch {
          message = error.response.data;
        }
      } else if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data.MESSAGE) {
        message = error.response.data.MESSAGE;
      }
    }
    console.error('API Error:', message);
    return Promise.reject(message);
  }
);

import { authService } from './authService';

export const login = (userId: string, password: string) => {
  return authService.login({ USER_ID: userId, PASSWORD: password });
};

export const getLoggerConfig = (): Promise<any> => deviceService.get('/DEVICE_DATA_LOGGER_CONFIGURATION');
export const updateLoggerConfig = (data: any): Promise<any> => deviceService.post('/DEVICE_DATA_LOGGER_CONFIGURATION', data);

export const getSlaveConfig = (): Promise<any> => deviceService.get('/SLAVE_CONFIGURATION_DATA?REFRESH=TRUE');
export const updateSlaveConfig = (data: any): Promise<any> => deviceService.post('/SLAVE_CONFIGURATION_DATA', data);

export const getReports = (path: string, pathType: string) =>
  deviceService.get(`/REPORT_FILE_NAME_GET?REFRESH=TRUE&PATH=${path}&PATH_TYPE=${pathType}`);

export const getReportLogs = (params: any) => deviceService.get('/REPORT_LOGS', { params });

export const deleteReport = (path: string) => deviceService.delete(`/REPORT_FILE_NAME_DELETE?FILE_PATH=${path}`);

export const downloadReport = async (path: string, fileName: string): Promise<Blob> => {
  const response = await deviceService.get(`/REPORT_LOG_DOWNLOAD?FILE_PATH=${path}&FILE_FORMAT=csv&FILE_NAME=${fileName}`, {
    responseType: 'blob'
  });
  return response as unknown as Blob;
};

export const fetchLiveStatus = () => deviceService.get('/PID_LIVE_DATA');

export const updateDeviceState = (deviceState: string) =>
  deviceService.post('/LIVE_DATA_DEVICE_STATE', { DEVICE_STATE: deviceState });

export const updateSV = (payload: any) =>
  deviceService.post('/SET_SV', payload);

export const getDeviceSettings = async (refresh: string, slaveInfo: any, mode: string) => {
  return await deviceService.get('/SAVED_DEVICE_SETTING_DATA_GET', {
    params: {
      REFRESH: refresh,
      SLAVE_ID: slaveInfo.SLAVE_ID,
      SLAVE_NAME: slaveInfo.SLAVE_NAME,
      SLAVE_MAKE: slaveInfo.SLAVE_MAKE,
      SLAVE_MODEL: slaveInfo.SLAVE_MODEL,
      SLAVE_NO: slaveInfo.SLAVE_NO,
      MODE: mode
    }
  });
};

export const updateDeviceSettings = async (slaveInfo: any, settingsData: any) => {
  return await deviceService.put('/UPDATED_DEVICE_SETTING_DATA', settingsData, {
    params: {
      SLAVE_ID: slaveInfo.SLAVE_ID,
      SLAVE_NAME: slaveInfo.SLAVE_NAME,
      SLAVE_MAKE: slaveInfo.SLAVE_MAKE,
      SLAVE_MODEL: slaveInfo.SLAVE_MODEL,
      SLAVE_NO: slaveInfo.SLAVE_NO
    }
  });
};

export const postDeviceSettings = async (slaveInfo: any, settingsData: any, mode: string) => {
  return await deviceService.post('/POST_SAVED_DEVICE_SETTING_DATA', settingsData, {
    params: {
      REFRESH: 'FALSE',
      SLAVE_ID: slaveInfo.SLAVE_ID,
      SLAVE_NAME: slaveInfo.SLAVE_NAME,
      SLAVE_MAKE: slaveInfo.SLAVE_MAKE,
      SLAVE_MODEL: slaveInfo.SLAVE_MODEL,
      SLAVE_NO: slaveInfo.SLAVE_NO,
      MODE: mode
    }
  });
};

export const setSoftAlarm = async (alarmData: any) => {
  return await deviceService.post('/SOFT_SETTING', alarmData);
};

export const mainLogin = async (deviceId: string, password: string) => {
  const base64Credentials = btoa(`${deviceId}:${password}`);
  return await deviceService.get('/LOGIN', {
    headers: {
      Authorization: `Basic ${base64Credentials}`,
    },
  });
};

export const batchConfiguration = async (payload: any) => {
  return await deviceService.post('/BATCH_CONFIGURATION', payload);
};

export const fetchWifiNetworks = () => deviceService.get('/GET_WIFI_AVAILABLE_NETWORK');

export default deviceService;