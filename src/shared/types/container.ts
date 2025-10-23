export type SortDirection = 'asc' | 'desc' | null;

export type SortField = 'agentName' | 'containerId' | 'containerName' | 'cpuPercent' | 'memoryUsed' | 'storageUsed' | 'networkRx' | 'state' | 'health';

export interface ContainerData {
  id: string;
  isFavorite: boolean;
  agentName: string;
  containerId: string;
  containerName: string;
  cpuPercent: number;
  memoryUsed: number;
  memoryMax: number;
  storageUsed: number;
  storageMax: number;
  networkRx: number;
  networkTx: number;
  state: 'running' | 'restarting' | 'dead' | 'created' | 'exited' | 'paused';
  health: 'healthy' | 'starting' | 'unhealthy' | 'none';
}

export interface FilterState {
  agentName: string[];
  state: string[];
  health: string[];
  favoriteOnly: boolean;
}