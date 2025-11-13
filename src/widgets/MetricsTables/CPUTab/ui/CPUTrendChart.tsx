/********************************************************************************************
 * 📈 CPUTrendChart.tsx
 * 실시간 CPU 사용률 추이 차트 (백엔드 시계열 데이터 기반)
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

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend
);

interface Props {
  selectedContainers: ContainerData[];
  metricsMap: Map<number, MetricDetail>;
}

export const CPUTrendChart: React.FC<Props> = ({ selectedContainers, metricsMap }) => {
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
    return {
      datasets: selectedMetrics.map((metric, i) => {
        // 시계열 데이터를 차트 형식으로 변환 (안전한 접근)
        const timeSeriesData = metric?.cpu?.cpuPercent?.map((point) => ({
          x: new Date(point.timestamp).getTime(),
          y: point.value,
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
            label: (context: any) =>
              `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`,
          },
        },
      },
    }),
    []
  );

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        CPU Usage Trend (Realtime)
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
