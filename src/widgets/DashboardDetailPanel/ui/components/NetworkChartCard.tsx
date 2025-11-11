/********************************************************************************************
 * 🌐 NetworkChartCard.tsx
 * ─────────────────────────────────────────────
 * Dashboard용 네트워크 Rx/Tx 실시간 카드 (라인 차트 포함)
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
import type { TooltipItem } from 'chart.js';
import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-date-fns';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { formatNetworkSpeed } from '@/shared/lib/formatters';


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

export const NetworkChartCard: React.FC = () => {
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 평균 Rx/Tx 계산 및 단위 변환
  const avgNetwork = useMemo(() => {
    const allData = getDisplayData();
    if (allData.length === 0) {
      const defaultUnit = formatNetworkSpeed(0).split(' ')[1] || 'Kbps';
      return { rx: '0', tx: '0', unit: defaultUnit };
    }

    const totalRx =
      allData.reduce((sum, dto) => sum + (dto.network.currentRxBytesPerSec || 0), 0) /
      allData.length;
    const totalTx =
      allData.reduce((sum, dto) => sum + (dto.network.currentTxBytesPerSec || 0), 0) /
      allData.length;

    const rxString = formatNetworkSpeed(totalRx);
    const txString = formatNetworkSpeed(totalTx);

    const [rxValue, rxUnit] = rxString.split(' ');
    const [txValue, txUnit] = txString.split(' ');

    const unit = rxUnit || txUnit || 'Kbps';

    // Rx와 Tx 단위가 다를 일은 거의 없음 (Rx 기준 사용)
    return { rx: rxValue, tx: txValue, unit };
  }, [getDisplayData]);

  // Chart Dataset (Rx/Tx)
  const data = useMemo(
    () => ({
      datasets: [
        {
          label: 'Rx',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: false,
          data: [],
        },
        {
          label: 'Tx',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          data: [],
        },
      ],
    }),
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 30000, // 최근 30초 표시
          delay: 1000,
          refresh: 1000,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onRefresh: (chart: any) => {
            const allData = getDisplayData();
            const now = Date.now();

            if (allData.length > 0) {
              const totalRx =
                allData.reduce(
                  (sum, dto) => sum + (dto.network.currentRxBytesPerSec  || 0),
                  0
                ) / allData.length;
              const totalTx =
                allData.reduce(
                  (sum, dto) => sum + (dto.network.currentRxBytesPerSec  || 0),
                  0
                ) / allData.length;

              // 자동 단위 변환
              const rxValue = parseFloat(
                formatNetworkSpeed(totalRx).split(' ')[0]
              );
              const txValue = parseFloat(
                formatNetworkSpeed(totalTx).split(' ')[0]
              );

              chart.data.datasets[0].data.push({ x: now, y: rxValue });
              chart.data.datasets[1].data.push({ x: now, y: txValue });
            }
          },
        },
        ticks: { color: '#777' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        grace: '20%',
        ticks: {
          callback: (v: number | string) => `${v} ${avgNetwork.unit}`,
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
        callbacks: {
          label: (context: TooltipItem<'line'>) =>
            `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ${avgNetwork.unit}`,
        },
      },
    },
  };

  return (
    <div className="mt-3.5 bg-white w-full h-[308px] rounded-xl border border-[#ebebf1] p-4">
      {/* Header Section */}
      <div className="flex items-center gap-2 border-b border-[#ebebf1] pb-3 px-3 mb-4">
        <p className="text-[#505050] font-semibold text-xl">Network</p>
        <div className="flex items-center gap-3 ml-4">
          {/* Rx */}
          <div className="bg-white rounded-lg px-2.5 py-[5px] flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 12L8 4M8 4L5 7M8 4L11 7" stroke="#0492f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[#767676] text-sm">Rx</p>
            <p className="text-[#0492f4] text-sm">{avgNetwork.rx}</p>
            <p className="text-[#767676] text-xs">{avgNetwork.unit}</p>
          </div>

          <div className="text-[#767676] text-xs">|</div>

          {/* Tx */}
          <div className="bg-white rounded-lg px-2.5 py-[5px] flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4L8 12M8 12L11 9M8 12L5 9" stroke="#14ba6d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[#767676] text-sm">Tx</p>
            <p className="text-[#14ba6d] text-sm">{avgNetwork.tx}</p>
            <p className="text-[#767676] text-xs">{avgNetwork.unit}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-[225px] bg-gray-50 rounded-lg p-2">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
