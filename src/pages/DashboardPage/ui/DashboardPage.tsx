import { useEffect, useState, useMemo } from 'react';
import { ContainerStateCard } from '@/entities/container/ui/DashboardStateCard';
import { HealthyStatusCard } from '@/entities/container/ui/DashboardHealthyCard';
import { DashboardContainerList } from '@/widgets/DashboardContainerList';
import { DashboardFiltersModal } from '@/widgets/DashboardFiltersModal';
import { DashboardDetailPanel } from '@/widgets/DashboardDetailPanel';
import {
  MOCK_DASHBOARD_CONTAINER_STATES,
  MOCK_DASHBOARD_HEALTHY_STATES,
} from '@/entities/container/model/dashboardConstants';
import {
  INITIAL_DASHBOARD_FILTERS,
  MOCK_CONTAINER_DETAILS,
} from '@/shared/mocks/dashboardData';
import type { DashboardFilters } from '@/features/dashboard/model/filterTypes';
import type { DashboardContainerDetail, DashboardContainerCard } from '@/entities/container/model/types';
import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';
import { mapContainersToDashboardCards } from '@/features/dashboard/lib/containerMapper';

export const DashboardPage = () => {
  // WebSocket 연결 및 실시간 데이터
  const { status, error, isConnected, containers, isPaused, togglePause } = useDashboardWebSocket();

  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [selectedContainerDetail, setSelectedContainerDetail] =
    useState<DashboardContainerDetail | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_DASHBOARD_FILTERS);

  // WebSocket 데이터를 Dashboard 카드 타입으로 변환
  const dashboardContainers = useMemo(() => {
    return mapContainersToDashboardCards(containers);
  }, [containers]);

  // WebSocket 상태 로그
  useEffect(() => {
    console.log('[DashboardPage] WebSocket Status:', status);
    console.log('[DashboardPage] Connected:', isConnected);
    console.log('[DashboardPage] Containers:', dashboardContainers);
    if (error) {
      console.error('[DashboardPage] WebSocket Error:', error);
    }
  }, [status, isConnected, dashboardContainers, error]);

  // 필터링된 컨테이너 리스트
  const filteredContainers = useMemo(() => {
    let result = [...dashboardContainers];

    // Favorite 필터
    const favoriteFilter = filters.quickFilters.find(f => f.id === 'favorite');
    if (favoriteFilter?.checked) {
      result = result.filter(c => c.isFavorite);
    }

    // Agent Name 필터
    const checkedAgents = filters.agentNames.filter(a => a.checked);
    if (checkedAgents.length > 0) {
      const agentLabels = checkedAgents.map(a => a.label);
      result = result.filter(c => {
        const detail = MOCK_CONTAINER_DETAILS[c.id];
        return detail && agentLabels.includes(detail.agentName);
      });
    }

    // State 필터
    const checkedStates = filters.states.filter(s => s.checked);
    if (checkedStates.length > 0) {
      const stateLabels = checkedStates.map(s => s.label.toLowerCase());
      result = result.filter(c => {
        const detail = MOCK_CONTAINER_DETAILS[c.id];
        return detail && stateLabels.includes(detail.state.status.toLowerCase());
      });
    }

    // Healthy 필터
    const checkedHealthy = filters.healthy.filter(h => h.checked);
    if (checkedHealthy.length > 0) {
      const healthyLabels = checkedHealthy.map(h => h.label.toLowerCase());
      result = result.filter(c => {
        const detail = MOCK_CONTAINER_DETAILS[c.id];
        return detail && healthyLabels.includes(detail.healthy.status.toLowerCase());
      });
    }

    return result;
  }, [filters, dashboardContainers]);

  useEffect(() => {
    if (!selectedContainerId && filteredContainers.length > 0) {
      const first = filteredContainers[0];
      setSelectedContainerId(first.id);
      setSelectedContainerDetail(MOCK_CONTAINER_DETAILS[first.id]);
    }
  }, [selectedContainerId, filteredContainers]);

  const handleSelectContainer = (id: string) => {
    setSelectedContainerId(id);
    setSelectedContainerDetail(MOCK_CONTAINER_DETAILS[id] || null);
  };

  const handleApplyFilters = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full bg-[#f8f8fa] flex justify-center">
      {/* 고정된 너비의 컨테이너로 전체 레이아웃을 감싸서 확대/축소 시 하나의 단위로 동작 */}
      <div className="w-[1920px]">
        <div className="flex gap-5 pt-6 pb-[41px]">
          {/* 왼쪽 - 메인 영역 */}
          <div className="w-[997px] flex flex-col">
            <div className="pl-[60px]">
              {/* 상단 상태 카드 */}
              <div className="flex gap-4 mb-6">
                <ContainerStateCard stats={MOCK_DASHBOARD_CONTAINER_STATES} />
                <HealthyStatusCard stats={MOCK_DASHBOARD_HEALTHY_STATES} />
              </div>

              {/* 컨테이너 리스트 */}
              <DashboardContainerList
                containers={filteredContainers}
                onFilterClick={() => setIsFiltersOpen(true)}
                selectedIds={selectedContainerId ? [selectedContainerId] : []}
                onToggleSelect={handleSelectContainer}
              />
            </div>
          </div>

          {/* 오른쪽 - 상세 패널 */}
          {selectedContainerDetail && (
            <div className="w-[871px] flex-shrink-0 pr-8">
              <DashboardDetailPanel
                container={selectedContainerDetail}
                onClose={() => {
                  setSelectedContainerId(null);
                  setSelectedContainerDetail(null);
                }}
              />
            </div>
          )}
        </div>
      </div>


      {/* 필터 모달 */}
      <DashboardFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
};
