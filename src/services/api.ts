import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.message);
    return Promise.reject(err);
  }
);

export default api;