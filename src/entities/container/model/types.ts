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
  containerHash: string;
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
  blockIO?: {
    read: string;
    write: string;
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
  logs?: {
    totalCount: number;           // total = stdoutCount
    stdoutCount: number;          // 서버 시간 기준 (수집시간)
    stderrCount: number;
    stdoutCountByCreatedAt: number;  // 클라이언트 시간 기준
    stderrCountByCreatedAt: number;
  };
}
