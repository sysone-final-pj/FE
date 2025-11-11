import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { DashboardContainerDetail } from '@/entities/container/model/types';

/**
 * 단위 변환 상수
 */
const BYTES_TO_GB = 1024 ** 3;
const BYTES_TO_MB = 1024 ** 2;
const BYTES_TO_KB = 1024;

/**
 * State 표시 변환 (대문자 → 보기 좋은 형태)
 */
function mapStateDisplay(state: string): string {
  const stateMap: Record<string, string> = {
    RUNNING: 'Running',
    RESTARTING: 'Restarting',
    DEAD: 'Dead',
    CREATED: 'Created',
    EXITED: 'Exited',
    PAUSED: 'Paused',
    DELETED: 'Exited',
    UNKNOWN: 'Unknown',
  };
  return stateMap[state] || state;
}

/**
 * Health 표시 변환 (대문자 → 보기 좋은 형태)
 */
function mapHealthDisplay(health: string): string {
  const healthMap: Record<string, string> = {
    HEALTHY: 'Healthy',
    UNHEALTHY: 'UnHealthy',
    STARTING: 'Starting',
    NONE: 'None',
    UNKNOWN: 'Unknown',
  };
  return healthMap[health] || health;
}

/**
 * Uptime 계산 (현재는 WebSocket에 timestamp가 없어서 N/A)
 * 향후 DTO에 startedAt 필드 추가 시 구현
 */
function calculateUptime(dto: ContainerDashboardResponseDTO): string {
  // TODO: DTO에 startedAt 필드가 추가되면 실제 uptime 계산
  // const now = Date.now();
  // const started = new Date(dto.startedAt).getTime();
  // const uptimeMs = now - started;
  // return formatUptime(uptimeMs);

  return 'N/A';
}

/**
 * ContainerDashboardResponseDTO → DashboardContainerDetail 변환
 * WebSocket으로 받은 실시간 데이터를 Dashboard 상세 패널 타입으로 변환
 */
export function mapToDetailPanel(
  dto: ContainerDashboardResponseDTO
): DashboardContainerDetail {
  return {
    // 기본 정보
    agentName: dto.agentName,
    containerName: dto.containerName,
    containerId: dto.containerHash,

    // CPU 메트릭
    cpu: {
      usage: `${dto.cpuPercent.toFixed(1)}%`,
      current: `${dto.cpuCoreUsage.toFixed(2)}`,
      total: `${dto.onlineCpus}`,
    },

    // Memory 메트릭 (bytes → MB)
    memory: {
      usage: `${dto.memPercent.toFixed(1)}%`,
      current: `${(dto.memUsage / BYTES_TO_MB).toFixed(0)} MB`,
      total: `${(dto.memLimit / BYTES_TO_MB).toFixed(0)} MB`,
    },

    // State 정보
    state: {
      status: mapStateDisplay(dto.state),
      uptime: calculateUptime(dto),
    },

    // Health 정보
    healthy: {
      status: mapHealthDisplay(dto.health),
      lastCheck: 'N/A', // WebSocket DTO에 lastCheck 필드 없음
      message: 'N/A', // WebSocket DTO에 message 필드 없음
    },

    // Network 메트릭 (bytes/s → KB/s)
    network: {
      rx: `${(dto.rxBytesPerSec / BYTES_TO_KB).toFixed(1)}`,
      tx: `${(dto.txBytesPerSec / BYTES_TO_KB).toFixed(1)}`,
    },

    // Block I/O 메트릭 (bytes/s → MB/s)
    blockIO: {
      read: `${(dto.blkReadPerSec / BYTES_TO_MB).toFixed(1)}`,
      write: `${(dto.blkWritePerSec / BYTES_TO_MB).toFixed(1)}`,
    },

    // Image 정보
    image: dto.imageName
      ? {
          repository: dto.imageName.split(':')[0] || dto.imageName,
          tag: dto.imageName.split(':')[1] || 'latest',
          imageId: dto.containerHash.substring(0, 12),
          size: `${(dto.imageSize / BYTES_TO_MB).toFixed(0)} MB`,
        }
      : undefined,

    // Storage 정보 (bytes → GB)
    storage:
      dto.sizeRootFs > 0 || dto.imageSize > 0
        ? {
            used: `${(dto.sizeRootFs / BYTES_TO_GB).toFixed(2)} GB`,
            total: `${(dto.imageSize / BYTES_TO_GB).toFixed(2)} GB`,
            percentage:
              dto.imageSize > 0
                ? Math.round((dto.sizeRootFs / dto.imageSize) * 100)
                : 0,
          }
        : undefined,
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
