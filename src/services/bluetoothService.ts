import axios from 'axios';
import { API_BASE_URL as BASE_URL } from '../config';

const bluetoothService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

bluetoothService.interceptors.response.use(
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
    console.error('[Bluetooth API Error]:', message);
    return Promise.reject(message);
  }
);

export const scanBluetoothDevices = () => bluetoothService.get('/bluetooth/scan');
export const connectBluetoothDevice = (payload: { name?: string, mac?: string }) => bluetoothService.post('/bluetooth/config', payload);

export default bluetoothService;