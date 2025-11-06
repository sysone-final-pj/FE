import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { DashboardContainerCard } from '@/entities/container/model/types';

/**
 * WebSocket 데이터를 Dashboard 카드 타입으로 변환
 */
export function mapContainerToDashboardCard(
  data: ContainerDashboardResponseDTO
): DashboardContainerCard {
  return {
    id: String(data.containerId),
    name: data.containerName,
    cpu: `${data.cpuPercent.toFixed(1)}%`,
    memory: `${data.memPercent.toFixed(1)}%`,
    state: mapState(data.state),
    healthy: mapHealth(data.health),
    isFavorite: false, // TODO: 즐겨찾기 기능 구현 시 추가
  };
}

/**
 * 백엔드 State를 프론트 State로 변환
 */
function mapState(state: string): DashboardContainerCard['state'] {
  const stateMap: Record<string, DashboardContainerCard['state']> = {
    RUNNING: 'Running',
    DEAD: 'Dead',
    PAUSED: 'Paused',
    RESTARTING: 'Restarting',
    CREATED: 'Created',
    EXITED: 'Exited',
  };

  return stateMap[state] || 'Running';
}

/**
 * 백엔드 Health를 프론트 Health로 변환
 */
function mapHealth(health: string): DashboardContainerCard['healthy'] {
  const healthMap: Record<string, DashboardContainerCard['healthy']> = {
    HEALTHY: 'Healthy',
    UNHEALTHY: 'UnHealthy',
    STARTING: 'Starting',
    NONE: 'None',
  };

  return healthMap[health] || 'None';
}

/**
 * 여러 컨테이너를 한번에 변환
 */
export function mapContainersToDashboardCards(
  containers: ContainerDashboardResponseDTO[]
): DashboardContainerCard[] {
  return containers.map(mapContainerToDashboardCard);
}
