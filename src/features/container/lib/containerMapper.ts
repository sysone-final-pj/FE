/********************************************************************************************
 * mapToContainerData.ts
 * ─────────────────────────────────────────────
 * WebSocket으로 받은 ContainerDashboardResponseDTO → UI용 ContainerData 변환
 * - 모든 단위 변환은 formatters.ts 사용
 * - state / health 매핑은 formatters.ts 내부에서 수행
 * - 즐겨찾기 상태 유지 기능 포함
 ********************************************************************************************/

import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { ContainerData } from '@/shared/types/container';
import {
  formatBytes,
  formatNetworkSpeed,
  formatContainerState,
  formatContainerHealth,
} from '@/shared/lib/formatters';

/**
 * 단일 컨테이너 매핑
 */
export function mapToContainerData(dto: ContainerDashboardResponseDTO): ContainerData {
  const c = dto.container;
  const cpu = dto.cpu;
  const mem = dto.memory;
  const net = dto.network;

  const memoryUsed = formatBytes(mem.currentMemoryUsage);
  const memoryMax = formatBytes(mem.memLimit);

  const storageUsed = formatBytes(c.imageSize); // 이미지 크기 기준
  const storageMax = formatBytes(c.imageSize); // 총 이미지 용량 (임시 동일)

  const networkRx = formatNetworkSpeed(net.currentRxBytesPerSec);
  const networkTx = formatNetworkSpeed(net.currentTxBytesPerSec);

  return {
    id: String(c.containerId),
    isFavorite: dto.isFavorite ?? false,
    agentName: c.agentName,
    containerId: c.containerHash,
    containerName: c.containerName,

    // CPU
    cpuPercent: Number(cpu.currentCpuPercent.toFixed(2)),

    // Memory
    memoryUsed: parseFloat(memoryUsed.split(' ')[0]), // 숫자만 추출
    memoryMax: parseFloat(memoryMax.split(' ')[0]),
    // percentage는 UI에서 `${memoryPercent.toFixed(1)}%` 로 표시 가능

    // Storage
    storageUsed: parseFloat(storageUsed.split(' ')[0]),
    storageMax: parseFloat(storageMax.split(' ')[0]),

    networkRx: parseFloat(networkRx.split(' ')[0]),
    networkTx: parseFloat(networkTx.split(' ')[0]),

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
