import React, { useMemo } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { NetworkCard } from '@/entities/network/ui/NetworkCard';
import { NetworkRxChart } from './ui/NetworkRxChart';
import { NetworkTxChart } from './ui/NetworkTxChart';
import { TrafficUsageChart } from './ui/TrafficUsageChart';
import { ErrorDropRateChart } from './ui/ErrorDropRateChart';

const BYTES_TO_MB = 1024 ** 2;

interface NetworkTabProps {
  selectedContainers: ContainerData[];
  metricsMap: Map<number, MetricDetail>;
}

const NetworkTab: React.FC<NetworkTabProps> = ({ selectedContainers, metricsMap }) => {
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

  // Network Cards 데이터
  const networkCards = useMemo(() => {
    return selectedMetrics.map((dto) => {
      const totalPackets = (dto.network.totalRxPackets || 0) + (dto.network.totalTxPackets || 0);
      const totalErrors = (dto.network.rxErrors || 0) + (dto.network.txErrors || 0);
      const totalDropped = (dto.network.rxDropped || 0) + (dto.network.txDropped || 0);

      const totalErrorRate = totalPackets > 0
        ? ((totalErrors / totalPackets) * 100).toFixed(2)
        : '0.00';

      const totalDropRate = totalPackets > 0
        ? ((totalDropped / totalPackets) * 100).toFixed(2)
        : '0.00';

      return {
        id: String(dto.container.containerId),
        name: dto.container.containerName || 'Unknown',
        rxBytes: Number(((dto.network.totalRxBytes || 0) / BYTES_TO_MB).toFixed(2)), // MB
        txBytes: Number(((dto.network.totalTxBytes || 0) / BYTES_TO_MB).toFixed(2)), // MB
        rxBytesPerSec: Number(((dto.network.currentRxBytesPerSec || 0) / BYTES_TO_MB).toFixed(2)), // MB/s
        txBytesPerSec: Number(((dto.network.currentTxBytesPerSec || 0) / BYTES_TO_MB).toFixed(2)), // MB/s
        rxPackets: dto.network.totalRxPackets || 0,
        txPackets: dto.network.totalTxPackets || 0,
        rxErrors: dto.network.rxErrors || 0,
        txErrors: dto.network.txErrors || 0,
        rxDropped: dto.network.rxDropped || 0,
        txDropped: dto.network.txDropped || 0,
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
        <NetworkRxChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
        <NetworkTxChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
        <TrafficUsageChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
        <ErrorDropRateChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
      </div>
    </div>
  );
};

export default NetworkTab;