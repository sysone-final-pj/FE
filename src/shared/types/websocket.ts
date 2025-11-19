import type { IMessage } from '@stomp/stompjs';

/**
 * 웹소켓 연결 상태
 */
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * 웹소켓 구독 정보
 */
export interface WebSocketSubscription {
  id: string;
  destination: string;
  callback: (message: IMessage) => void;
}

/**
 * 웹소켓 구독 경로 (백엔드 실제 경로)
 */
export const WS_DESTINATIONS = {
  // Dashboard - 컨테이너 목록 (1번 API)
  DASHBOARD_LIST: '/topic/dashboard/list',

  // Manage Containers - 컨테이너 요약 (3번 API)
  CONTAINERS_SUMMARY: '/topic/containers/summary',

  // Alert - 개인별 알림
  USER_ALERTS: '/user/queue/alerts',

  // Alert - 전체 브로드캐스트 (관리자용)
  BROADCAST_ALERTS: '/topic/alerts',

  // Agent - 에이전트 상태 (ON/OFF)
  AGENTS_STATUS: '/topic/agents/status',

  /**
   * Dashboard 상세 - 선택된 컨테이너 상세 정보 (2번 API)
   * @param containerId 컨테이너 ID
   * @returns /topic/dashboard/detail/{containerId}
   */
  dashboardDetail: (containerId: number) => `/topic/dashboard/detail/${containerId}`,

  /**
   * Container 메트릭 - 개별 컨테이너 메트릭 (4번 API)
   * @param containerId 컨테이너 ID
   * @returns /topic/containers/{containerId}/metrics
   */
  containerMetrics: (containerId: number) => `/topic/containers/${containerId}/metrics`,
} as const;

/**
 * 웹소켓 에러 타입
 */
export interface WebSocketError {
  type: 'connection' | 'subscription' | 'message' | 'auth';
  message: string;
  timestamp: number;
}

// ============================================
// Container Dashboard Types (백엔드 DTO 구조)
// ============================================

/**
 * 컨테이너 상태
 */
export type ContainerState = 'RUNNING' | 'RESTARTING' | 'DEAD' | 'CREATED' | 'EXITED' | 'PAUSED' | 'DELETED' | 'UNKNOWN';

/**
 * 컨테이너 헬스 상태
 */
export type ContainerHealth = 'HEALTHY' | 'UNHEALTHY' | 'STARTING' | 'NONE' | 'UNKNOWN';

/**
 * Dashboard WebSocket으로 받는 실시간 컨테이너 메트릭
 * 백엔드: ContainerDashboardResponseDTO
 * 토픽: /topic/dashboard
 */
export interface ContainerDashboardResponseDTO {
  container: {
    containerId: number;
    containerHash: string;
    containerName: string;
    agentName: string;
    imageName: string;
    imageSize: number;
    state: ContainerState;
    health: ContainerHealth;
    status?: string;  // REST API에서만 제공 (예: "Up 5 hours (healthy)")
  };

  cpu: {
    cpuPercent: { timestamp: string; value: number }[];
    cpuCoreUsage: { timestamp: string; value: number }[];
    currentCpuPercent: number;
    currentCpuCoreUsage: number;
    hostCpuUsageTotal: number;
    cpuUsageTotal: number;
    cpuUser: number;
    cpuSystem: number;
    cpuQuota: number;
    cpuPeriod: number;
    onlineCpus: number;
    cpuLimitCores: number;
    throttlingPeriods: number;
    throttledPeriods: number;
    throttledTime: number;
    throttleRate: number;
    summary: {
      current: number;
      avg1m: number;
      avg5m: number;
      avg15m: number;
      p95: number;
    };
  };

  memory: {
    memoryUsage: { timestamp: string; value: number }[];
    memoryPercent: { timestamp: string; value: number }[];
    currentMemoryUsage: number;
    currentMemoryPercent: number;
    memLimit: number;
    memMaxUsage: number;
    oomKills: number;
  };

  network: {
    rxBytesPerSec: { timestamp: string; value: number }[];
    txBytesPerSec: { timestamp: string; value: number }[];
    rxPacketsPerSec: { timestamp: string; value: number }[];
    txPacketsPerSec: { timestamp: string; value: number }[];
    currentRxBytesPerSec: number;
    currentTxBytesPerSec: number;
    totalRxBytes: number;
    totalTxBytes: number;
    totalRxPackets: number;
    totalTxPackets: number;
    networkTotalBytes: number;
    rxErrors: number;
    txErrors: number;
    rxDropped: number;
    txDropped: number;
    rxFailureRate: number;
    txFailureRate: number;
  };

  oom: {
    timeSeries: Record<string, number>;
    totalOomKills: number;
    lastOomKilledAt: string;
  };

  blockIO?: {
    blkReadPerSec: { timestamp: string; value: number }[];
    blkWritePerSec: { timestamp: string; value: number }[];
    currentBlkReadPerSec: number;
    currentBlkWritePerSec: number;
    totalBlkRead: number;
    totalBlkWrite: number;
  };

  storage?: {
    storageLimit: number;
    storageUsed: number;
  };

  logs?: {
    stdoutCount: number;
    stderrCount: number;
    stdoutCountByCreatedAt: number;
    stderrCountByCreatedAt: number;
  };

  isFavorite?: boolean;

  startTime: string;
  endTime: string;
  dataPoints: number;
}

// ============================================
// Alert Types (백엔드 DTO 구조)
// ============================================

/**
 * 알림 레벨
 */
export type AlertLevel = 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';

/**
 * 메트릭 타입
 */
export type MetricType = 'CPU' | 'MEMORY' | 'NETWORK';

/**
 * 컨테이너 정보 (알림 내 포함)
 */
export interface ContainerInfoResponseDTO {
  containerId: number;
  containerName: string;
  containerHash: string;
  metricType?: string;  // REST API 변환 시 추가
  metricValue?: number;  // REST API 변환 시 추가
}

/**
 * Alert WebSocket으로 받는 실시간 알림
 * 백엔드: AlertMessageResponseDTO
 * 토픽: /user/queue/alerts (개인), /topic/alerts (브로드캐스트)
 */
export interface AlertMessageResponseDTO {
  alertId: number;
  metricType: string;
  title: string;
  message: string;
  createdAt: string;
  containerInfo: ContainerInfoResponseDTO;
}

/**
 * REST API로 가져오는 알림 목록 아이템
 */
export interface AlertListItemDTO {
  id: number;
  message: string;
  alertLevel: AlertLevel;
  metricType: MetricType;
  metricValue: number;
  isRead: boolean;
  createdAt: string;
  collectedAt: string;
  containerName: string;
  agentName: string;
}

/**
 * 알림 상태 (로컬 관리용)
 * AlertMessageResponseDTO를 확장하고 REST API 추가 필드 포함
 */
export interface AlertNotification extends AlertMessageResponseDTO {
  isRead: boolean;
  agentName?: string;  // REST API에서만 제공
  metricValue?: number;  // REST API에서만 제공
  collectedAt?: string;  // REST API에서만 제공
}

/**
 * Dashboard 상세 정보 (Detail Dashboard)
 * 백엔드: ContainerDetailDashboardResponseDTO
 * 토픽: /topic/dashboard/detail (예상)
 */
export interface ContainerDetailDashboardResponseDTO {
  containerId: number;
  containerHash: string;
  containerName: string;
  agentId: number;
  agentName: string;
  state: ContainerState;
  health: ContainerHealth;
  imageName: string;
  imageSize: number;

  // CPU
  cpuPercent: number;
  cpuCoreUsage: number;
  cpuUsageTotal: number;
  hostCpuUsageTotal: number;
  cpuUser: number;
  cpuSystem: number;
  cpuQuota: number;
  cpuPeriod: number;
  onlineCpus: number;
  throttlingPeriods: number;
  throttledPeriods: number;
  throttledTime: number;

  // Memory
  memPercent: number;
  memUsage: number;
  memLimit: number;
  memMaxUsage: number;

  // Block I/O
  blkRead: number;
  blkWrite: number;
  blkReadPerSec: number;
  blkWritePerSec: number;

  // Network
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  networkTotalBytes: number;
  rxBytesPerSec: number;
  txBytesPerSec: number;
  rxPps: number;
  txPps: number;
  rxFailureRate: number;
  txFailureRate: number;
  rxErrors: number;
  txErrors: number;
  rxDropped: number;
  txDropped: number;

  // Storage
  sizeRw: number;
  sizeRootFs: number;
}

// ============================================
// Agent Types (백엔드 DTO 구조)
// ============================================

/**
 * 에이전트 연결 상태
 */
export type AgentConnectionStatus = 'ON' | 'OFF';

/**
 * Agent WebSocket으로 받는 실시간 에이전트 상태
 * 백엔드: AgentStatusResponseDTO (추정)
 * 토픽: /topic/agents/status
 *
 * NOTE: 실제 데이터 구조는 콘솔에서 확인 후 조정 필요
 * 가능한 형식:
 * 1. 단일 에이전트: { agentId: 1, status: 'ON', ... }
 * 2. 전체 리스트: [{ agentId: 1, status: 'ON' }, ...]
 * 3. Response wrapper: { data: [...] }
 */
export interface AgentStatusResponseDTO {
  agentId: number;
  agentKey?: string;
  agentName?: string;
  status: AgentConnectionStatus;
  description?: string;
  hashcode?: string;
  createdAt?: string;
  updatedAt?: string;
}