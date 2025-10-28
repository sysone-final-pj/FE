import {
  AUTH_ERROR_MESSAGES,
  USER_ERROR_MESSAGES,
  AGENT_ERROR_MESSAGES,
  ALERT_ERROR_MESSAGES,
  NETWORK_ERROR_MESSAGES,
} from './messages';

export function mapApiError(status?: number, domain?: 'auth' | 'user' | 'agent' | 'alert'): string {
  if (!status) return AUTH_ERROR_MESSAGES.LOGIN_FAILED;

  switch (domain) {
    case 'auth':
      if (status === 401) return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
      if (status === 403) return AUTH_ERROR_MESSAGES.UNAUTHORIZED;
      if (status >= 500) return AUTH_ERROR_MESSAGES.SERVER_ERROR;
      break;

    case 'user':
      if (status === 404) return USER_ERROR_MESSAGES.NOT_FOUND;
      if (status >= 500) return USER_ERROR_MESSAGES.UPDATE_FAILED;
      break;

    case 'agent':
      if (status === 404) return AGENT_ERROR_MESSAGES.NOT_FOUND;
      if (status >= 500) return AGENT_ERROR_MESSAGES.REGISTER_FAILED;
      break;

    case 'alert':
      if (status >= 500) return ALERT_ERROR_MESSAGES.FETCH_FAILED;
      break;

    default:
      if (status >= 500) return NETWORK_ERROR_MESSAGES.UNKNOWN;
  }

  return AUTH_ERROR_MESSAGES.LOGIN_FAILED;
}

export function mapNetworkError(code?: string): string {
  if (code === 'ECONNABORTED') return NETWORK_ERROR_MESSAGES.TIMEOUT;
  return NETWORK_ERROR_MESSAGES.DISCONNECTED;
}
