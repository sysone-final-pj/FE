export type ConnectionStatus = 'Success' | 'Fail';

export interface Agent {
  id: string;
  agentName: string;
  isActive: string;
  hashcode: string;
  description: string;
  created: string;
}

export type SortField = keyof Agent;
export type SortDirection = 'asc' | 'desc';
