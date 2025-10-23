import type { ConnectionStatus } from './types';

export const CONNECTION_STATUSES: ConnectionStatus[] = ['Success', 'Fail'];

export const CONNECTION_STATUS_COLORS: Record<ConnectionStatus, string> = {
  Success: 'text-[#14BA6D]',
  Fail: 'text-[#FF6C5E]',
};
