import React, { useMemo, useEffect } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { NetworkCard } from '@/entities/network/ui/NetworkCard';
import { NetworkRxChart } from './ui/NetworkRxChart';
import { NetworkTxChart } from './ui/NetworkTxChart';
import { TrafficUsageChart } from './ui/TrafficUsageChart';
import { ErrorDropRateChart } from './ui/ErrorDropRateChart';
import { NetworkRxHistoryChart } from './ui/NetworkRxHistoryChart';
import { NetworkTxHistoryChart } from './ui/NetworkTxHistoryChart';
import { ErrorDropHistoryChart } from './ui/ErrorDropHistoryChart';

const BYTES_TO_MB = 1024 ** 2;

interface NetworkTabProps {
  selectedContainers: ContainerData[];
  initialMetricsMap: Map<number, MetricDetail>;
  metricsMap: Map<number, MetricDetail>;
}

const NetworkTab: React.FC<NetworkTabProps> = ({ selectedContainers, initialMetricsMap, metricsMap }) => {
  // initialMetricsMap 디버깅
  useEffect(() => {
    console.log('[NetworkTab] Received initialMetricsMap:', {
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
          summary: initialMetric?.cpu?.summary || liveMetric.cpu?.summary,
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
          // REST API summary 우선 사용 (WebSocket은 summary가 제거됨)
          summary: initialMetric?.network?.summary || liveMetric.network?.summary,
          // REST API time series 보존 (차트용)
          rxBytesPerSec: initialMetric?.network?.rxBytesPerSec || [],
          txBytesPerSec: initialMetric?.network?.txBytesPerSec || [],
        },
      };

      metrics.push(mergedMetric);
    });

    console.log('[NetworkTab] Merged metrics:', {
      count: metrics.length,
      sample: metrics[0] ? {
        container: metrics[0].container.containerName,
        hasNetworkSummary: !!metrics[0].network?.summary,
        summaryValues: metrics[0].network?.summary,
        rxBytesPerSecLength: metrics[0].network?.rxBytesPerSec?.length || 0,
        txBytesPerSecLength: metrics[0].network?.txBytesPerSec?.length || 0,
      } : null,
    });

    return metrics;
  }, [selectedContainers, metricsMap, initialMetricsMap]);

  // Network Cards 데이터
  const networkCards = useMemo(() => {
    return selectedMetrics.map((dto) => {
      const totalPackets = (dto.network.totalRxPackets || 0) + (dto.network.totalTxPackets || 0);
      const totalErrors = (dto.network.rxErrors || 0) + (dto.network.txErrors || 0);

      const errorRate = totalPackets > 0
        ? Number(((totalErrors / totalPackets) * 100).toFixed(2))
        : 0;

      // Status based on error rate
      const status = errorRate >= 5 ? 'critical' : errorRate >= 2 ? 'warning' : 'healthy';

      // Status percent (inverse of error rate, so 100% = no errors)
      const statusPercent = Math.max(0, 100 - errorRate);

      // Convert bytes/sec to Mbps (bytes/sec / 1024^2 * 8)
      const rxMbps = Number(((dto.network.currentRxBytesPerSec || 0) / BYTES_TO_MB * 8).toFixed(2));
      const txMbps = Number(((dto.network.currentTxBytesPerSec || 0) / BYTES_TO_MB * 8).toFixed(2));

      // Max Mbps (use current as max if no historical data available)
      const rxMbpsMax = rxMbps > 0 ? rxMbps * 1.2 : 100; // 20% headroom or default 100
      const txMbpsMax = txMbps > 0 ? txMbps * 1.2 : 100;

      // Total traffic in KB
      const totalTraffic = Number((((dto.network.totalRxBytes || 0) + (dto.network.totalTxBytes || 0)) / 1024).toFixed(2));

      return {
        id: String(dto.container.containerId),
        name: dto.container.containerName || 'Unknown',
        status: status as 'healthy' | 'warning' | 'critical',
        statusPercent: Number(statusPercent.toFixed(1)),
        rxMbps,
        rxMbpsMax: Number(rxMbpsMax.toFixed(2)),
        txMbps,
        txMbpsMax: Number(txMbpsMax.toFixed(2)),
        errorRate,
        totalTraffic,
      };
    });
  }, [selectedMetrics]);

  if (selectedContainers.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">🌐</div>
        <h3 className="text-xl font-semibold text-text-secondary mb-2">컨테이너를 선택해주세요</h3>
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

      {/* Realtime Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetworkRxChart selectedContainers={selectedContainers} initialMetricsMap={initialMetricsMap} metricsMap={metricsMap} />
        <NetworkTxChart selectedContainers={selectedContainers} initialMetricsMap={initialMetricsMap} metricsMap={metricsMap} />
        <TrafficUsageChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
        <ErrorDropRateChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
      </div>

      {/* Historical Charts Grid (Time Range) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <NetworkRxHistoryChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
        <NetworkTxHistoryChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
      </div>

      {/* Packet Rate History Chart (Time Range) */}
      <div className="flex gap-4 mt-4">
        <ErrorDropHistoryChart selectedContainers={selectedContainers} metricsMap={metricsMap} />
      </div>
    </div>
  );
};

export default NetworkTab;