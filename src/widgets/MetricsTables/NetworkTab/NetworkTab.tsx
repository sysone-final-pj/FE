import React, { useMemo } from 'react';
import type { ContainerData } from '@/shared/types/container';
import { NetworkCard } from '@/entities/network/ui/NetworkCard';
import { NetworkRxChart } from './ui/NetworkRxChart';
import { NetworkTxChart } from './ui/NetworkTxChart';
import { TrafficUsageChart } from './ui/TrafficUsageChart';
import { ErrorDropRateChart } from './ui/ErrorDropRateChart';
import { useContainerStore } from '@/shared/stores/useContainerStore';

const BYTES_TO_MB = 1024 ** 2;

const NetworkTab: React.FC<{ selectedContainers: ContainerData[] }> = ({ selectedContainers }) => {
  // Store에서 실시간 데이터 가져오기
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 선택된 컨테이너의 실시간 메트릭 데이터
  const selectedMetrics = useMemo(() => {
    const allData = getDisplayData();
    const selectedIds = new Set(selectedContainers.map((c) => Number(c.id)));
    return allData.filter((dto) => selectedIds.has(dto.containerId));
  }, [getDisplayData, selectedContainers]);

  // Network Cards 데이터
  const networkCards = useMemo(() => {
    return selectedMetrics.map((dto) => {
      const totalErrorRate =
        dto.rxPackets + dto.txPackets > 0
          ? (((dto.rxErrors + dto.txErrors) / (dto.rxPackets + dto.txPackets)) * 100).toFixed(2)
          : '0.00';

      const totalDropRate =
        dto.rxPackets + dto.txPackets > 0
          ? (((dto.rxDropped + dto.txDropped) / (dto.rxPackets + dto.txPackets)) * 100).toFixed(2)
          : '0.00';

      return {
        id: String(dto.containerId),
        name: dto.containerName,
        rxBytes: Number((dto.rxBytes / BYTES_TO_MB).toFixed(2)), // MB
        txBytes: Number((dto.txBytes / BYTES_TO_MB).toFixed(2)), // MB
        rxBytesPerSec: Number((dto.rxBytesPerSec / BYTES_TO_MB).toFixed(2)), // MB/s
        txBytesPerSec: Number((dto.txBytesPerSec / BYTES_TO_MB).toFixed(2)), // MB/s
        rxPackets: dto.rxPackets,
        txPackets: dto.txPackets,
        rxErrors: dto.rxErrors,
        txErrors: dto.txErrors,
        rxDropped: dto.rxDropped,
        txDropped: dto.txDropped,
        totalErrorRate: Number(totalErrorRate),
        totalDropRate: Number(totalDropRate),
      };
    });
  }, [selectedMetrics]);

  if (selectedContainers.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">🌐</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">컨테이너를 선택해주세요</h3>
        <p className="text-gray-500">상단 테이블에서 체크박스를 선택하면 네트워크 메트릭이 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Info Badge */}
      <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{selectedContainers.length}개 컨테이너</span> 네트워크 메트릭 표시 중
        </p>
      </div>

      {/* Network Cards Overview */}
      <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 mb-4">
        <h2 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
          Container Network Overview
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {networkCards.map((data) => (
            <NetworkCard key={data.id} data={data} />
          ))}
        </div>
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetworkRxChart />
        <NetworkTxChart />
        <TrafficUsageChart />
        <ErrorDropRateChart />
      </div>
    </div>
  );
};

export default NetworkTab;