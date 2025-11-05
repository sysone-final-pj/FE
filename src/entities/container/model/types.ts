// Dashboard Container State 타입
export type DashboardContainerState = 'Running' | 'Dead' | 'Paused' | 'Restarting' | 'Created' | 'Exited';

export type DashboardHealthyStatus = 'Healthy' | 'UnHealthy' | 'Starting' | 'None';

// Dashboard 통계 카드용 인터페이스
export interface DashboardContainerStats {
  state: DashboardContainerState;
  count: number;
  color?: string;
}

export interface DashboardHealthyStats {
  status: DashboardHealthyStatus;
  count: number;
  color?: string;
}

// Dashboard 컨테이너 카드 인터페이스
export interface DashboardContainerCard {
  id: string;
  name: string;
  cpu: string;
  memory: string;
  state: DashboardContainerState;
  healthy: DashboardHealthyStatus;
  isFavorite?: boolean;
}

// Dashboard 상세 정보 인터페이스 
export interface DashboardContainerDetail {
  agentName: string;
  containerName: string;
  containerId: string;
  cpu: {
    usage: string;
    current: string;
    total: string;
  };
  memory: {
    usage: string;
    current: string;
    total: string;
  };
  state: {
    status: string;
    uptime: string;
  };
  healthy: {
    status: string;
    lastCheck: string;
    message: string;
  };
  network?: {
    rx: string;
    tx: string;
  };
  image?: {
    repository: string;
    tag: string;
    imageId: string;
    size: string;
  };
  storage?: {
    used: string;
    total: string;
    percentage: number;
  };
}
