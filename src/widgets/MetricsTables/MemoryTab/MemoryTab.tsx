import React, { useMemo, useEffect } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { MemoryCard } from '@/entities/memory/ui/MemoryCard';
import { MemoryStatsTable } from './ui/MemoryStatsTable';
import { MemoryTrendChart } from './ui/MemoryTrendChart';
// import { OOMKillsChart } from './ui/OOMKillsChart';
import { MemoryHistoryChart } from './ui/MemoryHistoryChart';


interface MemoryTabProps {
  selectedContainers: ContainerData[];
  initialMetricsMap: Map<number, MetricDetail>;
  metricsMap: Map<number, MetricDetail>;
}

const MemoryTab: React.FC<MemoryTabProps> = ({ selectedContainers, initialMetricsMap, metricsMap }) => {
  // initialMetricsMap 디버깅
  useEffect(() => {
    // console.log('[MemoryTab] Received initialMetricsMap:', {
    //   size: initialMetricsMap.size,
    //   containerIds: Array.from(initialMetricsMap.keys()),
    // });
    void initialMetricsMap;
  }, [initialMetricsMap]);

  // metricsMap과 initialMetricsMap을 병합하여 완전한 메트릭 추출
  // - metricsMap (WebSocket): current values, 실시간 데이터
  // - initialMetricsMap (REST API): time series + summary 통계 데이터
  const selectedMetrics = useMemo(() => {
    if (selectedContainers.length === 0) return [];

    const metrics: MetricDetail[] = [];
    selectedContainers.forEach((container) => {
      const id = Number(container.id);
      const liveMetric = metricsMap.get(id);        // WebSocket: current values
      const initialMetric = initialMetricsMap.get(id); // REST API: summary + time series

      // WebSocket 데이터가 없으면 건너뛰기 (실시간 연결 필요)
      if (!liveMetric) return;

      // WebSocket 데이터를 기본으로 하되, REST API의 summary와 time series 병합
      const mergedMetric: MetricDetail = {
        ...liveMetric,
        cpu: {
          ...liveMetric.cpu,
          summary: initialMetric?.cpu?.summary || liveMetric.cpu?.summary,
          cpuPercent: initialMetric?.cpu?.cpuPercent || [],
          cpuCoreUsage: initialMetric?.cpu?.cpuCoreUsage || [],
        },
        memory: {
          ...liveMetric.memory,
          // REST API summary 우선 사용 (WebSocket은 summary가 제거됨)
          summary: initialMetric?.memory?.summary || liveMetric.memory?.summary,
          // REST API time series 보존 (차트용)
          memoryUsage: initialMetric?.memory?.memoryUsage || [],
        },
        network: {
          ...liveMetric.network,
          summary: initialMetric?.network?.summary || liveMetric.network?.summary,
          rxBytesPerSec: initialMetric?.network?.rxBytesPerSec || [],
          txBytesPerSec: initialMetric?.network?.txBytesPerSec || [],
        },
      };

      metrics.push(mergedMetric);
    });

    // console.log('[MemoryTab] Merged metrics:', {
    //   count: metrics.length,
    //   sample: metrics[0] ? {
    //     container: metrics[0].container.containerName,
    //     hasMemorySummary: !!metrics[0].memory?.summary,
    //     summaryValues: metrics[0].memory?.summary,
    //     memoryUsageLength: metrics[0].memory?.memoryUsage?.length || 0,
    //   } : null,
    // });

    return metrics;
  }, [selectedContainers, metricsMap, initialMetricsMap]);

  // Memory Cards 데이터
  const memoryCards = useMemo(() => {
    return selectedMetrics.map((dto) => {
      const usagePercent = Number((dto.memory.currentMemoryPercent || 0).toFixed(1));
      const status = usagePercent >= 90 ? 'critical' : usagePercent >= 70 ? 'warning' : 'healthy';

      return {
        id: String(dto.container.containerId),
        name: dto.container.containerName || 'Unknown',
        status: status as 'healthy' | 'warning' | 'critical',
        usagePercent,
        usage: dto.memory.currentMemoryUsage || 0, // bytes
        limit: dto.memory.memLimit || 0, // bytes
      };
    });
  }, [selectedMetrics]);

  if (selectedContainers.length === 0) {
    return (
      <div className="memory-empty-state py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">💾</div>
        <h3 className="text-xl font-semibold text-text-secondary mb-2">컨테이너를 선택해주세요</h3>
        <p className="text-text-secondary">상단 테이블에서 체크박스를 선택하면 메모리 메트릭이 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="memory-tab-container py-4">
      {/* Info Badge */}
      {/* <div className="memory-selection-info mb-4 p-3 bg-blue-50 border-l-4 border-state-running rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{selectedContainers.length}개 컨테이너</span> 메모리 메트릭 표시 중
        </p>
      </div> */}

      {/* Memory Cards Overview */}
      <section className="memory-overview-section bg-gray-100 rounded-xl border border-gray-300 p-6 mb-4">
        <h2 className="text-text-primary font-pretendard font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
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
      <div className="flex gap-4 mt-4">
        <MemoryTrendChart selectedContainers={selectedContainers} initialMetricsMap={initialMetricsMap} metricsMap={metricsMap} />
        {/* <OOMKillsChart selectedContainers={selectedContainers} metricsMap={metricsMap} /> */}
      </div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <MemoryTrendChart selectedContainers={selectedContainers} initialMetricsMap={initialMetricsMap} metricsMap={metricsMap} />
        <OOMKillsChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
      </div> */}


      {/* Memory History Chart (Time Range) */}
      <div className="flex gap-4 mt-4">
        <MemoryHistoryChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
      </div>
    </div>
  );
};

export default MemoryTab;