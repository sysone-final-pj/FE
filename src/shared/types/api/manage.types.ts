/**
 * Manage Containers API 타입 정의
 * - 3번 API: Manage Container List
 * - 4번 API: Metric Detail
 */

import type { ApiResponse, ContainerState, ContainerHealth, TimeSeriesDataPoint } from './common.types';

// 3번 API: Manage Container List Response
export type ManageContainerListResponse = ApiResponse<ManageContainerListItem[]>;

export interface ManageContainerListItem {
  id: number;
  agentName: string;
  containerHash: string;
  containerName: string;
  cpuPercent: number;
  isCpuUnlimited: boolean;
  memUsage: number;
  memLimit: number;
  isMemoryUnlimited: boolean;
  memPercent: number;
  rxBytesPerSec: number;
  txBytesPerSec: number;
  state: ContainerState;
  health: ContainerHealth;
  imageSize: number;
  sizeRootFs: number;
  storageLimit: number;
  isStorageUnlimited: boolean;
  isFavorite: boolean;
}

// 4번 API: Metric Detail Response
export type MetricDetailResponse = ApiResponse<MetricDetail>;

export interface MetricDetail {
  container: MetricContainerInfo;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  oom: OomMetrics;
  startTime: string;
  endTime: string;
  dataPoints: number;
}

export interface MetricContainerInfo {
  containerId: number;
  containerHash: string;
  containerName: string;
  agentName: string;
  imageName: string;
  imageSize: number;
  state: ContainerState;
  health: ContainerHealth;
}

export interface CpuMetrics {
  cpuPercent: TimeSeriesDataPoint[];
  cpuCoreUsage: TimeSeriesDataPoint[];
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
  summary: CpuSummary;
}

export interface CpuSummary {
  current: number;
  avg1m: number;
  avg5m: number;
  avg15m: number;
  p95: number;
}

export interface MemoryMetrics {
  memoryUsage: TimeSeriesDataPoint[];
  memoryPercent: TimeSeriesDataPoint[];
  currentMemoryUsage: number;
  currentMemoryPercent: number;
  memLimit: number;
  memMaxUsage: number;
  oomKills: number;
}

export interface NetworkMetrics {
  rxBytesPerSec: TimeSeriesDataPoint[];
  txBytesPerSec: TimeSeriesDataPoint[];
  rxPacketsPerSec: TimeSeriesDataPoint[];
  txPacketsPerSec: TimeSeriesDataPoint[];
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
}

export interface OomMetrics {
  timeSeries: Record<string, number>;
  totalOomKills: number;
  lastOomKilledAt: string | null;
}
