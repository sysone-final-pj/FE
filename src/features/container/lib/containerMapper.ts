import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { ContainerData } from '@/shared/types/container';

/**
 * 단위 변환 유틸리티
 */
const BYTES_TO_GB = 1024 ** 3;
const BYTES_TO_MB = 1024 ** 2;
const BYTES_TO_KB = 1024;

/**
 * ContainerState 변환 (대문자 → 소문자)
 */
function mapContainerState(
  state: ContainerDashboardResponseDTO['state']
): ContainerData['state'] {
  const stateMap: Record<string, ContainerData['state']> = {
    RUNNING: 'running',
    RESTARTING: 'restarting',
    DEAD: 'dead',
    CREATED: 'created',
    EXITED: 'exited',
    PAUSED: 'paused',
    DELETED: 'exited', // DELETED는 exited로 매핑
    UNKNOWN: 'exited', // UNKNOWN도 exited로 매핑
  };
  return stateMap[state] || 'exited';
}

/**
 * ContainerHealth 변환 (대문자 → 소문자)
 */
function mapContainerHealth(
  health: ContainerDashboardResponseDTO['health']
): ContainerData['health'] {
  const healthMap: Record<string, ContainerData['health']> = {
    HEALTHY: 'healthy',
    UNHEALTHY: 'unhealthy',
    STARTING: 'starting',
    NONE: 'none',
    UNKNOWN: 'none', // UNKNOWN은 none으로 매핑
  };
  return healthMap[health] || 'none';
}

/**
 * ContainerDashboardResponseDTO → ContainerData 변환
 * WebSocket으로 받은 실시간 데이터를 UI 타입으로 변환
 */
export function mapToContainerData(dto: ContainerDashboardResponseDTO): ContainerData {
  return {
    // 기본 정보
    id: String(dto.containerId), // number → string
    isFavorite: false, // 로컬 상태 관리 (기본값)
    agentName: dto.agentName,
    containerId: dto.containerHash, // containerHash를 containerId로 사용
    containerName: dto.containerName,

    // CPU 메트릭
    cpuPercent: Number(dto.cpuPercent.toFixed(2)), // 소수점 2자리

    // Memory 메트릭 (bytes → MB) - TableRow에서 MB로 표시
    memoryUsed: Number((dto.memUsage / BYTES_TO_MB).toFixed(2)),
    memoryMax: Number((dto.memLimit / BYTES_TO_MB).toFixed(2)),

    // Storage 메트릭 (bytes → GB)
    storageUsed: Number((dto.sizeRootFs / BYTES_TO_GB).toFixed(2)),
    storageMax: Number((dto.imageSize / BYTES_TO_GB).toFixed(2)),

    // Network 메트릭 (bytes/s → Kbps) - TableRow에서 Kbps로 표시
    // 1 bytes/s = 8 bits/s = 0.008 Kbps
    networkRx: Number(((dto.rxBytesPerSec * 8) / 1000).toFixed(2)),
    networkTx: Number(((dto.txBytesPerSec * 8) / 1000).toFixed(2)),

    // 상태 (대문자 → 소문자)
    state: mapContainerState(dto.state),
    health: mapContainerHealth(dto.health),
  };
}

/**
 * 여러 ContainerDashboardResponseDTO를 ContainerData[]로 변환
 */
export function mapToContainerDataList(
  dtos: ContainerDashboardResponseDTO[]
): ContainerData[] {
  return dtos.map(mapToContainerData);
}

/**
 * ContainerData에 isFavorite 상태를 유지하면서 업데이트
 * 기존 favoriteIds를 받아서 적용
 */
export function mapWithFavorites(
  dtos: ContainerDashboardResponseDTO[],
  favoriteIds: Set<string>
): ContainerData[] {
  return dtos.map((dto) => {
    const container = mapToContainerData(dto);
    return {
      ...container,
      isFavorite: favoriteIds.has(container.id),
    };
  });
}
