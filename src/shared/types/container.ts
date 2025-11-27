/**
 작성자: 김슬기
 */
export type SortDirection = 'asc' | 'desc' | null;

export type SortField = 'isFavorite' | 'agentName' | 'containerId' | 'containerName' | 'cpuPercent' | 'memoryUsed' | 'storageUsed' | 'networkRx' | 'state' | 'health';

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

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
}

export interface FilterState {
  quickFilters: FilterOption[];
  agentName: string[];
  state: string[];
  health: string[];
  favoriteOnly: boolean;
}