/********************************************************************************************
 * 💾 MemoryUsageChart.tsx (Streaming Plugin)
 * ─────────────────────────────────────────────
 * 실시간 메모리 사용률 추이 차트
 ********************************************************************************************/
import React, { useMemo, useRef } from 'react';
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
import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-date-fns';
import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';

// Chart.js 플러그인 등록
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  streamingPlugin
);

interface MemoryUsageChartProps {
  selectedContainers: ContainerData[];
  metricsMap: Map<number, MetricDetail>;
}

export const MemoryUsageChart: React.FC<MemoryUsageChartProps> = ({ selectedContainers, metricsMap }) => {
  // 선택된 컨테이너 실시간 메트릭
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

  // Track container IDs to prevent chart data reset on every render
  const prevContainerIds = useRef<string>('');
  const currentContainerIds = selectedMetrics.map(m => m?.container?.containerId || '').sort().join(',');

  // Only reset datasets when container selection changes, not on every render
  const chartData = useMemo(() => {
    if (prevContainerIds.current !== currentContainerIds) {
      prevContainerIds.current = currentContainerIds;
    }
    return {
      datasets: selectedMetrics.map((metric, i) => ({
        label: metric?.container?.containerName || 'Unknown',
        borderColor: `hsl(${(i * 65) % 360}, 75%, 55%)`,
        backgroundColor: `hsla(${(i * 65) % 360}, 75%, 55%, 0.1)`,
        borderWidth: 2,
        fill: false,
        data: [], // Streaming plugin이 onRefresh에서 데이터 추가
      })),
    };
  }, [currentContainerIds, selectedMetrics]);

  // Streaming 옵션
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'realtime' as const,
          realtime: {
            duration: 120000, // 2분간 데이터 표시
            delay: 1000, // 1초 지연
            refresh: 1000, // 1초마다 갱신
            onRefresh: (chart: any) => {
              // 각 데이터셋에 최신 Memory 값 추가
              chart.data.datasets.forEach((dataset: any, i: number) => {
                const metric = selectedMetrics[i];
                if (metric) {
                  const latestMemory = metric?.memory?.currentMemoryPercent ?? 0;
                  dataset.data.push({
                    x: Date.now(),
                    y: latestMemory,
                  });
                }
              });
            },
          },
          ticks: { color: '#777' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: (v: number | string) => `${v}%`,
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
            label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`,
          },
        },
      },
    }),
    [selectedMetrics]
  );

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        Memory Usage Trend
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
