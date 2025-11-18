/**
 * Dashboard API Response를 UI 컴포넌트용 타입으로 변환하는 매퍼
 */

import type {
  DashboardContainerListItem,
  DashboardContainerMetrics,
} from '@/shared/types/api/dashboard.types';
import type {
  DashboardContainerCard,
  DashboardContainerDetail,
  DashboardContainerState,
  DashboardHealthyStatus,
} from '@/entities/container/model/types';
import {
  formatPercentage,
  formatBytes,
  formatNetworkSpeed,
  formatBytesPerSec,
  formatContainerId,
  parseImageName,
  calculateCpuCores,
} from '@/shared/lib/formatters';

/**
 * Dashboard Container List Item을 카드용 데이터로 변환
 */
export function mapToDashboardCard(item: DashboardContainerListItem): DashboardContainerCard {
  const { container } = item;

  return {
    id: String(container.containerId),
    name: container.containerName,
    cpu: formatPercentage(container.cpuPercent),
    memory: container.memPercent === Infinity || container.memPercent == null
      ? formatBytes(container.memUsage ?? 0)  // 퍼센트 계산 불가 시 사용량만 표시
      : formatPercentage(container.memPercent),
    state: mapToCardState(container.state),
    healthy: mapToCardHealth(container.health),
    isFavorite: item.isFavorite,
  };
}

/**
 * Dashboard Container Metrics를 상세 패널용 데이터로 변환
 */
export function mapToDashboardDetail(metrics: DashboardContainerMetrics): DashboardContainerDetail {
  const cpuCores = calculateCpuCores(metrics.cpuQuota, metrics.cpuPeriod);
  const cpuLimit = cpuCores === Infinity ? metrics.onlineCpus : cpuCores;

  const imageInfo = parseImageName(metrics.imageName);

  return {
    agentName: metrics.agentName,
    containerName: metrics.containerName,
    containerId: String(metrics.containerId), 
    containerHash: metrics.containerHash,
    cpu: {
      usage: formatPercentage(metrics.cpuPercent),
      current: `${metrics.cpuCoreUsage.toFixed(2)} cores`,
      total: `${cpuLimit.toFixed(0)} cores`,
    },
    memory: {
      usage: metrics.memLimit == null || metrics.memPercent === Infinity
        ? formatBytes(metrics.memUsage ?? 0)
        : formatPercentage(metrics.memPercent),
      current: formatBytes(metrics.memUsage),
      total: metrics.memLimit != null ? formatBytes(metrics.memLimit) : '-',
    },
    state: {
      status: mapToCardState(metrics.state),
      uptime: '', // 백엔드에서 제공하지 않음
    },
    healthy: {
      status: mapToCardHealth(metrics.health),
      lastCheck: '', // 백엔드에서 제공하지 않음
      message: '', // 백엔드에서 제공하지 않음
    },
    network: {
      rx: formatNetworkSpeed(metrics.rxBytesPerSec),
      tx: formatNetworkSpeed(metrics.txBytesPerSec),
    },
    blockIO: {
      read: formatBytesPerSec(metrics.blkReadPerSec),
      write: formatBytesPerSec(metrics.blkWritePerSec),
    },
    image: {
      repository: imageInfo.repository,
      tag: imageInfo.tag,
      imageId: formatContainerId(metrics.containerHash),
      size: formatBytes(metrics.imageSize),
    },
    storage: {
      used: formatBytes(metrics.sizeRw),
      total: formatBytes(metrics.sizeRootFs),
      percentage: metrics.sizeRootFs > 0 ? (metrics.sizeRw / metrics.sizeRootFs) * 100 : 0,
    },
  };
}

/**
 * 백엔드 상태를 UI 카드 상태로 변환
 */
function mapToCardState(state: string): DashboardContainerState {
  const map: Record<string, DashboardContainerState> = {
    RUNNING: 'Running',
    RESTARTING: 'Restarting',
    DEAD: 'Dead',
    CREATED: 'Created',
    EXITED: 'Exited',
    PAUSED: 'Paused',
    DELETED: 'Exited',
    UNKNOWN: 'Exited',
  };
  return map[state] || 'Exited';
}

/**
 * 백엔드 헬스 상태를 UI 카드 헬스 상태로 변환
 */
function mapToCardHealth(health: string): DashboardHealthyStatus {
  const map: Record<string, DashboardHealthyStatus> = {
    HEALTHY: 'Healthy',
    UNHEALTHY: 'UnHealthy',
    STARTING: 'Starting',
    NONE: 'None',
    UNKNOWN: 'None',
  };
  return map[health] || 'None';
}
