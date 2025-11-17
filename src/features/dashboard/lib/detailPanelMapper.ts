import {
  formatBytes,
  formatBytesPerSec,
  parseImageName,
  calculatePercentage,
  formatContainerId,
  formatPercentage,
} from '@/shared/lib/formatters';
import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { DashboardContainerDetail } from '@/entities/container/model/types';

function mapStateDisplay(state: string): string {
  const map = {
    RUNNING: 'Running',
    RESTARTING: 'Restarting',
    DEAD: 'Dead',
    CREATED: 'Created',
    EXITED: 'Exited',
    PAUSED: 'Paused',
    DELETED: 'Exited',
    UNKNOWN: 'Unknown',
  } as const;
  return map[state as keyof typeof map] ?? state;
}

function mapHealthDisplay(health: string): string {
  const map = {
    HEALTHY: 'Healthy',
    UNHEALTHY: 'Unhealthy',
    STARTING: 'Starting',
    NONE: 'None',
    UNKNOWN: 'Unknown',
  } as const;
  return map[health as keyof typeof map] ?? health;
}

/**
 * Uptime 계산 (현재는 WebSocket에 timestamp가 없어서 N/A)
 * 향후 DTO에 startedAt 필드 추가 시 구현
 */
/*
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateUptime(_dto: ContainerDashboardResponseDTO): string {
  // TODO: DTO에 startedAt 필드가 추가되면 실제 uptime 계산
  // const now = Date.now();
  // const started = new Date(dto.container.startedAt).getTime();
  // const uptimeMs = now - started;
  // return formatUptime(uptimeMs);

  return 'N/A';
}
*/

/**
 * ContainerDashboardResponseDTO → DashboardContainerDetail 변환
 * WebSocket으로 받은 실시간 데이터를 Dashboard 상세 패널 타입으로 변환
 */
export function mapToDetailPanel(dto: ContainerDashboardResponseDTO): DashboardContainerDetail {
  const { container, cpu, memory, network, blockIO } = dto;

  const imageInfo = parseImageName(container.imageName);
  const storageUsed = container.imageSize; // 임시 사용 (실제 RootFs 값 가능)
  const storageTotal = container.imageSize;

  return {
    // 기본 정보
    agentName: container.agentName,
    containerName: container.containerName,
    containerId: String(container.containerId), // ✅ containerId를 string으로 변환

    // CPU 메트릭
    cpu: {
      usage: formatPercentage(cpu.currentCpuPercent ?? 0),
      current: (cpu.currentCpuCoreUsage ?? 0).toFixed(2),
      total: `${cpu.onlineCpus ?? 0}`,
    },

    // Memory 메트릭
    memory: {
      usage: formatPercentage(memory.currentMemoryPercent ?? 0),
      current: formatBytes(memory.currentMemoryUsage ?? 0),
      total: formatBytes(memory.memLimit ?? 0),
    },

    // State / Health
    state: {
      status: mapStateDisplay(container.state),
      uptime: 'N/A',
    },
    healthy: {
      status: mapHealthDisplay(container.health),
      lastCheck: 'N/A',
      message: 'N/A',
    },

    // Network
    network: {
      rx: formatBytesPerSec(network.currentRxBytesPerSec ?? 0),
      tx: formatBytesPerSec(network.currentTxBytesPerSec ?? 0),
    },

    // Block I/O (blockIO 데이터 있으면 사용, 없으면 network 임시 대체)
    blockIO: {
      read: formatBytes(blockIO?.totalBlkRead ?? network.totalRxBytes ?? 0),
      write: formatBytes(blockIO?.totalBlkWrite ?? network.totalTxBytes ?? 0),
    },

    // Image 정보
    image: {
      repository: imageInfo.repository,
      tag: imageInfo.tag,
      imageId: formatContainerId(container.containerHash),
      size: formatBytes(container.imageSize),
    },

    // Storage 정보
    storage: {
      used: formatBytes(storageUsed),
      total: formatBytes(storageTotal),
      percentage: calculatePercentage(storageUsed, storageTotal),
    },
  };
}

/**
 * 여러 ContainerDashboardResponseDTO를 DashboardContainerDetail[]로 변환
 */
export function mapToDetailPanelList(
  dtos: ContainerDashboardResponseDTO[]
): DashboardContainerDetail[] {
  return dtos.map(mapToDetailPanel);
}
