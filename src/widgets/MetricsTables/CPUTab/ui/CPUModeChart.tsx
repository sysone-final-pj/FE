/********************************************************************************************
 * ⚙️ CPUModeChart.tsx (Chart.js Horizontal Bar Version)
 * ───────────────────────────────────────────────────────────────
 * CPU User / System 모드 비율을 가로 누적 막대형으로 시각화
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

import type { MetricsData } from '@/shared/types/metrics';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  selectedMetrics: MetricsData[];
}

export const CPUModeChart: React.FC<Props> = ({ selectedMetrics }) => {
  // 데이터 계산 (User / System 비율)
  const modeData = useMemo(() => {
    return selectedMetrics.map((dto) => {
      const totalCpu = (dto.cpuUser || 0) + (dto.cpuSystem || 0);
      const user = totalCpu > 0 ? ((dto.cpuUser / totalCpu) * 100).toFixed(0) : '0';
      const system = totalCpu > 0 ? ((dto.cpuSystem / totalCpu) * 100).toFixed(0) : '0';
      return { name: dto.containerName, user: Number(user), system: Number(system) };
    });
  }, [selectedMetrics]);

  // Chart.js 데이터 구조
  const data = {
    labels: modeData.map((d) => d.name),
    datasets: [
      {
        label: 'User',
        data: modeData.map((d) => d.user),
        backgroundColor: '#abff7d',
        borderWidth: 1,
      },
      {
        label: 'System',
        data: modeData.map((d) => d.system),
        backgroundColor: '#43dffa',
        borderWidth: 1,
      },
    ],
  };

  // Chart.js 옵션 (가로형 + 누적형)
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        min: 0,
        max: 100,
        ticks: {
          callback: (val: number) => `${val}%`,
          color: '#666',
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: { display: true, text: 'CPU Usage (%)' },
      },
      y: {
        stacked: true,
        ticks: { color: '#555' },
        grid: { display: false },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, color: '#444' },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.formattedValue}%`,
        },
      },
    },
  };

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        CPU Mode Distribution (User / System)
      </h3>

      <div className="bg-white rounded-lg p-5 h-[280px]">
        {modeData.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No container selected
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2 text-right">
        User/System CPU mode ratio (100% stacked)
      </p>
    </section>
  );
};
