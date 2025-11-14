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
