import React, { useState, useMemo, useEffect } from 'react';
import { ContainerTable } from '@/widgets/ContainerTable';
import type { ContainerData } from '@/shared/types/container';
import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { mapWithFavorites, mapToContainerData } from '@/features/container/lib/containerMapper';
import { containerApi } from '@/shared/api/container';

// 각 탭 컴포넌트 import
import CPUTab from '@/widgets/MetricsTables/CPUTab/CPUTab';
import MemoryTab from '@/widgets/MetricsTables/MemoryTab/MemoryTab';
import NetworkTab from '@/widgets/MetricsTables/NetworkTab/NetworkTab';
import LogsTab from '@/widgets/MetricsTables/EventsTab/EventsTab';

export const ContainersPage: React.FC = () => {
  // WebSocket 연결 및 일시정지 기능
  const { isPaused, togglePause, isConnected, status } = useDashboardWebSocket();

  // Store에서 실시간 컨테이너 데이터 가져오기
  const isPausedStore = useContainerStore((state) => state.isPaused);
  const containers = useContainerStore((state) => state.containers);
  const pausedData = useContainerStore((state) => state.pausedData);
  const setContainers = useContainerStore((state) => state.setContainers);

  // 화면에 표시할 데이터 (일시정지 시 pausedData, 아니면 containers)
  const displayContainers = isPausedStore ? pausedData : containers;

  // 초기 데이터 로드 상태
  const [initialLoading, setInitialLoading] = useState(true);

  // 초기 데이터 로드 (REST API)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        console.log('[ContainersPage] Loading initial data from REST API...');

        // REST API로 전체 컨테이너 목록 가져오기
        const summaries = await containerApi.getContainers();

        console.log('[ContainersPage] Loaded containers:', summaries.length);

        // ContainerSummaryDTO를 ContainerDashboardResponseDTO 형태로 변환
        // (WebSocket 형태와 동일하게 만들기)
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
        console.error('[ContainersPage] Failed to load initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []); // 최초 1회만 실행

  // 디버깅 로그
  useEffect(() => {
    console.log('[ContainersPage] WebSocket Status:', status);
    console.log('[ContainersPage] Connected:', isConnected);
    console.log('[ContainersPage] Containers Count:', containers.length);
    console.log('[ContainersPage] Display Count:', displayContainers.length);
    console.log('[ContainersPage] Containers Data:', containers);
  }, [status, isConnected, containers, displayContainers]);

  // 즐겨찾기 상태 로컬 관리
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'cpu' | 'memory' | 'network' | 'logs'>('cpu');
  const [checkedContainerIds, setCheckedContainerIds] = useState<string[]>([]);

  // WebSocket 데이터를 UI 타입으로 변환 (즐겨찾기 포함)
  const data = useMemo(() => {
    console.log('[ContainersPage] Mapping containers:', displayContainers.length);
    return mapWithFavorites(displayContainers, favoriteIds);
  }, [displayContainers, favoriteIds]);

  // 로딩 상태 - 초기 로드 또는 데이터 없음
  const isLoading = initialLoading || containers.length === 0;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* 상단: 컨테이너 테이블 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
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
                  className={`px-6 py-3 text-sm font-semibold relative ${
                    activeTab === tab ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  {tab.toUpperCase()}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {/* 실시간 보기 토글 (WebSocket 일시정지 기능과 연동) */}
            <div className="flex items-center gap-2 py-3">
              <span className="text-sm text-gray-600">실시간 보기</span>
              <button
                onClick={togglePause}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  !isPaused ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                title={isPaused ? '실시간 데이터 수신 중지됨' : '실시간 데이터 수신 중'}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  !isPaused ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div>
            {activeTab === 'cpu' && <CPUTab selectedContainers={selectedContainers} />}
            {activeTab === 'memory' && <MemoryTab selectedContainers={selectedContainers} />}
            {activeTab === 'network' && <NetworkTab selectedContainers={selectedContainers} />}
            {activeTab === 'logs' && <LogsTab selectedContainers={selectedContainers} />}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContainersPage;
