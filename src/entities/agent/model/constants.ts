/**
 작성자: 김슬기
*/
import type { ConnectionStatus } from './types';

export const CONNECTION_STATUSES: ConnectionStatus[] = [
  'REGISTERED',
  'CONNECTING',
  'AUTHENTICATING',
  'ONLINE',
  'OFFLINE',
  'ERROR',
];

export const CONNECTION_STATUS_COLORS: Record<ConnectionStatus, string> = {
  REGISTERED: 'text-tertiary',
  CONNECTING: 'text-state-running',
  AUTHENTICATING: 'text-state-running',
  ONLINE: 'text-state-healthy',
  OFFLINE: 'text-tertiary',
  ERROR: 'text-state-error',
};
