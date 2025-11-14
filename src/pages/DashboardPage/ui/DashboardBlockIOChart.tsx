/********************************************************************************************
 * 💿 DashboardBlockIOChart.tsx (Real-time Block I/O Chart for Dashboard)
 * ─────────────────────────────────────────────
 * Dashboard용 Block I/O Read/Write 속도 실시간 표시 (Bar 차트)
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
import { useContainerStore } from '@/shared/stores/useContainerStore';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const DashboardBlockIOChart: React.FC = () => {
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 모든 컨테이너의 Block I/O 데이터
  // TODO: ContainerDashboardResponseDTO에 Block I/O 필드 추가 필요
  const blockIOData = useMemo(() => {
    const allData = getDisplayData();

    return allData.map((dto) => ({
      name: dto.container?.containerName || 'Unknown',
      read: 0, // TODO: Block I/O 데이터가 ContainerDashboardResponseDTO에 없음
      write: 0, // TODO: Block I/O 데이터가 ContainerDashboardResponseDTO에 없음
    }));
  }, [getDisplayData]);

  const data = {
    labels: blockIOData.map((d) => d.name),
    datasets: [
      {
        label: 'Read (MB/s)',
        data: blockIOData.map((d) => d.read),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
      {
        label: 'Write (MB/s)',
        data: blockIOData.map((d) => d.write),
        backgroundColor: '#10b981',
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
        ticks: {
          color: '#777',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: number | string) => `${v} MB/s`,
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
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y} MB/s`,
        },
      },
    },
  };

  return (
    <section className="bg-white rounded-lg border border-gray-300 p-6">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 mb-4">
        Block I/O (Read/Write 속도)
      </h3>
      <div className="bg-gray-50 rounded-lg p-4 h-[300px]">
        {blockIOData.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            데이터 없음
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        컨테이너별 디스크 I/O 속도
      </p>
    </section>
  );
};
