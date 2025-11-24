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
  type ChartOptions,
} from 'chart.js';

import type { MetricDetail } from '@/shared/types/api/manage.types';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  selectedMetrics: MetricDetail[];
}

export const CPUModeChart: React.FC<Props> = ({ selectedMetrics }) => {
  // 데이터 계산 (User / System 비율)
  const modeData = useMemo(() => {
    console.log('[CPUModeChart] selectedMetrics:', selectedMetrics.length);

    return selectedMetrics.map((metric) => {
      const cpuUser = metric?.cpu?.cpuUser ?? 0;
      const cpuSystem = metric?.cpu?.cpuSystem ?? 0;
      const cpuUsageTotal = metric?.cpu?.cpuUsageTotal ?? 0;

      // cpuUsageTotal을 기준으로 비율 계산
      const userPercent = cpuUsageTotal > 0 ? ((cpuUser / cpuUsageTotal) * 100) : 0;
      const systemPercent = cpuUsageTotal > 0 ? ((cpuSystem / cpuUsageTotal) * 100) : 0;

      console.log('[CPUModeChart] Debug:', {
        containerName: metric?.container?.containerName,
        cpuUser,
        cpuSystem,
        cpuUsageTotal,
        userPercent: userPercent.toFixed(1),
        systemPercent: systemPercent.toFixed(1),
      });

      return {
        name: metric?.container?.containerName ?? 'Unknown',
        user: Number(userPercent.toFixed(1)),
        system: Number(systemPercent.toFixed(1))
      };
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
      },
      {
        label: 'System',
        data: modeData.map((d) => d.system),
        backgroundColor: '#43dffa',
      },
    ],
  };

  // Chart.js 옵션 (가로형 + 누적형)
  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        min: 0,
        max: 100,
        ticks: {
          callback: (val) => `${val}%`,
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
        position: 'bottom',
        labels: { boxWidth: 12, color: '#444' },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
