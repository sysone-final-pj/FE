/********************************************************************************************
 * 💾 MemoryUsageChart.tsx (Continuous Real-time WebSocket Data)
 * ─────────────────────────────────────────────
 * WebSocket 실시간 데이터를 스트리밍하면서 차트 리셋 없이 연속적으로 표시
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
import type { ChartData, Chart } from 'chart.js';
import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-date-fns';
import type { ContainerData } from '@/shared/types/container';
import { useContainerStore } from '@/shared/stores/useContainerStore';

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
}

export const MemoryUsageChart: React.FC<MemoryUsageChartProps> = ({ selectedContainers }) => {
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 선택된 컨테이너 실시간 메트릭
  const selectedMetrics = useMemo(() => {
    const allData = getDisplayData();
    if (selectedContainers.length === 0) return allData.length > 0 ? [allData[0]] : [];
    const ids = new Set(selectedContainers.map((c) => Number(c.id)));
    return allData.filter((dto) => ids.has(dto.container.containerId));
  }, [getDisplayData, selectedContainers]);

  const prevIdsRef = useRef<string[]>([]);
const chartDataRef = useRef<ChartData<'line'>>(null);

  const chartData = useMemo(() => {
    const currentIds = selectedMetrics.map((m) => String(m.container.containerId)).sort();
    const prevIds = prevIdsRef.current;

    const hasChanged =
      prevIds.length !== currentIds.length ||
      !prevIds.every((id, i) => id === currentIds[i]);

    // 컨테이너 선택이 변경된 경우 dataset 재생성
    if (hasChanged) {
      prevIdsRef.current = currentIds;
      const newData = {
        datasets: selectedMetrics.map((dto, i) => ({
          label: dto.container.containerName,
          borderColor: `hsl(${(i * 65) % 360}, 75%, 55%)`,
          backgroundColor: `hsla(${(i * 65) % 360}, 75%, 55%, 0.1)`,
          borderWidth: 2,
          fill: false,
          data: [],
        })),
      };
      chartDataRef.current = newData;
      return newData;
    }

    // 선택 동일 → 이전 데이터 유지 (리셋 방지)
    return chartDataRef.current;
  }, [selectedMetrics]);

  // Chart 옵션 (onRefresh에서만 데이터 append)
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'realtime',
          realtime: {
            duration: 30000, // 30초
            delay: 1000,
            refresh: 1000,
            onRefresh: (chart: Chart<'line'>) => {
              const currentData = getDisplayData();
              chart.data.datasets.forEach((dataset, i) => {
                const dto = selectedMetrics[i];
                if (!dto) return;

                const latest = currentData.find(
                  (d) => d.container.containerId === dto.container.containerId
                );
                if (latest && latest.memPercent !== undefined) {
                  dataset.data.push({
                    x: Date.now(),
                    y: Number(latest.memPercent.toFixed(2)),
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
          position: 'bottom',
          labels: { boxWidth: 12, color: '#444' },
        },
        tooltip: {
          mode: 'nearest',
          intersect: false,
        },
      },
    }),
    [getDisplayData, selectedMetrics]
  );

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        Memory 사용률 추이 (실시간)
      </h3>
      <div className="bg-white rounded-lg p-4 h-[320px]">
        <Line data={chartData} options={options} />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        WebSocket 실시간 데이터 — Memory 사용률 추이
      </p>
    </section>
  );
};
