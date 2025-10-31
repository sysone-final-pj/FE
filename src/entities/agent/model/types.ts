export type ConnectionStatus = 'ON' | 'OFF';

export interface Agent {
  id: string;
  agentName: string;
  active: ConnectionStatus;
  hashcode: string;
  description: string;
  created: string;
}

export type SortField = keyof Agent;
export type SortDirection = 'asc' | 'desc';
