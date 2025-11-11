/********************************************************************************************
 * 📈 CPUTrendChart.tsx
 * 실시간 Chart.js Streaming + WebSocket 데이터 연속성 유지
 ********************************************************************************************/
import React, { useRef, useMemo } from 'react';
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
import { useContainerStore } from '@/shared/stores/useContainerStore';
import type { MetricsData } from '@/shared/types/metrics';

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

interface Props {
  selectedMetrics: MetricsData[];
}

export const CPUTrendChart: React.FC<Props> = ({ selectedMetrics }) => {
  const getDisplayData = useContainerStore((s) => s.getDisplayData);
  const chartDataRef = useRef<any>();
  const prevContainerIds = useRef<string>('');

  const currentIds = selectedMetrics.map((m) => m.containerId).sort().join(',');

  const chartData = useMemo(() => {
    if (prevContainerIds.current !== currentIds || !chartDataRef.current) {
      prevContainerIds.current = currentIds;
      chartDataRef.current = {
        datasets: selectedMetrics.map((dto, i) => ({
          label: dto.containerName,
          borderColor: `hsl(${(i * 70) % 360}, 75%, 55%)`,
          backgroundColor: `hsla(${(i * 70) % 360}, 75%, 55%, 0.1)`,
          borderWidth: 2,
          fill: false,
          data: [],
        })),
      };
    }
    return chartDataRef.current;
  }, [selectedMetrics, currentIds]);

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 30000,
          refresh: 1000,
          delay: 1000,
          onRefresh: (chart: any) => {
            const currentData = getDisplayData();
            chart.data.datasets.forEach((dataset: any, i: number) => {
              const dto = selectedMetrics[i];
              const latest = currentData.find((d) => d.containerId === dto.containerId);
              if (latest?.cpuPercent !== undefined) {
                dataset.data.push({ x: Date.now(), y: latest.cpuPercent });
              }
            });
          },
        },
      },
      y: { min: 0, max: 100 },
    },
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        CPU Usage Trend (Realtime)
      </h3>
      <div className="bg-white rounded-lg p-4 h-[280px]">
        <Line data={chartData} options={options} />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        WebSocket realtime data — CPU usage continuity
      </p>
    </section>
  );
};
