/**
 * Manage Containers API Response를 UI 컴포넌트용 타입으로 변환하는 매퍼
 */

import type { ManageContainerListItem } from '@/shared/types/api/manage.types';
import type { ContainerData } from '@/shared/types/container';
import { formatContainerState, formatContainerHealth, formatContainerId } from '@/shared/lib/formatters';

/**
 * Manage Container List Item을 테이블용 데이터로 변환
 */
export function mapToContainerData(item: ManageContainerListItem): ContainerData {
  return {
    id: (item.id ?? 0).toString(),
    isFavorite: item.isFavorite ?? false,
    agentName: item.agentName ?? '',
    containerId: formatContainerId(item.containerHash),
    containerName: item.containerName ?? '',
    cpuPercent: item.cpuPercent ?? 0,
    memoryUsed: item.memUsage ?? 0,
    memoryMax: item.memLimit ?? 0,
    storageUsed: item.sizeRootFs ?? 0,
    storageMax: item.storageLimit ?? 0,
    networkRx: item.rxBytesPerSec ?? 0,
    networkTx: item.txBytesPerSec ?? 0,
    state: formatContainerState(item.state) as ContainerData['state'],
    health: formatContainerHealth(item.health) as ContainerData['health'],
  };
}

/**
 * Manage Container List Response를 배열로 변환
 */
export function mapToContainerDataList(items: ManageContainerListItem[]): ContainerData[] {
  return items.map(mapToContainerData);
}
