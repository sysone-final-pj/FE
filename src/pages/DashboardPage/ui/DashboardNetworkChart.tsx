/********************************************************************************************
 * 🌐 DashboardNetworkChart.tsx (Real-time Network Chart for Dashboard)
 * ─────────────────────────────────────────────
 * Dashboard용 네트워크 Rx/Tx 속도 실시간 표시 (Line 차트)
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
import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-date-fns';
import { useContainerStore } from '@/shared/stores/useContainerStore';

// Chart.js 등록
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

export const DashboardNetworkChart: React.FC = () => {
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 모든 컨테이너의 평균 네트워크 속도
  const networkMetrics = useMemo(() => {
    const allData = getDisplayData();
    if (allData.length === 0) return { rx: 0, tx: 0 };

    const totalRx = allData.reduce((sum, dto) => sum + dto.rxBytesPerSec, 0);
    const totalTx = allData.reduce((sum, dto) => sum + dto.txBytesPerSec, 0);

    return {
      rx: totalRx / allData.length,
      tx: totalTx / allData.length,
    };
  }, [getDisplayData]);

  // Memoize chart data to prevent reset on every render
  const data = useMemo(() => ({
    datasets: [
      {
        label: 'Rx (수신)',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        data: [],
      },
      {
        label: 'Tx (송신)',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        data: [],
      },
    ],
  }), []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 30000, // 30초 표시
          delay: 1000,
          refresh: 1000,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onRefresh: (chart: any) => {
            const allData = getDisplayData();
            const now = Date.now();

            if (allData.length > 0) {
              const totalRx = allData.reduce((sum, dto) => sum + (dto.rxBytesPerSec || 0), 0);
              const totalTx = allData.reduce((sum, dto) => sum + (dto.txBytesPerSec || 0), 0);

              const avgRx = (totalRx / allData.length * 8) / 1000000; // Mbps
              const avgTx = (totalTx / allData.length * 8) / 1000000; // Mbps

              chart.data.datasets[0].data.push({
                x: now,
                y: Number(avgRx.toFixed(2)),
              });

              chart.data.datasets[1].data.push({
                x: now,
                y: Number(avgTx.toFixed(2)),
              });
            }
          },
        },
        ticks: { color: '#777' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        min: 0,
        ticks: {
          callback: (v: number | string) => `${v} Mbps`,
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
        mode: 'index',
        intersect: false,
      },
    },
  };

  return (
    <section className="bg-white rounded-lg border border-gray-300 p-6">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 mb-4">
        Network (평균 Rx/Tx 속도)
      </h3>
      <div className="bg-gray-50 rounded-lg p-4 h-[300px]">
        <Line data={data} options={options} />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        전체 컨테이너 평균 네트워크 속도
      </p>
    </section>
  );
};
