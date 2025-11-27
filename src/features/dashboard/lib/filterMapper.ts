/**
 작성자: 김슬기
 */
import type { FilterState } from '@/shared/types/container';
import type { DashboardContainerListParams } from '@/shared/types/api/dashboard.types';

/**
 * Frontend 정렬 옵션 → Backend sortBy 매핑
 */
const SORT_MAP: Record<'favorite' | 'name' | 'cpu' | 'memory', DashboardContainerListParams['sortBy']> = {
  favorite: 'FAVORITE',
  name: 'NAME',
  cpu: 'CPU_PERCENT',
  memory: 'MEM_PERCENT',
};

/**
 * Frontend State → Backend State 매핑
 * 예: "Running" → "RUNNING", "Dead" → "DEAD"
 */
function mapFrontendStateToBackend(state: string): string {
  return state.toUpperCase();
}

/**
 * Frontend Health → Backend Health 매핑
 * 예: "Healthy" → "HEALTHY", "UnHealthy" → "UNHEALTHY"
 */
function mapFrontendHealthToBackend(health: string): string {
  // "UnHealthy" → "UNHEALTHY"
  if (health === 'UnHealthy') {
    return 'UNHEALTHY';
  }
  return health.toUpperCase();
}

/**
 * Frontend FilterState + sortBy → Backend API Parameters 변환
 * @param filters 프론트엔드 필터 상태
 * @param sortBy 프론트엔드 정렬 옵션
 * @returns 백엔드 API 파라미터
 */
export function buildDashboardParams(
  filters: FilterState,
  sortBy: 'favorite' | 'name' | 'cpu' | 'memory'
): DashboardContainerListParams {
  const params: DashboardContainerListParams = {};

  // 1. 정렬 매핑
  if (sortBy && SORT_MAP[sortBy]) {
    params.sortBy = SORT_MAP[sortBy];
  }

  // 2. Favorite 필터 (Quick Filter에서 'favorite' 체크 시)
  const favoriteFilter = filters.quickFilters.find(f => f.id === 'favorite');
  if (favoriteFilter?.checked) {
    params.favoriteOnly = true;
  }

  // 3. State 필터 (Frontend "Running" → Backend "RUNNING")
  if (filters.state.length > 0) {
    params.states = filters.state.map(mapFrontendStateToBackend);
  }

  // 4. Health 필터 (Frontend "Healthy" → Backend "HEALTHY")
  if (filters.health.length > 0) {
    params.healths = filters.health.map(mapFrontendHealthToBackend);
  }

  // 5. Agent 필터
  // 백엔드는 agentIds (number[])를 요구하지만, 프론트는 agentName (string[])을 가짐
  // agentName → agentId 매핑이 필요하지만, 현재는 매핑 정보가 없음
  // → agentName 필터는 클라이언트 사이드에서만 처리 (DashboardPage의 useMemo)
  // params.agentIds = filters.agentName.map(...); // 구현 보류

  return params;
}
