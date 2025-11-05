import type { ConnectionStatus } from './types';

export const CONNECTION_STATUSES: ConnectionStatus[] = ['ON', 'OFF'];

export const CONNECTION_STATUS_COLORS: Record<ConnectionStatus, string> = {
  ON: 'text-state-healthy',
  OFF: 'text-tertiary',
};
