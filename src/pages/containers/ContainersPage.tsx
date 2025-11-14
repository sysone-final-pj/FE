import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ContainerTable } from '@/widgets/ContainerTable';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { useContainersSummaryWebSocket } from '@/features/container/hooks/useContainersSummaryWebSocket';
import { useContainerMetricsWebSocket } from '@/features/container/hooks/useContainerMetricsWebSocket';
import { mapToContainerDataList } from '@/features/container/lib/manageMapper';
import { containerApi } from '@/shared/api/container';

// 각 탭 컴포넌트 import
import CPUTab from '@/widgets/MetricsTables/CPUTab/CPUTab';
import MemoryTab from '@/widgets/MetricsTables/MemoryTab/MemoryTab';
import NetworkTab from '@/widgets/MetricsTables/NetworkTab/NetworkTab';
import LogsTab from '@/widgets/MetricsTables/EventsTab/EventsTab';

export const ContainersPage: React.FC = () => {
  // WebSocket 연결 및 실시간 컨테이너 데이터 (우선순위)
  const { containers, setContainers, isConnected, status } = useContainersSummaryWebSocket();

  // REST API 백그라운드 로드 상태 (UI 블로킹하지 않음)
  const [restApiLoaded, setRestApiLoaded] = useState(false);

  // 실시간 보기 토글 상태
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [frozenContainers, setFrozenContainers] = useState<typeof containers>([]);
  const [frozenMetricsMap, setFrozenMetricsMap] = useState<Map<number, MetricDetail>>(new Map());

  // 백그라운드 REST API 로드 (WebSocket이 연결될 때까지의 초기 데이터 or 폴백)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('[ContainersPage] Background loading from REST API...');

        // 3번 API: Manage Container List 호출
        // TODO: manageContainerApi가 준비되면 교체 필요
        const summaries = await containerApi.getContainers();

        // WebSocket이 아직 데이터를 제공하지 않은 경우에만 사용
        if (containers.length === 0) {
          // ContainerSummaryDTO → ManageContainerListItem 변환 (임시)
          const items = summaries.map((s) => ({
            id: s.id ?? 0,
            agentName: s.agentName ?? '',
            containerHash: s.containerHash ?? '',
            containerName: s.containerName ?? '',
            cpuPercent: s.cpuPercent ?? 0,
            isCpuUnlimited: false,
            memUsage: s.memUsage ?? 0,
            memLimit: s.memLimit ?? 0,
            isMemoryUnlimited: false,
            memPercent: s.memLimit ? ((s.memUsage ?? 0) / s.memLimit) * 100 : 0,
            rxBytesPerSec: s.rxBytesPerSec ?? 0,
            txBytesPerSec: s.txBytesPerSec ?? 0,
            state: s.state ?? 'UNKNOWN',
            health: s.health ?? 'UNKNOWN',
            imageSize: s.imageSize ?? 0,
            sizeRootFs: 0,
            storageLimit: 0,
            isStorageUnlimited: false,
            isFavorite: false, // TODO: 즐겨찾기 기능 구현 필요
          }));

          console.log('[ContainersPage] REST API data used (WebSocket pending):', items.length);
          setContainers(items);
        } else {
          console.log('[ContainersPage] WebSocket data already available, skipping REST data');
        }

        setRestApiLoaded(true);
      } catch (error) {
        console.error('[ContainersPage] Failed to load containers from REST:', error);
        setRestApiLoaded(true); // Still mark as attempted
      }
    };

    loadInitialData();
  }, [setContainers]); // Remove containers dependency to avoid re-fetching 

  // 디버깅 로그
  useEffect(() => {
    console.log('[ContainersPage] WebSocket Status:', status);
    console.log('[ContainersPage] Connected:', isConnected);
    console.log('[ContainersPage] Containers Count:', containers.length);
  }, [status, isConnected, containers]);

  // 즐겨찾기 상태 로컬 관리
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'cpu' | 'memory' | 'network' | 'logs'>('cpu');
  const [checkedContainerIds, setCheckedContainerIds] = useState<string[]>([]);

  // 표시할 컨테이너 데이터 선택 (실시간 or frozen)
  const displayContainers = isRealTimeEnabled ? containers : frozenContainers;

  // ManageContainerListItem[] → ContainerData[] 변환
  const data = useMemo(() => {
    console.log('[ContainersPage] Mapping containers:', displayContainers.length);
    return mapToContainerDataList(displayContainers);
  }, [displayContainers]);

  // 로딩 상태 - 빈 화면 방지: WebSocket 또는 REST API 중 하나라도 데이터가 있으면 표시
  const isLoading = !restApiLoaded && containers.length === 0 && !isConnected;

  // 즐겨찾기 토글 핸들러
  const handleFavoriteToggle = (containerId: string) => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(containerId)) {
        newSet.delete(containerId);
      } else {
        newSet.add(containerId);
      }
      return newSet;
    });
  };

  // data가 변경될 때 isFavorite를 업데이트
  const dataWithFavorites = useMemo(() => {
    return data.map((container) => ({
      ...container,
      isFavorite: favoriteIds.has(container.id),
    }));
  }, [data, favoriteIds]);

  // 체크된 컨테이너 정보 계산
  const selectedContainers = useMemo(() => {
    if (checkedContainerIds.length === 0) return []; // 아무것도 체크 안 하면 빈 배열
    return dataWithFavorites.filter(container => checkedContainerIds.includes(container.id));
  }, [dataWithFavorites, checkedContainerIds]);

  // 선택된 컨테이너 ID 목록 추출 (숫자 ID로 변환)
  const selectedContainerIds = useMemo(() => {
    const ids = selectedContainers.map((c) => Number(c.id));
    console.log('[ContainersPage] Selected Container IDs:', {
      selectedContainers: selectedContainers.map(c => ({ id: c.id, name: c.containerName })),
      selectedContainerIds: ids,
    });
    return ids;
  }, [selectedContainers]);

  // 선택된 컨테이너들의 메트릭 상세 정보 구독
  const { metricsMap: liveMetricsMap, isConnected: metricsConnected } = useContainerMetricsWebSocket(selectedContainerIds);

  // 실시간 토글 핸들러
  const handleRealTimeToggle = useCallback(() => {
    if (isRealTimeEnabled) {
      // 실시간 → 일시정지: 현재 데이터를 스냅샷으로 저장
      setFrozenContainers(containers);
      setFrozenMetricsMap(new Map(liveMetricsMap)); // metricsMap도 스냅샷 저장
      setIsRealTimeEnabled(false);
      console.log('[ContainersPage] Paused - Frozen snapshot saved');
    } else {
      // 일시정지 → 실시간: frozen 데이터 초기화하고 최신 데이터 표시
      setFrozenContainers([]);
      setFrozenMetricsMap(new Map());
      setIsRealTimeEnabled(true);
      console.log('[ContainersPage] Resumed - Live data displayed');
    }
  }, [isRealTimeEnabled, containers, liveMetricsMap]);

  // 표시할 metricsMap 선택 (실시간 or frozen)
  const metricsMap = isRealTimeEnabled ? liveMetricsMap : frozenMetricsMap;

  // metricsMap 디버깅
  useEffect(() => {
    console.log('[ContainersPage] MetricsMap updated:', {
      size: metricsMap.size,
      keys: Array.from(metricsMap.keys()),
      metricsConnected,
      isRealTime: isRealTimeEnabled,
    });
  }, [metricsMap, metricsConnected, isRealTimeEnabled]);

  return (
    <div className="min-h-screen">
      <div className="px-[132px] pt-8">
        {/* 상단: 컨테이너 테이블 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 pl-2">
            <h1 className="text-xl font-semibold text-gray-800">Manage Containers</h1>
            {/* WebSocket 연결 상태 표시 */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? '실시간 연결됨' : 'WebSocket 연결 중...'}
              </span>
            </div>
          </div>

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
            <ContainerTable
              containers={dataWithFavorites}
              onToggleFavorite={handleFavoriteToggle}
              checkedIds={checkedContainerIds}
              onCheckedIdsChange={setCheckedContainerIds}
            />
          )}
        </div>

        {/* 선택된 컨테이너 정보 */}
        {!isLoading && checkedContainerIds.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{checkedContainerIds.length}개 컨테이너 선택됨:</span>{' '}
              {selectedContainers.map(c => c.containerName).join(', ')}
            </p>
          </div>
        )}

        {/* 하단 탭 영역 */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-10">
            {/* 탭 헤더 */}
            <div className="flex items-center justify-between border-b border-gray-200 mb-6">
              <div className="flex gap-2">
                {(['cpu', 'memory', 'network', 'logs'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-semibold relative ${activeTab === tab ? 'text-blue-500' : 'text-gray-400'
                      }`}
                  >
                    {tab.toUpperCase()}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* 실시간 보기 토글 & WebSocket 연결 상태 */}
              <div className="flex items-center gap-4 py-3">
                {/* 실시간 보기 토글 */}
                <button
                  onClick={handleRealTimeToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isRealTimeEnabled
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isRealTimeEnabled ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      실시간 보기
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      일시정지
                    </>
                  )}
                </button>

                {/* WebSocket 연결 상태 */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    {isConnected ? '실시간 연결됨' : 'WebSocket 연결 중...'}
                  </span>
                </div>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div>
              {activeTab === 'cpu' && <CPUTab selectedContainers={selectedContainers} metricsMap={metricsMap} />}
              {activeTab === 'memory' && <MemoryTab selectedContainers={selectedContainers} metricsMap={metricsMap} />}
              {activeTab === 'network' && <NetworkTab selectedContainers={selectedContainers} metricsMap={metricsMap} />}
              {activeTab === 'logs' && <LogsTab selectedContainers={selectedContainers} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContainersPage;
