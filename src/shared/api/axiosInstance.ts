import axios from 'axios';
import { parseApiError } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 환경별 timeout 설정 (dev = 무제한, prod = 10초)
const TIMEOUT = import.meta.env ? 0 : 10000;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true,
});

// 스피너 제어 함수들 (SpinnerProvider에서 설정됨)
let showSpinnerFn: (() => void) | null = null;
let hideSpinnerFn: (() => void) | null = null;

export const setSpinnerHandlers = (
  showSpinner: () => void,
  hideSpinner: () => void
) => {
  showSpinnerFn = showSpinner;
  hideSpinnerFn = hideSpinner;
};

// 요청 인터셉터 (JWT 자동 주입 + 스피너 시작)
api.interceptors.request.use(
  (config) => {
    // 스피너 표시
    if (showSpinnerFn) {
      showSpinnerFn();
    }

    // JWT 토큰 자동 주입
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // 요청 실패 시에도 스피너 숨김
    if (hideSpinnerFn) {
      hideSpinnerFn();
    }
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 + 스피너 종료)
api.interceptors.response.use(
  (res) => {
    // 응답 성공 시 스피너 숨김
    if (hideSpinnerFn) {
      hideSpinnerFn();
    }
    return res;
  },
  (error) => {
    // 응답 실패 시에도 스피너 숨김
    if (hideSpinnerFn) {
      hideSpinnerFn();
    }

    const parsed = parseApiError(error);

    // TODO: Toast 메시지로 대체 권장
    // Development 환경에서만 콘솔 로그 (선택사항)

    // 토큰 만료 시 자동 로그아웃
    if (parsed.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    return Promise.reject(parsed);
  }
);