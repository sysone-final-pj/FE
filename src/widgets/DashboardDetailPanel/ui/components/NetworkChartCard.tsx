/********************************************************************************************
 * 🌐 NetworkChartCard.tsx
 * ─────────────────────────────────────────────
 * Dashboard용 네트워크 Rx/Tx 실시간 카드 (라인 차트 포함)
 * - WebSocket 시계열 데이터 사용 (백엔드 timestamp 기반)
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
import 'chartjs-adapter-date-fns';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { formatNetworkSpeed, convertNetworkSpeedAuto } from '@/shared/lib/formatters';


// Chart.js 등록
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend
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

    return { rx: rxValue, tx: txValue, unit };
  }, [getDisplayData]);

  // 시계열 데이터 처리 및 Chart Dataset 생성
  const chartData = useMemo(() => {
    const allData = getDisplayData();

    // 모든 컨테이너의 시계열 데이터를 평균 계산
    const rxDataMap = new Map<string, number[]>();
    const txDataMap = new Map<string, number[]>();

    allData.forEach((dto) => {
      dto.network.rxBytesPerSec?.forEach((point) => {
        if (!rxDataMap.has(point.timestamp)) {
          rxDataMap.set(point.timestamp, []);
        }
        rxDataMap.get(point.timestamp)!.push(point.value);
      });

      dto.network.txBytesPerSec?.forEach((point) => {
        if (!txDataMap.has(point.timestamp)) {
          txDataMap.set(point.timestamp, []);
        }
        txDataMap.get(point.timestamp)!.push(point.value);
      });
    });

    // 평균 계산 및 정렬
    const rxData = Array.from(rxDataMap.entries())
      .map(([timestamp, values]) => ({
        x: new Date(timestamp).getTime(),
        y: values.reduce((sum, v) => sum + v, 0) / values.length,
      }))
      .sort((a, b) => a.x - b.x);

    const txData = Array.from(txDataMap.entries())
      .map(([timestamp, values]) => ({
        x: new Date(timestamp).getTime(),
        y: values.reduce((sum, v) => sum + v, 0) / values.length,
      }))
      .sort((a, b) => a.x - b.x);

    // 단위 변환
    const maxValue = Math.max(
      ...rxData.map(d => d.y),
      ...txData.map(d => d.y),
      0
    );
    const { unit } = convertNetworkSpeedAuto(maxValue);

    // 단위에 맞게 변환
    const converter = (bytesPerSec: number) => {
      const bitsPerSec = bytesPerSec * 8;
      switch (unit) {
        case 'Kbps':
          return bitsPerSec / 1_000;
        case 'Mbps':
          return bitsPerSec / 1_000_000;
        case 'Gbps':
          return bitsPerSec / 1_000_000_000;
        default:
          return bitsPerSec / 1_000;
      }
    };

    return {
      datasets: [
        {
          label: 'Rx',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: false,
          data: rxData.map(d => ({ x: d.x, y: converter(d.y) })),
        },
        {
          label: 'Tx',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          data: txData.map(d => ({ x: d.x, y: converter(d.y) })),
        },
      ],
      unit,
    };
  }, [getDisplayData]);

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
          beginAtZero: true,
          grace: '20%',
          ticks: {
            callback: (v: number | string) => `${typeof v === 'number' ? v.toFixed(1) : v} ${chartData.unit}`,
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
            label: (context: TooltipItem<'line'>) =>
              `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ${chartData.unit}`,
          },
        },
      },
    }),
    [chartData.unit]
  );

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
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
