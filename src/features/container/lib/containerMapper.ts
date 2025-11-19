/********************************************************************************************
 * mapToContainerData.ts
 * ─────────────────────────────────────────────
 * WebSocket으로 받은 ContainerDashboardResponseDTO → UI용 ContainerData 변환
 * - 원본 bytes 값을 그대로 저장 (UI에서 formatters로 변환)
 * - state / health 매핑은 formatters.ts 내부에서 수행
 * - 즐겨찾기 상태 유지 기능 포함
 ********************************************************************************************/

import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { ContainerData } from '@/shared/types/container';
import {
  formatContainerState,
  formatContainerHealth,
} from '@/shared/lib/formatters';

/**
 * 단일 컨테이너 매핑
 * ContainerData는 원본 bytes 값을 저장하며, UI에서 formatters를 사용해 표시
 */
export function mapToContainerData(dto: ContainerDashboardResponseDTO): ContainerData {
  const c = dto.container;
  const cpu = dto.cpu;
  const mem = dto.memory;
  const net = dto.network;

  return {
    id: String(c.containerId),
    isFavorite: dto.isFavorite ?? false,
    agentName: c.agentName,
    containerId: c.containerHash,
    containerName: c.containerName,

    // CPU (퍼센트 값)
    cpuPercent: Number(cpu.currentCpuPercent.toFixed(2)),

    // Memory (원본 bytes 값 저장 - UI에서 formatBytes로 표시)
    memoryUsed: mem.currentMemoryUsage ?? 0,
    memoryMax: mem.memLimit ?? 0,

    // Storage (원본 bytes 값 저장 - UI에서 formatBytes로 표시)
    storageUsed: c.imageSize ?? 0,
    storageMax: c.imageSize ?? 0,

    // Network (원본 bytes/s 값 저장 - UI에서 formatNetworkSpeed로 표시)
    networkRx: net.currentRxBytesPerSec ?? 0,
    networkTx: net.currentTxBytesPerSec ?? 0,

    // 상태 (formatter에서 일관 변환)
    state: formatContainerState(c.state) as ContainerData['state'],
    health: formatContainerHealth(c.health) as ContainerData['health'],
  };
}

/**
 * 여러 개 DTO 매핑
 */
export function mapToContainerDataList(
  dtos: ContainerDashboardResponseDTO[]
): ContainerData[] {
  return dtos.map(mapToContainerData);
}

/**
 * 즐겨찾기 상태를 유지하면서 매핑
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
