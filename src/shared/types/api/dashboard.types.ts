/**
 * Dashboard API 타입 정의
 * - 1번 API: Dashboard Container List
 * - 2번 API: Dashboard Detail
 */

import type { ApiResponse, ContainerBaseInfo } from './common.types';

// 1번 API: Dashboard Container List Response
export type DashboardContainerListResponse = ApiResponse<DashboardContainerListItem[]>;

export interface DashboardContainerListItem {
  container: DashboardContainerMetrics;
  isFavorite: boolean;
}

// 2번 API: Dashboard Detail Response
export type DashboardDetailResponse = ApiResponse<DashboardContainerMetrics>;

// Dashboard Container Metrics (1번, 2번 API 공통)
export interface DashboardContainerMetrics extends ContainerBaseInfo {
  agentId: number;
  imageName: string;
  imageSize: number;

  // CPU 메트릭
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

  // Memory 메트릭
  memPercent: number;
  memUsage: number;
  memLimit: number;
  memMaxUsage: number;

  // Block I/O 메트릭
  blkRead: number;
  blkWrite: number;
  blkReadPerSec: number;
  blkWritePerSec: number;

  // Network 메트릭
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

  // Storage 메트릭
  sizeRw: number;
  sizeRootFs: number;
}

// ============================================
// Dashboard Container List (Simplified) API
// ============================================

/**
 * Dashboard Container List Item DTO (간소화된 버전)
 * 백엔드 /api/dashboard/containers 응답 타입
 */
export interface DashboardContainerListItemDTO {
  containerId: number;
  containerHash?: string;        // Optional - 백엔드에서 제공 시 사용
  containerName: string;
  agentName?: string;            // Optional - 나중에 백엔드 추가 예정
  cpuPercent: number;
  memPercent: number;
  state: string;
  health: string;
  imageName: string;
  imageId: string;
  isFavorite: boolean;
}

/**
 * Dashboard Container List API Parameters
 * 필터링 및 정렬 파라미터
 */
export interface DashboardContainerListParams {
  /** 정렬 기준 */
  sortBy?: 'NAME' | 'CPU_PERCENT' | 'MEM_PERCENT' | 'NETWORK_TOTAL_BYTES' | 'FAVORITE';

  /** 즐겨찾기만 보기 (true: 즐겨찾기만, false/null: 전체) */
  favoriteOnly?: boolean;

  /** 상태 필터 (다중 선택 가능) */
  states?: string[];  // ['RUNNING', 'PAUSED', 'DEAD', ...]

  /** 헬스 상태 필터 (다중 선택 가능) */
  healths?: string[]; // ['HEALTHY', 'UNHEALTHY', 'STARTING', ...]

  /** Agent ID 필터 (다중 선택 가능) */
  agentIds?: number[]; // [1, 2, 3]
}
