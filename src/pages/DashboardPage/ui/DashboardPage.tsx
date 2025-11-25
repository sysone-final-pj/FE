import { useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { ContainerStateCard } from '@/entities/container/ui/DashboardStateCard';
import { HealthyStatusCard } from '@/entities/container/ui/DashboardHealthyCard';
import { DashboardContainerList } from '@/widgets/DashboardContainerList';
import { FilterModal } from '@/shared/ui/FilterModal/FilterModal';
import { DashboardDetailPanel } from '@/widgets/DashboardDetailPanel';

import type { FilterState } from '@/shared/types/container';
// import type { DashboardContainerDetail } from '@/entities/container/model/types';

import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';
import { useDashboardDetailWebSocket } from '@/features/dashboard/hooks/useDashboardDetailWebSocket';
import {
  mapContainersToDashboardCards,
  aggregateContainerStates,
  aggregateHealthyStats,
} from '@/features/dashboard/lib/containerMapper';
import { mapToDetailPanel } from '@/features/dashboard/lib/detailPanelMapper';
import { mergeDashboardDetailAPIs } from '@/features/dashboard/lib/dashboardDetailRestMapper';
import { dashboardApi } from '@/shared/api/dashboard';
import { useContainerStore } from '@/shared/stores/useContainerStore';

// REST → WebSocket DTO 변환 (초기 로드용)
import { mapDashboardRestToWebSocket } from '@/features/dashboard/lib/dashboardRestMapper';
// import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

export const DashboardPage = () => {
  // ============================================
  // WebSocket 연결 및 실시간 데이터
  // - WebSocket으로만 데이터 수신
  // - 프론트엔드에서 정렬/필터 적용
  // ============================================
  const { status, error, isConnected, containers } = useDashboardWebSocket();

  // Store에서 필요한 상태와 액션 가져오기
  const updateContainer = useContainerStore((state) => state.updateContainer);
  const getSortedAndFilteredData = useContainerStore((state) => state.getSortedAndFilteredData);
  const setContainers = useContainerStore((state) => state.setContainers);

  // ============================================
  // [주석 처리] REST API fallback 관련 상태
  // ============================================
  // const isConnectionFailed = useWebSocketStore((state) => state.isConnectionFailed);
  // const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    quickFilters: [
      { id: 'favorite', label: 'Favorite', checked: false },
      { id: 'all', label: 'All Containers', checked: true }, // 기본 선택
    ],
    agentName: [],
    state: [],
    health: [],
    favoriteOnly: false
  });

  // 정렬 옵션 state (부모에서 관리, DashboardContainerList에 전달)
  const [sortBy, setSortBy] = useState<'favorite' | 'name' | 'cpu' | 'memory'>('favorite');

  // 선택된 컨테이너의 상세 정보 구독 (동적)
  const selectedContainerIdNumber = useMemo(() => {
    if (!selectedContainerId) {
      return null;
    }
    return Number(selectedContainerId);
  }, [selectedContainerId]);

  // Detail WebSocket: 선택된 컨테이너만 상세 구독 (time-series 데이터 수신)
  useDashboardDetailWebSocket(selectedContainerIdNumber);

  // selectedContainerDetail을 useMemo로 reactive하게 계산
  // Store의 containers가 업데이트될 때마다 자동으로 재계산됨
  const selectedContainerDetail = useMemo(() => {
    if (!selectedContainerId) return null;

    const containerDTO = containers.find(
      c => c.container.containerId === Number(selectedContainerId)
    );

    return containerDTO ? mapToDetailPanel(containerDTO) : null;
  }, [containers, selectedContainerId]);

  // ============================================
  // 초기 REST API 로드 (Favorite 정보 포함)
  // ============================================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // console.log('[DashboardPage] 초기 REST API 호출 시작...');
        const items = await dashboardApi.getContainers();
        // console.log('[DashboardPage] REST API 응답:', items);

        const filteredItems = items.filter(item => {
          const state = item.state?.toUpperCase();
          return state !== 'DELETED' && state !== 'UNKNOWN';
        });

        const dashboardData = filteredItems.map(mapDashboardRestToWebSocket);
        setContainers(dashboardData);
      } catch (err) {
        console.error('[DashboardPage] 초기 REST API 실패:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadInitialData();
  }, [setContainers]);

  // ============================================
  // [주석 처리] WebSocket 실패 시 REST polling
  // ============================================
  /*
  useEffect(() => {
    if (isConnectionFailed) {
      pollingIntervalRef.current = setInterval(() => {
        loadContainersFromRest();
      }, 5000);
    } else if (isConnected) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isConnectionFailed, isConnected]);
  */

  // ============================================
  // 프론트엔드 정렬/필터 적용
  // - WebSocket에서 받은 데이터를 Store의 getSortedAndFilteredData로 처리
  // - containers를 dependency에 추가하여 Store 변경 시 재계산
  // ============================================
  const sortedAndFilteredContainers = useMemo(() => {
    return getSortedAndFilteredData(sortBy, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSortedAndFilteredData, sortBy, filters, containers]);

  // WebSocket 데이터를 Dashboard 카드 타입으로 변환
  const dashboardContainers = useMemo(() => {
    return mapContainersToDashboardCards(sortedAndFilteredContainers);
  }, [sortedAndFilteredContainers]);

  // 통계 집계용 (필터 적용 전 전체 데이터)
  const validContainers = useMemo(() => {
    return containers.filter(c => {
      const state = c.container.state?.toUpperCase();
      return state !== 'DELETED' && state !== 'UNKNOWN';
    });
  }, [containers]);

  // State별 통계 집계 (ContainerStateCard용)
  const containerStats = useMemo(() => {
    return aggregateContainerStates(validContainers);
  }, [validContainers]);

  // Healthy별 통계 집계 (HealthyStatusCard용)
  const healthyStats = useMemo(() => {
    return aggregateHealthyStats(validContainers);
  }, [validContainers]);

  // WebSocket 상태 로그
  useEffect(() => {
    // console.log('[DashboardPage] WebSocket 상태:', { status, isConnected, containerCount: containers.length });
    if (error) {
      // console.error('[DashboardPage] WebSocket Error:', error);
    }
  }, [status, isConnected, containers.length, error]);

  // debounce 적용 (빠른 클릭 시 불필요한 구독 방지)
  const handleSelectContainer = useMemo(
    () =>
      debounce(async (id: string) => {
        setSelectedContainerId(id);

        // containerId 가져오기
        const containerId = Number(id);

        // REST API 3개 병렬 호출 (초기 1분 시계열 데이터)
        try {
          const [metricsData, networkData, blockIOData] = await Promise.all([
            dashboardApi.getContainerMetrics(containerId),
            dashboardApi.getNetworkStats(containerId, 'ONE_MINUTES', true),
            dashboardApi.getBlockIOStats(containerId, 'ONE_MINUTES', true),
          ]);

          // 응답 병합
          const mergedData = mergeDashboardDetailAPIs(metricsData, networkData, blockIOData);

          // Store 업데이트 (WebSocket 데이터와 Deep Merge)
          // selectedContainerDetail은 useMemo로 자동 재계산됨
          updateContainer(mergedData);

        } catch (err) {
          console.error('[DashboardPage] Failed to fetch detail data:', err);
          // Fallback: Store/WebSocket 데이터 계속 사용
        }
      }, 100),
    [updateContainer]
  );

  // 첫 번째 컨테이너 자동 선택 (페이지 로드 시)
  useEffect(() => {
    if (!selectedContainerId && dashboardContainers.length > 0) {
      const first = dashboardContainers[0];
      handleSelectContainer(first.id);
    }
  }, [selectedContainerId, dashboardContainers, handleSelectContainer]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // 사용 가능한 필터 옵션들 (전체 데이터 기반)
  const availableAgents = useMemo(
    () => Array.from(new Set(validContainers.map(c => c.container.agentName))).filter(a => a).sort(),
    [validContainers]
  );
  const availableStates = useMemo(
    () => Array.from(new Set(validContainers.map(c => c.container.state))).filter(s => s).sort(),
    [validContainers]
  );
  const availableHealths = useMemo(
    () => Array.from(new Set(validContainers.map(c => c.container.health))).filter(h => h).sort(),
    [validContainers]
  );

  // 필터 항목별 개수 계산
  const filterCounts = useMemo(() => {
    const agents: Record<string, number> = {};
    const states: Record<string, number> = {};
    const healths: Record<string, number> = {};

    validContainers.forEach(c => {
      // Agent Name 개수
      const agentName = c.container.agentName;
      if (agentName) {
        agents[agentName] = (agents[agentName] || 0) + 1;
      }

      // State 개수
      const state = c.container.state;
      if (state) {
        states[state] = (states[state] || 0) + 1;
      }

      // Health 개수
      const health = c.container.health;
      if (health) {
        healths[health] = (healths[health] || 0) + 1;
      }
    });

    return { agents, states, healths };
  }, [validContainers]);

  // 로딩 상태: 초기 REST API 로드 중일 때
  const isLoading = isInitialLoading;

  return (
    <div className="w-full flex justify-center">
      {/* 고정된 너비의 컨테이너로 전체 레이아웃을 감싸서 확대/축소 시 하나의 단위로 동작 */}
      <div className="w-[1920px]">
        <div className="flex gap-5 pt-6 pb-[41px]">
          {/* 왼쪽 - 메인 영역 */}
          <div className="w-[997px] flex flex-col">
            <div className="pl-[60px]">
              {/* 상단 상태 카드 */}
              <div className="flex gap-4 mb-6">
                <ContainerStateCard stats={containerStats} />
                <HealthyStatusCard stats={healthyStats} />
              </div>

              {/* 로딩 상태 표시 */}
              {isLoading ? (
                <div className="bg-white rounded-lg border border-gray-300 p-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-text-secondary">
                      <p className="font-medium">컨테이너 데이터를 불러오는 중...</p>
                      <p className="text-sm text-text-secondary mt-1">
                        WebSocket 연결 중...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* 컨테이너 리스트 */
                <DashboardContainerList
                  containers={dashboardContainers}
                  onFilterClick={() => setIsFiltersOpen(true)}
                  selectedIds={selectedContainerId ? [selectedContainerId] : []}
                  onToggleSelect={handleSelectContainer}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              )}
            </div>
          </div>

          {/* 오른쪽 - 상세 패널 */}
          {selectedContainerDetail && selectedContainerId && (
            <div className="w-[871px] flex-shrink-0 pr-8">
              <DashboardDetailPanel
                container={selectedContainerDetail}
                listCpuPercent={
                  dashboardContainers.find(c => c.id === selectedContainerId)?.cpu
                }
                listMemoryPercent={
                  dashboardContainers.find(c => c.id === selectedContainerId)?.memory
                }
                onClose={() => {
                  setSelectedContainerId(null);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 필터 모달 */}
      <FilterModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        availableAgents={availableAgents}
        availableStates={availableStates}
        availableHealths={availableHealths}
        filterCounts={filterCounts}
      />
    </div>
  );
};
