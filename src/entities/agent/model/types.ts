export type ConnectionStatus = 'Success' | 'Fail';

export interface Agent {
  id: string;
  agentName: string;
  apiEndpoint: string;
  authToken?: string;
  connectionStatus: ConnectionStatus;
  description: string;
  created: string;
}

export type SortField = keyof Agent;
export type SortDirection = 'asc' | 'desc';
