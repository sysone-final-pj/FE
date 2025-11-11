/********************************************************************************************
 * 🧩 CPUTab.tsx (Main Layout)
 ********************************************************************************************/
import { useMemo } from 'react';
import type { ContainerData } from '@/shared/types/container';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { CurrentCPUTable } from './ui/CurrentCPUTable';
import { CPUStatsTable } from './ui/CPUStatsTable';
import { CPUModeChart } from './ui/CPUModeChart';
import { CPUTrendChart } from './ui/CPUTrendChart';
import { CPUCard } from './ui/CPUCard';

interface CPUTabProps {
  selectedContainers: ContainerData[];
}

export const CPUTab: React.FC<CPUTabProps> = ({ selectedContainers }) => {
  const getDisplayData = useContainerStore((s) => s.getDisplayData);
  const allData = getDisplayData();

  const selectedMetrics = useMemo(() => {
    if (selectedContainers.length === 0) return allData.slice(0, 1);
    const selectedIds = new Set(selectedContainers.map((c) => Number(c.id)));
    return allData.filter((dto) => selectedIds.has(dto.containerId));
  }, [allData, selectedContainers]);

  const cpuCards = useMemo(() => {
    return selectedMetrics.map((dto) => ({
      id: String(dto.containerId),
      name: dto.containerName ?? 'Unknown',
      cpuPercent: Number((dto.cpuPercent ?? 0).toFixed(1)),
      cores: dto.onlineCpus ?? 0,
      quota: dto.cpuQuota > 0 ? dto.cpuQuota : undefined,
      throttled:
        dto.throttledPeriods && dto.throttlingPeriods
          ? ((dto.throttledPeriods / dto.throttlingPeriods) * 100).toFixed(1)
          : '0',
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
          <CPUStatsTable />
        </div>
        <div className="flex gap-4">
          <CPUModeChart selectedMetrics={selectedMetrics} />
          <CPUTrendChart selectedMetrics={selectedMetrics} />
        </div>
      </div>
    </div>
  );
};
export default CPUTab;;
