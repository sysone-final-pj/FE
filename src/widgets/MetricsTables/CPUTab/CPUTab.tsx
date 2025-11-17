/********************************************************************************************
 * 🧩 CPUTab.tsx (Main Layout)
 ********************************************************************************************/
import { useMemo } from 'react';
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
  metricsMap: Map<number, MetricDetail>;
}

export const CPUTab: React.FC<CPUTabProps> = ({ selectedContainers, metricsMap }) => {
  // metricsMap에서 선택된 컨테이너의 메트릭 추출
  const selectedMetrics = useMemo(() => {
    if (selectedContainers.length === 0) return [];

    const metrics: MetricDetail[] = [];
    selectedContainers.forEach((container) => {
      const metric = metricsMap.get(Number(container.id));
      if (metric) {
        metrics.push(metric);
      }
    });

    return metrics;
  }, [selectedContainers, metricsMap]);

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
          <CPUTrendChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
        </div>
        <div className="flex gap-4">
          <CPUHistoryChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
        </div>
      </div>
    </div>
  );
};
export default CPUTab;;
