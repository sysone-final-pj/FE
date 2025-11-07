import React, { useState, useMemo } from 'react';
import { ContainerTable } from '@/widgets/ContainerTable';
import { mockContainerData } from '@/shared/mocks/containerData';
import type { ContainerData } from '@/shared/types/container';
import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';

// 각 탭 컴포넌트 import
import CPUTab from '@/widgets/MetricsTables/CPUTab/CPUTab';
import MemoryTab from '@/widgets/MetricsTables/MemoryTab/MemoryTab';
import NetworkTab from '@/widgets/MetricsTables/NetworkTab/NetworkTab';
import LogsTab from '@/widgets/MetricsTables/EventsTab/EventsTab';

export const ContainersPage: React.FC = () => {
  // WebSocket 연결 및 일시정지 기능
  const { isPaused, togglePause } = useDashboardWebSocket();

  const [data, setData] = useState<ContainerData[]>(mockContainerData);
  const [activeTab, setActiveTab] = useState<'cpu' | 'memory' | 'network' | 'logs'>('cpu');
  const [checkedContainerIds, setCheckedContainerIds] = useState<string[]>([]);

  // 체크된 컨테이너 정보 계산
  const selectedContainers = useMemo(() => {
    if (checkedContainerIds.length === 0) return data; // 아무것도 체크 안 하면 전체 표시
    return data.filter(container => checkedContainerIds.includes(container.id));
  }, [data, checkedContainerIds]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* 상단: 컨테이너 테이블 */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold mb-4 text-gray-800">Manage Containers</h1>
          <ContainerTable 
            containers={data} 
            onContainersChange={setData}
            checkedIds={checkedContainerIds}
            onCheckedIdsChange={setCheckedContainerIds}
          />
        </div>

        {/* 선택된 컨테이너 정보 */}
        {checkedContainerIds.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{checkedContainerIds.length}개 컨테이너 선택됨:</span>{' '}
              {selectedContainers.map(c => c.containerName).join(', ')}
            </p>
          </div>
        )}

        {/* 하단 탭 영역 */}
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
      </div>
    </div>
  );
};

export default ContainersPage;
