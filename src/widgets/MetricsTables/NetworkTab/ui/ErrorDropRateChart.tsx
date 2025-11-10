/********************************************************************************************
 * ⚠️ ErrorDropRateChart.tsx (Real-time WebSocket Data)
 * ─────────────────────────────────────────────
 * 컨테이너별 네트워크 에러율 및 드랍율 실시간 표시
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
import { useContainerStore } from '@/shared/stores/useContainerStore';

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

interface ErrorDropRateChartProps {
  selectedContainers: ContainerData[];
}

export const ErrorDropRateChart: React.FC<ErrorDropRateChartProps> = ({ selectedContainers }) => {
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 선택된 컨테이너의 실시간 메트릭 데이터
  const selectedMetrics = useMemo(() => {
    const allData = getDisplayData();

    // 선택된 컨테이너가 없으면 첫 번째 컨테이너 사용
    if (selectedContainers.length === 0) {
      return allData.length > 0 ? [allData[0]] : [];
    }

    const selectedIds = new Set(selectedContainers.map((c) => Number(c.id)));
    return allData.filter((dto) => selectedIds.has(dto.containerId));
  }, [getDisplayData, selectedContainers]);

  // Track container IDs to prevent chart data reset
  const prevContainerIds = useRef<string>('');
  const currentContainerIds = selectedMetrics.map(m => m.containerId).sort().join(',');

  // Only reset datasets when container selection changes, not on every render
  const data = useMemo(() => {
    if (prevContainerIds.current !== currentContainerIds) {
      prevContainerIds.current = currentContainerIds;
    }
    return {
      datasets: selectedMetrics.map((dto, i) => ({
        label: dto.containerName,
        borderColor: `hsl(${(i * 70 + 40) % 360}, 75%, 55%)`,
        backgroundColor: `hsla(${(i * 70 + 40) % 360}, 75%, 55%, 0.1)`,
        borderWidth: 2,
        fill: false,
        data: [],
      })),
    };
  }, [currentContainerIds, selectedMetrics]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 30000,
          delay: 1000,
          refresh: 1000,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onRefresh: (chart: any) => {
            const currentData = getDisplayData();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chart.data.datasets.forEach((dataset: any, i: number) => {
              const dto = selectedMetrics[i];
              if (dto) {
                const latestMetric = currentData.find((d) => d.containerId === dto.containerId);
                if (latestMetric) {
                  // 에러율 + 드랍율 계산
                  const totalPackets = (latestMetric.rxPackets || 0) + (latestMetric.txPackets || 0);
                  let failureRate = 0;

                  if (totalPackets > 0) {
                    const totalErrors = (latestMetric.rxErrors || 0) + (latestMetric.txErrors || 0);
                    const totalDropped = (latestMetric.rxDropped || 0) + (latestMetric.txDropped || 0);
                    failureRate = ((totalErrors + totalDropped) / totalPackets) * 100;
                  }

                  dataset.data.push({
                    x: Date.now(),
                    y: Number(failureRate.toFixed(4)),
                  });
                }
              }
            });
          },
        },
        ticks: { color: '#777' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        min: 0,
        ticks: {
          callback: (v: number | string) => `${v}%`,
          color: '#777',
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, color: '#444' },
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
      },
    },
  };

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        에러 및 드랍율
      </h3>
      <div className="bg-white rounded-lg p-4 h-[320px]">
        <Line data={data} options={options} />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        WebSocket 실시간 데이터 — Error / Drop Rate (%)
      </p>
    </section>
  );
};
