/********************************************************************************************
 * 💥 OOMKillsChart.tsx (Real-time Data - Future Implementation)
 * ─────────────────────────────────────────────
 * 컨테이너별 OOM Kill 발생 횟수 시각화
 * 현재는 WebSocket 데이터에 OOM Kill 필드가 없으므로 향후 구현 예정
 ********************************************************************************************/
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ContainerData } from '@/shared/types/container';
import { useContainerStore } from '@/shared/stores/useContainerStore';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface OOMKillsChartProps {
  selectedContainers: ContainerData[];
}

export const OOMKillsChart: React.FC<OOMKillsChartProps> = ({ selectedContainers }) => {
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

  const data = {
    labels: selectedMetrics.map((dto) => dto.containerName),
    datasets: [
      {
        label: 'OOM Kills',
        data: selectedMetrics.map(() => 0), // WebSocket에 OOM Kill 데이터가 없으므로 0으로 표시
        backgroundColor: [
          '#6366f1',
          '#3b82f6',
          '#f87171',
          '#fbbf24',
          '#06b6d4',
        ],
        borderRadius: 4,
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: '#777' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5, color: '#777' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => `OOM Kills: ${ctx.parsed.y}`,
        },
      },
    },
  };

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        OOM Kills
      </h3>
      <div className="bg-white rounded-lg p-4 h-[320px]">
        {selectedMetrics.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            데이터 없음
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        OOM Kill 통계는 향후 제공 예정입니다.
      </p>
    </section>
  );
};
