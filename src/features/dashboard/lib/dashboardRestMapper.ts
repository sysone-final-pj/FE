import type { DashboardContainerListItemDTO } from '@/shared/types/api/dashboard.types';
import type { ContainerDashboardResponseDTO, ContainerState, ContainerHealth } from '@/shared/types/websocket';

/**
 * REST API 응답 → WebSocket DTO 변환
 * DashboardContainerListItemDTO (REST) → ContainerDashboardResponseDTO (WebSocket)
 *
 * REST API는 간소화된 메트릭만 제공하므로, WebSocket 구조에 맞춰 기본값으로 채움
 */
export function mapDashboardRestToWebSocket(
  item: DashboardContainerListItemDTO
): ContainerDashboardResponseDTO {
  const now = new Date().toISOString();

  // containerHash fallback: API 제공 시 사용, 없으면 containerId로 대체
  const containerHash = item.containerHash || String(item.containerId);

  // agentName fallback: API 제공 시 사용, 없으면 빈 문자열
  const agentName = item.agentName || '';

  // memPercent를 이용한 대략적인 메모리 사용량 추정 (실제 값은 WebSocket에서만 제공)
  // REST API는 memPercent만 제공하므로, memUsage/memLimit는 계산 불가능 → 0으로 설정
  const memPercent = item.memPercent ?? 0;

  return {
    container: {
      containerId: item.containerId,
      containerHash,
      containerName: item.containerName,
      agentName,
      imageName: item.imageName,
      imageSize: 0, // REST API는 imageSize 미제공
      state: item.state as ContainerState,
      health: item.health as ContainerHealth,
    },

    cpu: {
      cpuPercent: [],
      cpuCoreUsage: [],
      currentCpuPercent: item.cpuPercent ?? 0,
      currentCpuCoreUsage: 0,
      hostCpuUsageTotal: 0,
      cpuUsageTotal: 0,
      cpuUser: 0,
      cpuSystem: 0,
      cpuQuota: 0,
      cpuPeriod: 0,
      onlineCpus: 0,
      cpuLimitCores: 0,
      throttlingPeriods: 0,
      throttledPeriods: 0,
      throttledTime: 0,
      throttleRate: 0,
      summary: {
        current: item.cpuPercent ?? 0,
        avg1m: 0,
        avg5m: 0,
        avg15m: 0,
        p95: 0,
      },
    },

    memory: {
      memoryUsage: [],
      memoryPercent: [],
      currentMemoryUsage: 0, // REST API는 절대값 미제공
      currentMemoryPercent: memPercent,
      memLimit: 0, // REST API는 limit 미제공
      memMaxUsage: 0,
      oomKills: 0,
    },

    network: {
      rxBytesPerSec: [],
      txBytesPerSec: [],
      rxPacketsPerSec: [],
      txPacketsPerSec: [],
      currentRxBytesPerSec: 0,
      currentTxBytesPerSec: 0,
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

    oom: {
      timeSeries: {},
      totalOomKills: 0,
      lastOomKilledAt: '',
    },

    isFavorite: item.isFavorite,

    startTime: now,
    endTime: now,
    dataPoints: 0,
  };
}

/**
 * 여러 REST API 응답을 WebSocket DTO 배열로 변환
 */
export function mapDashboardRestListToWebSocket(
  items: DashboardContainerListItemDTO[]
): ContainerDashboardResponseDTO[] {
  return items.map(mapDashboardRestToWebSocket);
}
