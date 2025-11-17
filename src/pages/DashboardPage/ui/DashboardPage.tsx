import { useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { ContainerStateCard } from '@/entities/container/ui/DashboardStateCard';
import { HealthyStatusCard } from '@/entities/container/ui/DashboardHealthyCard';
import { DashboardContainerList } from '@/widgets/DashboardContainerList';
import { FilterModal } from '@/shared/ui/FilterModal/FilterModal';
import { DashboardDetailPanel } from '@/widgets/DashboardDetailPanel';

import type { FilterState } from '@/shared/types/container';
import type { DashboardContainerDetail } from '@/entities/container/model/types';

import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';
import { useDashboardDetailWebSocket } from '@/features/dashboard/hooks/useDashboardDetailWebSocket';
import {
  mapContainersToDashboardCards,
  aggregateContainerStates,
  aggregateHealthyStats,
} from '@/features/dashboard/lib/containerMapper';
import { mapToDetailPanel } from '@/features/dashboard/lib/detailPanelMapper';
import { mapDashboardRestToWebSocket } from '@/features/dashboard/lib/dashboardRestMapper';
import { mergeDashboardDetailAPIs } from '@/features/dashboard/lib/dashboardDetailRestMapper';
import { buildDashboardParams } from '@/features/dashboard/lib/filterMapper';
import { dashboardApi } from '@/shared/api/dashboard';
import { useContainerStore } from '@/shared/stores/useContainerStore';



export const DashboardPage = () => {
  // WebSocket 연결 및 실시간 데이터
  const { status, error, isConnected, containers } = useDashboardWebSocket();

  // Store에서 setContainers, updateContainer 가져오기
  const setContainers = useContainerStore((state) => state.setContainers);
  const updateContainer = useContainerStore((state) => state.updateContainer);

  // 초기 데이터 로드 상태
  const [initialLoading, setInitialLoading] = useState(true);
  const [_detailLoading, setDetailLoading] = useState(false);

  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [selectedContainerDetail, setSelectedContainerDetail] =
    useState<DashboardContainerDetail | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    quickFilters: [
      { id: 'favorite', label: 'Favorite', checked: false },
      { id: 'all', label: 'All Containers', checked: false },
    ],
    agentName: [],
    state: [],
    health: [],
    favoriteOnly: false
  });

  // 정렬 옵션 state (부모에서 관리, DashboardContainerList에 전달)
  const [sortBy, setSortBy] = useState<'favorite' | 'name' | 'cpu' | 'memory'>('favorite');

  // 선택된 컨테이너의 상세 정보 구독 (동적)
  // containerId(string)를 containerId(number)로 변환
  const selectedContainerIdNumber = useMemo(() => {
    if (!selectedContainerId) {
      console.log('[DashboardPage] 🔍 No container selected');
      return null;
    }
    const containerId = Number(selectedContainerId);
    console.log('[DashboardPage] 🔍 Container ID conversion:', {
      selectedContainerId,
      containerId,
    });
    return containerId;
  }, [selectedContainerId]);

  // Detail WebSocket: 선택된 컨테이너만 상세 구독 (time-series 데이터 수신)
  useDashboardDetailWebSocket(selectedContainerIdNumber);

  // 로그 최소화 (성능 최적화)

  // DELETED/UNKNOWN 제외한 컨테이너만 집계 (방어 로직)
  const validContainers = useMemo(() => {
    return containers.filter(c => {
      const state = c.container.state?.toUpperCase();
      return state !== 'DELETED' && state !== 'UNKNOWN';
    });
  }, [containers]);

  // WebSocket 데이터를 Dashboard 카드 타입으로 변환 (validContainers만 사용)
  const dashboardContainers = useMemo(() => {
    return mapContainersToDashboardCards(validContainers);
  }, [validContainers]);

  // State별 통계 집계 (ContainerStateCard용)
  const containerStats = useMemo(() => {
    return aggregateContainerStates(validContainers);
  }, [validContainers]);

  // Healthy별 통계 집계 (HealthyStatusCard용)
  const healthyStats = useMemo(() => {
    return aggregateHealthyStats(validContainers);
  }, [validContainers]);

  // 초기 데이터 로드 (REST API → WebSocket DTO 변환)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        console.log('[DashboardPage] Loading initial data from Dashboard REST API...');

        // 1. 필터/정렬 파라미터 생성
        const params = buildDashboardParams(filters, sortBy);
        console.log('[DashboardPage] API params:', params);

        // 2. Dashboard REST API 호출
        const items = await dashboardApi.getContainers(params);
        console.log('[DashboardPage] Loaded containers:', items.length);

        // ✅ 각 컨테이너의 state 상세 확인 (monito-frontend와 비교)
        items.forEach(item => {
          console.log(`[State Check] ${item.containerName}:`, {
            state: item.state,
            stateType: typeof item.state,
            health: item.health,
            isMonito: item.containerName === 'monito-frontend'
          });
        });

        // 3. DELETED/UNKNOWN 필터링 (UI에서 완전히 제외)
        const filteredItems = items.filter(item => {
          const state = item.state?.toUpperCase();
          return state !== 'DELETED' && state !== 'UNKNOWN';
        });
        console.log('[DashboardPage] Filtered containers:', filteredItems.length, '(excluded DELETED/UNKNOWN)');

        // 4. DTO 변환 (REST → WebSocket 구조)
        const dashboardData = filteredItems.map(mapDashboardRestToWebSocket);

        // 5. Store에 저장 (WebSocket과 같은 구조)
        setContainers(dashboardData);
      } catch (error) {
        console.error('[DashboardPage] REST API failed, using WebSocket data:', error);
        // Fallback: 기존 WebSocket 데이터 유지 (store 변경하지 않음)
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [filters, sortBy, setContainers]); // filters, sortBy 변경 시 재로드

  // WebSocket 상태 로그
  useEffect(() => {
    console.log('[DashboardPage] WebSocket Status:', status);
    console.log('[DashboardPage] Connected:', isConnected);
    console.log('[DashboardPage] Containers:', dashboardContainers);
    console.log('[DashboardPage] Container Stats:', containerStats);
    console.log('[DashboardPage] Healthy Stats:', healthyStats);
    if (error) {
      console.error('[DashboardPage] WebSocket Error:', error);
    }
  }, [status, isConnected, dashboardContainers, containerStats, healthyStats, error]);

  // 필터링된 컨테이너 리스트
  const filteredContainers = useMemo(() => {
    let result = [...dashboardContainers];

    // Quick Filters - Favorite
    const favoriteFilter = filters.quickFilters.find(f => f.id === 'favorite');
    if (favoriteFilter?.checked) {
      result = result.filter(c => c.isFavorite);
    }

    // Agent Name 필터
    if (filters.agentName.length > 0) {
      result = result.filter(c => {
        const container = validContainers.find(ct => String(ct.container.containerId) === c.id);
        return container && filters.agentName.includes(container.container.agentName);
      });
    }

    // State 필터
    if (filters.state.length > 0) {
      result = result.filter(c => {
        return filters.state.some(s => s.toLowerCase() === c.state.toLowerCase());
      });
    }

    // Health 필터
    if (filters.health.length > 0) {
      result = result.filter(c => {
        return filters.health.some(h => h.toLowerCase() === c.healthy.toLowerCase());
      });
    }

    return result;
  }, [filters, dashboardContainers, validContainers]);

  useEffect(() => {
    if (!selectedContainerId && filteredContainers.length > 0) {
      const first = filteredContainers[0];
      setSelectedContainerId(first.id);

      // 실제 store 데이터로 detail panel 설정 (containerId로 찾기)
      const containerDTO = validContainers.find(c => c.container.containerId === Number(first.id));
      if (containerDTO) {
        setSelectedContainerDetail(mapToDetailPanel(containerDTO));
      }
    }
  }, [selectedContainerId, filteredContainers, validContainers]);

  // debounce 적용 (빠른 클릭 시 불필요한 구독 방지)
  const handleSelectContainer = useMemo(
    () =>
      debounce(async (id: string) => {
        setSelectedContainerId(id);

        // 실제 store 데이터로 detail panel 설정 (containerId로 찾기)
        const containerDTO = validContainers.find(c => c.container.containerId === Number(id));
        if (!containerDTO) {
          setSelectedContainerDetail(null);
          return;
        }

        // 1. Store 데이터로 즉시 표시 (빠른 반응)
        setSelectedContainerDetail(mapToDetailPanel(containerDTO));

        // 2. containerId 가져오기 (이미 number로 변환됨)
        const containerId = Number(id);

        // 3. REST API 3개 병렬 호출 (초기 1분 시계열 데이터)
        try {
          setDetailLoading(true);

          const [metricsData, networkData, blockIOData] = await Promise.all([
            dashboardApi.getContainerMetrics(containerId),
            dashboardApi.getNetworkStats(containerId),  // 백엔드 기본값 사용 (timeRange 파라미터 제거)
            dashboardApi.getBlockIOStats(containerId),  // 백엔드 기본값 사용
          ]);

          console.log('[DashboardPage] 📊 REST API responses:', {
            metricsData,
            networkData,
            blockIOData,
          });

          console.log('[DashboardPage] 🔎 REST API dataPoints 확인:', {
            networkDataPoints: networkData?.dataPoints?.length ?? 0,
            networkSample: networkData?.dataPoints?.[0],
            blockIODataPoints: blockIOData?.dataPoints?.length ?? 0,
            blockIOSample: blockIOData?.dataPoints?.[0],
          });

          // 4. 응답 병합
          const mergedData = mergeDashboardDetailAPIs(metricsData, networkData, blockIOData);

          console.log('[DashboardPage] 🔀 Merged data:', {
            containerId: mergedData.container.containerId,
            containerHash: mergedData.container.containerHash,
            rxTimeSeries: mergedData.network?.rxBytesPerSec?.length,
            txTimeSeries: mergedData.network?.txBytesPerSec?.length,
            rxSample: mergedData.network?.rxBytesPerSec?.[0],
            txSample: mergedData.network?.txBytesPerSec?.[0],
            blkReadTimeSeries: mergedData.blockIO?.blkReadPerSec?.length,
            blkWriteTimeSeries: mergedData.blockIO?.blkWritePerSec?.length,
          });

          // 5. Store 업데이트 (WebSocket 데이터와 Deep Merge)
          updateContainer(mergedData);

          // 6. Detail Panel 재렌더링
          setSelectedContainerDetail(mapToDetailPanel(mergedData));

          console.log('[DashboardPage] ✅ Detail data loaded and store updated');
        } catch (error) {
          console.error('[DashboardPage] ❌ Failed to fetch detail data:', error);
          // Fallback: Store/WebSocket 데이터 계속 사용
        } finally {
          setDetailLoading(false);
        }
      }, 100), // 100ms - 사용자가 체감하지 못하는 수준
    [validContainers, updateContainer]
  );

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // 사용 가능한 필터 옵션들
  const availableAgents = useMemo(
    () => Array.from(new Set(validContainers.map(c => c.container.agentName))).sort(),
    [validContainers]
  );
  const availableStates = useMemo(
    () => Array.from(new Set(dashboardContainers.map(c => c.state))).sort(),
    [dashboardContainers]
  );
  const availableHealths = useMemo(
    () => Array.from(new Set(dashboardContainers.map(c => c.healthy))).sort(),
    [dashboardContainers]
  );

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
              {initialLoading  ? (
                <div className="bg-white rounded-lg border border-gray-300 p-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-600">
                      <p className="font-medium">컨테이너 데이터를 불러오는 중...</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {!isConnected ? 'WebSocket 연결 중...' : '데이터 수신 대기 중...'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* 컨테이너 리스트 */
                <DashboardContainerList
                  containers={filteredContainers}
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
      <FilterModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        availableAgents={availableAgents}
        availableStates={availableStates}
        availableHealths={availableHealths}
      />
    </div>
  );
};
