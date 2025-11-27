/**
 작성자: 김슬기
 */
import type {
  DashboardContainerMetricsDTO,
  NetworkStatsDTO,
  BlockIOStatsDTO,
} from '@/shared/types/api/dashboard.types';
import type { ContainerDashboardResponseDTO, ContainerState, ContainerHealth } from '@/shared/types/websocket';

/**
 * 3개 REST API 응답 병합 → ContainerDashboardResponseDTO
 *
 * Dashboard Detail 클릭 시 초기 데이터 로드:
 * - GET /api/dashboard/containers/{containerId}/metrics
 * - GET /api/dashboard/containers/{containerId}/network-stats
 * - GET /api/dashboard/containers/{containerId}/blockio-stats
 *
 * → WebSocket DTO 구조로 변환하여 Store에 저장
 */
export function mergeDashboardDetailAPIs(
  metrics: DashboardContainerMetricsDTO,
  networkStats: NetworkStatsDTO,
  blockIOStats: BlockIOStatsDTO
): ContainerDashboardResponseDTO {
  const now = new Date().toISOString();

  return {
    container: {
      containerId: metrics.container.containerId,
      containerHash: metrics.container.containerHash,
      containerName: metrics.container.containerName,
      agentName: metrics.container.agentName,
      imageName: metrics.container.imageName,
      imageSize: metrics.container.imageSize,
      state: metrics.container.state as ContainerState,
      health: metrics.container.health as ContainerHealth,
      status: metrics.container.status,  // REST API에서 uptime 정보 포함
    },

    cpu: {
      cpuPercent: [],  // 시계열은 WebSocket에서만 제공
      cpuCoreUsage: [],
      currentCpuPercent: metrics.cpu.cpuPercent,
      currentCpuCoreUsage: metrics.cpu.cpuUsage,
      hostCpuUsageTotal: 0,
      cpuUsageTotal: 0,
      cpuUser: 0,
      cpuSystem: 0,
      cpuQuota: 0,
      cpuPeriod: 0,
      onlineCpus: metrics.cpu.cpuLimitCores,
      cpuLimitCores: metrics.cpu.cpuLimitCores,
      throttlingPeriods: 0,
      throttledPeriods: 0,
      throttledTime: 0,
      throttleRate: 0,
      summary: {
        current: metrics.cpu.cpuPercent,
        avg1m: 0,
        avg5m: 0,
        avg15m: 0,
        p95: 0,
      },
    },

    memory: {
      memoryUsage: [],  // 시계열은 WebSocket에서만 제공
      memoryPercent: [],
      currentMemoryUsage: metrics.memory.memUsage,
      currentMemoryPercent: (metrics.memory.memUsage / metrics.memory.memLimit) * 100,
      memLimit: metrics.memory.memLimit,
      memMaxUsage: 0,
      oomKills: 0,
    },

    network: {
      // REST API 시계열 데이터 매핑
      rxBytesPerSec: networkStats.dataPoints.map(p => ({
        timestamp: p.timestamp,
        value: p.rxBytesPerSec,
      })),
      txBytesPerSec: networkStats.dataPoints.map(p => ({
        timestamp: p.timestamp,
        value: p.txBytesPerSec,
      })),
      rxPacketsPerSec: [],
      txPacketsPerSec: [],
      currentRxBytesPerSec: metrics.network.rxBytesPerSec,
      currentTxBytesPerSec: metrics.network.txBytesPerSec,
      totalRxBytes: 0,
      totalTxBytes: 0,
      totalRxPackets: 0,
      totalTxPackets: 0,
      networkTotalBytes: 0,
      rxErrors: 0,
      txErrors: 0,
      rxDropped: 0,
      txDropped: 0,
      rxFailureRate: 0,
      txFailureRate: 0,
    },

    blockIO: {
      // REST API 시계열 데이터 매핑 (이미 bytes/sec 값)
      blkReadPerSec: blockIOStats.dataPoints.map(p => ({
        timestamp: p.timestamp,
        value: p.blkReadPerSec,
      })),
      blkWritePerSec: blockIOStats.dataPoints.map(p => ({
        timestamp: p.timestamp,
        value: p.blkWritePerSec,
      })),
      currentBlkReadPerSec: metrics.blockIO.blkReadPerSec,
      currentBlkWritePerSec: metrics.blockIO.blkWritePerSec,
    },

    storage: {
      storageLimit: metrics.storage.storageLimit,
      storageUsed: metrics.storage.storageUsed,
    },

    logs: metrics.logs ? {
      stdoutCount: metrics.logs.stdoutCount,
      stderrCount: metrics.logs.stderrCount,
      stdoutCountByCreatedAt: metrics.logs.stdoutCount,  // REST API에는 구분 없으므로 동일 값 사용
      stderrCountByCreatedAt: metrics.logs.stderrCount,
    } : undefined,

    oom: {
      timeSeries: {},
      totalOomKills: 0,
      lastOomKilledAt: '',
    },

    startTime: now,
    endTime: now,
    dataPoints: networkStats.dataPoints.length,
  };
}