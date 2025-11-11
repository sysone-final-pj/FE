import { useEffect, useState, useMemo } from 'react';
import { ContainerStateCard } from '@/entities/container/ui/DashboardStateCard';
import { HealthyStatusCard } from '@/entities/container/ui/DashboardHealthyCard';
import { DashboardContainerList } from '@/widgets/DashboardContainerList';
import { FilterModal } from '@/shared/ui/FilterModal/FilterModal';
import { DashboardDetailPanel } from '@/widgets/DashboardDetailPanel';
import { DashboardNetworkChart } from './DashboardNetworkChart';
import { DashboardBlockIOChart } from './DashboardBlockIOChart';
import {
  MOCK_CONTAINER_DETAILS,
} from '@/shared/mocks/dashboardData';
import type { FilterState } from '@/shared/types/container';
import type { DashboardContainerDetail } from '@/entities/container/model/types';

import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';
import {
  mapContainersToDashboardCards,
  aggregateContainerStates,
  aggregateHealthyStats,
} from '@/features/dashboard/lib/containerMapper';
import { mapToDetailPanel } from '@/features/dashboard/lib/detailPanelMapper';
import { containerApi } from '@/shared/api/container';
import { useContainerStore } from '@/shared/stores/useContainerStore';


export const DashboardPage = () => {
  // WebSocket 연결 및 실시간 데이터
  const { status, error, isConnected, containers, isPaused, togglePause } = useDashboardWebSocket();

  // Store에서 setContainers 가져오기 (초기 데이터 로드용)
  const setContainers = useContainerStore((state) => state.setContainers);

  // 초기 데이터 로드 상태
  const [initialLoading, setInitialLoading] = useState(true);

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

  // WebSocket 데이터를 Dashboard 카드 타입으로 변환
  const dashboardContainers = useMemo(() => {
    return mapContainersToDashboardCards(containers);
  }, [containers]);

  // State별 통계 집계 (ContainerStateCard용)
  const containerStats = useMemo(() => {
    return aggregateContainerStates(containers);
  }, [containers]);

  // Healthy별 통계 집계 (HealthyStatusCard용)
  const healthyStats = useMemo(() => {
    return aggregateHealthyStats(containers);
  }, [containers]);

  // 초기 데이터 로드 (REST API)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        console.log('[DashboardPage] Loading initial data from REST API...');

        // REST API로 전체 컨테이너 목록 가져오기
        const summaries = await containerApi.getContainers();

        console.log('[DashboardPage] Loaded containers:', summaries.length);

        // ContainerSummaryDTO를 ContainerDashboardResponseDTO 형태로 변환
        const containers = summaries.map((summary) => ({
          containerId: 0, // REST API에는 containerId가 없으므로 임시값
          containerHash: summary.containerHash,
          containerName: summary.containerName,
          agentId: 0,
          agentName: summary.agentName,
          state: summary.state,
          health: summary.health,
          imageName: '',
          imageSize: summary.imageSize,
          cpuPercent: Number(summary.cpuPercent),
          cpuCoreUsage: 0,
          cpuUsageTotal: 0,
          hostCpuUsageTotal: 0,
          cpuUser: 0,
          cpuSystem: 0,
          cpuQuota: 0,
          cpuPeriod: 0,
          onlineCpus: 0,
          throttlingPeriods: 0,
          throttledPeriods: 0,
          throttledTime: 0,
          memPercent: 0,
          memUsage: summary.memUsage,
          memLimit: summary.memLimit,
          memMaxUsage: 0,
          blkRead: 0,
          blkWrite: 0,
          blkReadPerSec: 0,
          blkWritePerSec: 0,
          rxBytes: 0,
          txBytes: 0,
          rxPackets: 0,
          txPackets: 0,
          networkTotalBytes: 0,
          rxBytesPerSec: summary.rxBytesPerSec,
          txBytesPerSec: summary.txBytesPerSec,
          rxPps: 0,
          txPps: 0,
          rxFailureRate: 0,
          txFailureRate: 0,
          rxErrors: 0,
          txErrors: 0,
          rxDropped: 0,
          txDropped: 0,
          sizeRw: 0,
          sizeRootFs: summary.sizeRootFs,
        }));

        // Store에 저장
        setContainers(containers as any);
      } catch (error) {
        console.error('[DashboardPage] Failed to load initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []); // 최초 1회만 실행

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
        const container = containers.find(ct => String(ct.containerId) === c.id);
        return container && filters.agentName.includes(container.agentName);
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
  }, [filters, dashboardContainers, containers]);

  useEffect(() => {
    if (!selectedContainerId && filteredContainers.length > 0) {
      const first = filteredContainers[0];
      setSelectedContainerId(first.id);

      // 실제 store 데이터로 detail panel 설정 (containerHash로 찾기)
      const containerDTO = containers.find(c => c.containerHash === first.id);
      if (containerDTO) {
        setSelectedContainerDetail(mapToDetailPanel(containerDTO));
      }
    }
  }, [selectedContainerId, filteredContainers, containers]);

  const handleSelectContainer = (id: string) => {
    setSelectedContainerId(id);

    // 실제 store 데이터로 detail panel 설정 (containerHash로 찾기)
    const containerDTO = containers.find(c => c.containerHash === id);
    if (containerDTO) {
      setSelectedContainerDetail(mapToDetailPanel(containerDTO));
    } else {
      setSelectedContainerDetail(null);
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // 사용 가능한 필터 옵션들
  const availableAgents = useMemo(
    () => Array.from(new Set(containers.map(c => c.agentName))).sort(),
    [containers]
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
    <div className="w-full bg-[#f8f8fa] flex justify-center">
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

              {/* 차트 영역 */}
              {!isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <DashboardNetworkChart />
                  <DashboardBlockIOChart />
                </div>
              )}

              {/* 로딩 상태 표시 */}
              {isLoading ? (
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
