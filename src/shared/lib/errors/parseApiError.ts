import axios from 'axios';
import { mapApiError, mapNetworkError } from './mapApiError';
import type { ApiError } from './types';

export function parseApiError(err: unknown, domain?: 'auth' | 'user' | 'agent' | 'alert'): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;

    // 네트워크 장애 (response 없음)
    if (!err.response) {
      return {
        message: mapNetworkError(err.code),
        type: 'NETWORK',
      };
    }

    return {
      status,
      message: mapApiError(status, domain),
      type:
        domain === 'auth'
          ? 'AUTH'
          : domain === 'user'
          ? 'USER'
          : domain === 'agent'
          ? 'AGENT'
          : domain === 'alert'
          ? 'ALERT'
          : status && status >= 500
          ? 'SERVER'
          : 'UNKNOWN',
    };
  }

  return {
    message: '알 수 없는 오류가 발생했습니다.',
    type: 'UNKNOWN',
  };
}
