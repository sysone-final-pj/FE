/********************************************************************************************
 * 🧩 CPUTab.tsx (Main Layout)
 ********************************************************************************************/
import { useMemo, useEffect } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { CurrentCPUTable } from './ui/CurrentCPUTable';
import { CPUStatsTable } from './ui/CPUStatsTable';
import { CPUModeChart } from './ui/CPUModeChart';
import { CPUTrendChart } from './ui/CPUTrendChart';
import { CPUHistoryChart } from './ui/CPUHistoryChart';
import { CPUCard } from './ui/CPUCard';

interface CPUTabProps {
  selectedContainers: ContainerData[];
  initialMetricsMap: Map<number, MetricDetail>;
  metricsMap: Map<number, MetricDetail>;
}

export const CPUTab: React.FC<CPUTabProps> = ({ selectedContainers, initialMetricsMap, metricsMap }) => {
  // initialMetricsMap 디버깅
  useEffect(() => {
    console.log('[CPUTab] Received initialMetricsMap:', {
      size: initialMetricsMap.size,
      containerIds: Array.from(initialMetricsMap.keys()),
    });
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
          // REST API summary 우선 사용 (WebSocket은 summary가 제거됨)
          summary: initialMetric?.cpu?.summary || liveMetric.cpu?.summary,
          // REST API time series 보존 (차트용)
          cpuPercent: initialMetric?.cpu?.cpuPercent || [],
          cpuCoreUsage: initialMetric?.cpu?.cpuCoreUsage || [],
        },
        memory: {
          ...liveMetric.memory,
          summary: initialMetric?.memory?.summary || liveMetric.memory?.summary,
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

    console.log('[CPUTab] Merged metrics:', {
      count: metrics.length,
      sample: metrics[0] ? {
        container: metrics[0].container.containerName,
        hasCpuSummary: !!metrics[0].cpu?.summary,
        summaryValues: metrics[0].cpu?.summary,
        cpuPercentLength: metrics[0].cpu?.cpuPercent?.length || 0,
      } : null,
    });

    return metrics;
  }, [selectedContainers, metricsMap, initialMetricsMap]);

  const cpuCards = useMemo(() => {
    return selectedMetrics.map((dto) => ({
      id: String(dto.container.containerId),
      name: dto.container.containerName ?? 'Unknown',
      cpuPercent: Number(
        (dto.cpu?.currentCpuPercent ?? dto.cpu?.summary?.current ?? 0).toFixed(1)
      ),
      request: dto.cpu?.cpuQuota ?? 0,
      limit: dto.cpu?.cpuPeriod ?? 0,
      core: dto.cpu?.cpuLimitCores ?? dto.cpu?.onlineCpus ?? 0,
      throttling: dto.cpu?.throttleRate
        ? `${dto.cpu.throttleRate.toFixed(1)}%`
        : dto.cpu?.throttledPeriods && dto.cpu?.throttlingPeriods
          ? `${((dto.cpu.throttledPeriods / dto.cpu.throttlingPeriods) * 100).toFixed(1)}%`
          : '0%',
    }));
  }, [selectedMetrics]);

  const cpuStats = useMemo(() => {
    return selectedMetrics.map((dto) => ({
      name: dto.container.containerName ?? 'Unknown',
      avg1min: dto.cpu?.summary?.avg1m ?? 0,
      avg5min: dto.cpu?.summary?.avg5m ?? 0,
      avg15min: dto.cpu?.summary?.avg15m ?? 0,
      p95: dto.cpu?.summary?.p95 ?? 0,
    }));
  }, [selectedMetrics]);


  return (
    <div className="py-4 px-10">
      {/* 선택된 컨테이너 안내 */}
      <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">
            {selectedContainers.length > 0
              ? `${selectedContainers.length} container(s)`
              : 'Default container'}
          </span>{' '}
          metrics displayed
        </p>
      </div>

      {/* CPUCard 목록 */}
      <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 mb-4">
        <h2 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
          Container CPU Overview
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cpuCards.map((c, i) => (
            <CPUCard key={`${c.id}-${i}`} data={c} />
          ))}
        </div>
      </section>

      {/* 테이블 및 차트 */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <CurrentCPUTable selectedMetrics={selectedMetrics} />
          <CPUStatsTable data={cpuStats} />
        </div>
        <div className="flex gap-4">
          <CPUModeChart selectedMetrics={selectedMetrics} />
          <CPUTrendChart selectedContainers={selectedContainers} initialMetricsMap={initialMetricsMap} metricsMap={metricsMap} />
        </div>
        <div className="flex gap-4">
          <CPUHistoryChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
        </div>
      </div>
    </div>
  );
};
export default CPUTab;;
