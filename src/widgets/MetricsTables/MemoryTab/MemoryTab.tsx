import React, { useMemo } from 'react';
import type { ContainerData } from '@/shared/types/container';
import { MemoryCard } from '@/entities/memory/ui/MemoryCard';
import { MemoryStatsTable } from './ui/MemoryStatsTable';
import { MemoryUsageChart } from './ui/MemoryUsageChart';
import { OOMKillsChart } from './ui/OOMKillsChart';
import { useContainerStore } from '@/shared/stores/useContainerStore';

const BYTES_TO_GB = 1024 ** 3;
const BYTES_TO_MB = 1024 ** 2;

const MemoryTab: React.FC<{ selectedContainers: ContainerData[] }> = ({ selectedContainers }) => {
  // Store에서 실시간 데이터 가져오기
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 선택된 컨테이너의 실시간 메트릭 데이터
  const selectedMetrics = useMemo(() => {
    const allData = getDisplayData();
    const selectedIds = new Set(selectedContainers.map((c) => Number(c.id)));
    return allData.filter((dto) => selectedIds.has(dto.containerId));
  }, [getDisplayData, selectedContainers]);

  // Memory Cards 데이터
  const memoryCards = useMemo(() => {
    return selectedMetrics.map((dto) => ({
      id: String(dto.containerId),
      name: dto.containerName || 'Unknown',
      usagePercent: Number((dto.memPercent || 0).toFixed(1)),
      usage: Number(((dto.memUsage || 0) / BYTES_TO_MB).toFixed(0)), // MB
      limit: Number(((dto.memLimit || 0) / BYTES_TO_MB).toFixed(0)), // MB
      rss: 0, // WebSocket 데이터에 없음
      cache: 0, // WebSocket 데이터에 없음
    }));
  }, [selectedMetrics]);

  if (selectedContainers.length === 0) {
    return (
      <div className="memory-empty-state py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">💾</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">컨테이너를 선택해주세요</h3>
        <p className="text-gray-500">상단 테이블에서 체크박스를 선택하면 메모리 메트릭이 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="memory-tab-container py-4">
      {/* Info Badge */}
      <div className="memory-selection-info mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{selectedContainers.length}개 컨테이너</span> 메모리 메트릭 표시 중
        </p>
      </div>

      {/* Memory Cards Overview */}
      <section className="memory-overview-section bg-gray-100 rounded-xl border border-gray-300 p-6 mb-4">
        <h2 className="text-gray-700 font-pretendard font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
          Container Memory Overview
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {memoryCards.map((data) => (
            <MemoryCard key={data.id} data={data} />
          ))}
        </div>
      </section>

      {/* Memory Stats Table */}
      <MemoryStatsTable data={memoryCards} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <MemoryUsageChart selectedContainers={selectedContainers} />
        <OOMKillsChart selectedContainers={selectedContainers} />
      </div>
    </div>
  );
};

export default MemoryTab;