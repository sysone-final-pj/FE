/********************************************************************************************
 * 🌐 NetworkTxChart.tsx (백엔드 시계열 데이터 기반)
 * ─────────────────────────────────────────────
 * 컨테이너별 네트워크 송신 속도(Tx) 실시간 표시 (실제 timestamp 사용)
 ********************************************************************************************/
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { convertNetworkSpeedAuto } from '@/shared/lib/formatters';

// Chart.js 등록
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend
);

interface NetworkTxChartProps {
  selectedContainers: ContainerData[];
  metricsMap: Map<number, MetricDetail>;
}

export const NetworkTxChart: React.FC<NetworkTxChartProps> = ({ selectedContainers, metricsMap }) => {
  // 선택된 컨테이너의 실시간 메트릭 데이터
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

  const chartData = useMemo(() => {
    // 모든 데이터의 최대값을 구하여 단위 결정
    const allValues = selectedMetrics.flatMap(
      (metric) => metric?.network?.txBytesPerSec?.map((p) => p.value) || []
    );
    const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
    const { unit } = convertNetworkSpeedAuto(maxValue);

    // 단위에 맞는 변환 함수
    const converter = (bytesPerSec: number) => {
      const bitsPerSec = bytesPerSec * 8;
      switch (unit) {
        case 'Kbps':
          return bitsPerSec / 1_000;
        case 'Mbps':
          return bitsPerSec / 1_000_000;
        case 'Gbps':
          return bitsPerSec / 1_000_000_000;
        default:
          return bitsPerSec / 1_000;
      }
    };

    return {
      datasets: selectedMetrics.map((metric, i) => {
        // 시계열 데이터를 차트 형식으로 변환
        const timeSeriesData = metric?.network?.txBytesPerSec?.map((point) => ({
          x: new Date(point.timestamp).getTime(),
          y: converter(point.value),
        })) || [];

        return {
          label: metric?.container?.containerName || 'Unknown',
          borderColor: `hsl(${(i * 70) % 360}, 75%, 55%)`,
          backgroundColor: `hsla(${(i * 70) % 360}, 75%, 55%, 0.1)`,
          borderWidth: 2,
          fill: false,
          data: timeSeriesData,
        };
      }),
      unit,
    };
  }, [selectedMetrics]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time' as const,
          time: {
            unit: 'second' as const,
            displayFormats: {
              second: 'HH:mm:ss',
            },
          },
          ticks: { color: '#777' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          min: 0,
          ticks: {
            callback: (v: number | string) => `${typeof v === 'number' ? v.toFixed(1) : v} ${chartData.unit}`,
            color: '#777',
          },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
      },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { boxWidth: 12, color: '#444' },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: (context: any) =>
              `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ${chartData.unit}`,
          },
        },
      },
    }),
    [chartData.unit]
  );

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        Network Tx Trend
      </h3>
      <div className="bg-white rounded-lg p-4 h-[280px]">
        <Line data={chartData} options={options} />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        WebSocket realtime data — Actual backend timestamps
      </p>
    </section>
  );
};
