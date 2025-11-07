import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type {
  DashboardContainerCard,
  DashboardContainerStats,
  DashboardHealthyStats,
} from '@/entities/container/model/types';
import {
  DASHBOARD_CONTAINER_STATE_COLORS,
  DASHBOARD_HEALTHY_STATUS_COLORS,
} from '@/entities/container/model/dashboardConstants';

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

/**
 * 컨테이너 목록에서 State별 통계 집계
 * @param containers - WebSocket 컨테이너 목록
 * @returns State별 카운트 배열
 */
export function aggregateContainerStates(
  containers: ContainerDashboardResponseDTO[]
): DashboardContainerStats[] {
  // State별 카운트 맵
  const stateCounts: Record<string, number> = {
    Running: 0,
    Dead: 0,
    Paused: 0,
    Restarting: 0,
    Created: 0,
    Exited: 0,
  };

  // 각 컨테이너의 state를 집계
  containers.forEach((container) => {
    const mappedState = mapState(container.state);
    if (stateCounts[mappedState] !== undefined) {
      stateCounts[mappedState]++;
    }
  });

  // DashboardContainerStats 배열로 변환
  return Object.entries(stateCounts).map(([state, count]) => ({
    state: state as DashboardContainerCard['state'],
    count,
    color: DASHBOARD_CONTAINER_STATE_COLORS[state] || '#767676',
  }));
}

/**
 * 컨테이너 목록에서 Healthy별 통계 집계
 * @param containers - WebSocket 컨테이너 목록
 * @returns Healthy별 카운트 배열
 */
export function aggregateHealthyStats(
  containers: ContainerDashboardResponseDTO[]
): DashboardHealthyStats[] {
  // Healthy별 카운트 맵
  const healthCounts: Record<string, number> = {
    Healthy: 0,
    UnHealthy: 0,
    Starting: 0,
    None: 0,
  };

  // 각 컨테이너의 health를 집계
  containers.forEach((container) => {
    const mappedHealth = mapHealth(container.health);
    if (healthCounts[mappedHealth] !== undefined) {
      healthCounts[mappedHealth]++;
    }
  });

  // DashboardHealthyStats 배열로 변환
  return Object.entries(healthCounts).map(([status, count]) => ({
    status: status as DashboardContainerCard['healthy'],
    count,
    color: DASHBOARD_HEALTHY_STATUS_COLORS[status] || '#767676',
  }));
}

/**
 * 컨테이너 목록에서 Unique한 Agent Name 추출
 * @param containers - WebSocket 컨테이너 목록
 * @returns Unique Agent Name 배열 (정렬됨)
 */
export function extractAgentNames(containers: ContainerDashboardResponseDTO[]): string[] {
  const agentNames = new Set<string>();

  containers.forEach((container) => {
    if (container.agentName) {
      agentNames.add(container.agentName);
    }
  });

  return Array.from(agentNames).sort();
}
