import axios from 'axios';
import { mapApiError, mapNetworkError } from './mapApiError';
import type { ApiError } from './types';

export function parseApiError(
  err: unknown,
  domain?: 'auth' | 'user' | 'agent' | 'alert'
): ApiError {
  if (axios.isAxiosError(err)) {
    const response = err.response;

    if (!response) {
      return {
        message: mapNetworkError(err.code),
        type: 'NETWORK',
      };
    }

    const status = Number(response.status); // 혹시 string일 경우 대비
    const data = response.data;

    const serverMessage: string | undefined =
      data?.detail || 
      data?.message || 
      data?.errorMessage || 
      undefined;

    return {
      status,
      message: mapApiError(status, domain, serverMessage),
      type:
        domain === 'auth'
          ? 'AUTH'
          : domain === 'user'
          ? 'USER'
          : domain === 'agent'
          ? 'AGENT'
          : domain === 'alert'
          ? 'ALERT'
          : status >= 500
          ? 'SERVER'
          : 'UNKNOWN',
    };
  }

  return {
    message: '알 수 없는 오류가 발생했습니다.',
    type: 'UNKNOWN',
  };
}
