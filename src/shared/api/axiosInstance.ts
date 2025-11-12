import axios from 'axios';
import { parseApiError } from '@/shared/lib/errors/parseApiError';
import type { SpinnerContextType } from '@/shared/providers/SpinnerContext';
import { authToken } from '@/shared/lib/authToken';

const isDev = import.meta.env.DEV;
const BASE_URL = isDev ? '/api' : (import.meta.env.VITE_API_BASE_URL || '');
const TIMEOUT = isDev ? 0 : 10000;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true,
});

let spinner: SpinnerContextType | null = null;
export const setSpinnerContext = (ctx: SpinnerContextType) => {
  spinner = ctx;
};

api.interceptors.request.use(
  (config) => {
    spinner?.showSpinner?.();

    const token = authToken.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    spinner?.hideSpinner?.();
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (res) => {
    spinner?.hideSpinner?.();
    return res;
  },
  (error) => {
    spinner?.hideSpinner?.();
    const parsed = parseApiError(error);


   if (parsed.status === 401) {
      authToken.remove();
      window.history.replaceState(null, '', '/login');
      window.location.href = '/login';
    }
    return Promise.reject(parsed);
  },
);
