/********************************************************************************************
 * 🌐 NetworkChartCard.tsx
 * ─────────────────────────────────────────────
 * Dashboard용 네트워크 Rx/Tx 실시간 카드
 * - REST API 초기 30분 데이터 로드
 * - WebSocket 실시간 데이터 추가 (useEffect 감지)
 * - Time scale 사용 (데이터 시간 기준)
 ********************************************************************************************/
import React, { useMemo, useRef, useEffect } from 'react';
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
import type { TooltipItem, Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { convertNetworkSpeedAuto } from '@/shared/lib/formatters';

// Chart.js 등록 (streaming plugin 제거)
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend
);

interface NetworkChartCardProps {
  containerId: number;
}

export const NetworkChartCard: React.FC<NetworkChartCardProps> = ({ containerId }) => {
  // ✅ Store 변경 감지: getContainer 대신 직접 selector 사용
  const containerData = useContainerStore((state) => {
    const containers = state.isPaused ? state.pausedData : state.containers;
    return containers.find((c) => c.container.containerId === containerId);
  });

  const chartRef = useRef<Chart<'line'>>(null);
  const initialLoadedRef = useRef(false);
  const prevContainerIdRef = useRef<number | null>(null);

  // 🔄 containerId 변경 감지 및 초기화
  useEffect(() => {
    if (prevContainerIdRef.current !== null && prevContainerIdRef.current !== containerId) {
      console.log(`[NetworkChartCard] 🔄 Container changed: ${prevContainerIdRef.current} → ${containerId}`);

      // 1. 플래그 초기화
      initialLoadedRef.current = false;

      // 2. 차트 데이터 클리어
      if (chartRef.current) {
        chartRef.current.data.datasets[0].data = [];
        chartRef.current.data.datasets[1].data = [];
        chartRef.current.update('none');
        console.log('[NetworkChartCard] 🧹 Chart data cleared');
      }
    }

    // 3. 이전 containerId 업데이트
    prevContainerIdRef.current = containerId;
  }, [containerId]);

  // 디버깅: containerData 변경 추적 (최소화) - 제거
  // useEffect(() => {
  //   if (containerData?.network?.rxBytesPerSec?.length > 0) {
  //     console.log('[NetworkChartCard] Time-series loaded');
  //   }
  // }, [containerData]);

  // 현재값 기반 단위 결정
  const unit = useMemo(() => {
    const rxBytesPerSec = containerData?.network?.currentRxBytesPerSec ?? 0;
    const txBytesPerSec = containerData?.network?.currentTxBytesPerSec ?? 0;
    const maxValue = Math.max(rxBytesPerSec, txBytesPerSec) * 8; // bytes/s → bits/s
    return convertNetworkSpeedAuto(maxValue).unit;
  }, [containerData]);

  // 단위 변환 함수
  const converter = useMemo(() => {
    return (bytesPerSec: number) => {
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
  }, [unit]);

  // 평균 Rx/Tx 계산 (현재값 기반)
  const avgNetwork = useMemo(() => {
    if (!containerData) {
      return { rx: '0', tx: '0', unit: 'Kbps' };
    }

    const rxBytesPerSec = containerData.network?.currentRxBytesPerSec ?? 0;
    const txBytesPerSec = containerData.network?.currentTxBytesPerSec ?? 0;

    const rxValue = converter(rxBytesPerSec);
    const txValue = converter(txBytesPerSec);

    return {
      rx: rxValue.toFixed(1),
      tx: txValue.toFixed(1),
      unit,
    };
  }, [containerData, converter, unit]);

  // 초기 데이터 로드 (REST API 시계열 데이터)
  useEffect(() => {
    console.log('[NetworkChartCard] useEffect - Initial load check:', {
      hasChart: !!chartRef.current,
      hasContainerData: !!containerData,
      alreadyLoaded: initialLoadedRef.current,
    });

    if (!chartRef.current || !containerData || initialLoadedRef.current) return;

    const chart = chartRef.current;
    const rxTimeSeries = containerData.network?.rxBytesPerSec ?? [];
    const txTimeSeries = containerData.network?.txBytesPerSec ?? [];

    console.log('[NetworkChartCard] Initial data check:', {
      rxLength: rxTimeSeries.length,
      txLength: txTimeSeries.length,
      rxSample: rxTimeSeries[0],
      txSample: txTimeSeries[0],
      currentChartRxLength: chart.data.datasets[0].data.length,
      currentChartTxLength: chart.data.datasets[1].data.length,
    });

    // 방어 로직: 차트에 이미 데이터가 있으면 중복 로드 방지
    if (chart.data.datasets[0].data.length > 0) {
      console.warn('[NetworkChartCard] ⚠️ Chart already has data, skipping load');
      initialLoadedRef.current = true;
      return;
    }

    // 시계열 배열이 비어있지 않으면 초기 데이터 로드
    if (rxTimeSeries.length > 0 || txTimeSeries.length > 0) {
      console.log('[NetworkChartCard] 🚀 Starting data load...');

      // 현재 unit 기반 converter 함수 (unit은 클로저로 캡처)
      const convertValue = (bytesPerSec: number) => {
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

      // Rx 데이터 추가
      console.log('[NetworkChartCard] Adding Rx data...');
      rxTimeSeries.forEach((point) => {
        const timestamp = new Date(point.timestamp).getTime();
        const value = convertValue(point.value);
        chart.data.datasets[0].data.push({ x: timestamp, y: value });
      });

      // Tx 데이터 추가
      console.log('[NetworkChartCard] Adding Tx data...');
      txTimeSeries.forEach((point) => {
        const timestamp = new Date(point.timestamp).getTime();
        const value = convertValue(point.value);
        chart.data.datasets[1].data.push({ x: timestamp, y: value });
      });

      console.log('[NetworkChartCard] Updating chart...');
      chart.update('none'); // 애니메이션 없이 즉시 표시
      initialLoadedRef.current = true;
      console.log('[NetworkChartCard] ✅ Initial data loaded:', {
        rxPoints: rxTimeSeries.length,
        txPoints: txTimeSeries.length,
        chartRxLength: chart.data.datasets[0].data.length,
        chartTxLength: chart.data.datasets[1].data.length,
      });
    } else {
      console.warn('[NetworkChartCard] ⚠️ No initial time-series data, waiting for REST API...');
    }
  }, [containerData, unit]);

  // 실시간 데이터 추가 (WebSocket 업데이트 감지)
  useEffect(() => {
    if (!chartRef.current || !containerData || !initialLoadedRef.current) return;

    const chart = chartRef.current;
    const rxBytesPerSec = containerData.network?.currentRxBytesPerSec ?? 0;
    const txBytesPerSec = containerData.network?.currentTxBytesPerSec ?? 0;
    const rx = converter(rxBytesPerSec);
    const tx = converter(txBytesPerSec);
    const timestamp = new Date(containerData.endTime).getTime();

    const rxData = chart.data.datasets[0].data as { x: number; y: number }[];
    const txData = chart.data.datasets[1].data as { x: number; y: number }[];

    const lastRx = rxData.at(-1);
    const lastTx = txData.at(-1);

    // 새 데이터 추가 (타임스탬프와 값이 모두 다를 때만)
    let updated = false;
    if (!lastRx || lastRx.x !== timestamp || lastRx.y !== rx) {
      rxData.push({ x: timestamp, y: rx });
      updated = true;
    }
    if (!lastTx || lastTx.x !== timestamp || lastTx.y !== tx) {
      txData.push({ x: timestamp, y: tx });
      updated = true;
    }

    if (updated) {
      chart.update('none'); // 애니메이션 없이 업데이트
    }
  }, [containerData, converter]);

  // Chart options (Time scale - 데이터 시간 기준)
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time' as const,
          time: {
            unit: 'minute' as const,
            displayFormats: {
              minute: 'HH:mm',
            },
          },
          ticks: { color: '#777' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          beginAtZero: true,
          grace: '20%', // 데이터 여유 20%
          ticks: {
            callback: (v: number | string) =>
              `${typeof v === 'number' ? v.toFixed(1) : v} ${unit}`,
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
              `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ${unit}`,
          },
        },
      },
    }),
    [unit]
  );

  // 초기 차트 데이터
  const initialChartData = useMemo(
    () => ({
      datasets: [
        {
          label: 'Rx',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: false,
          data: [] as { x: number; y: number }[],
        },
        {
          label: 'Tx',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          data: [] as { x: number; y: number }[],
        },
      ],
    }),
    []
  );

  return (
    <div className="mt-3.5 bg-white w-full h-[308px] rounded-xl border border-border-light p-4">
      {/* Header Section */}
      <div className="flex items-center gap-2 border-b border-border-light pb-3 px-3 mb-4">
        <p className="text-[#505050] font-semibold text-xl">Network</p>
        <div className="flex items-center gap-3 ml-4">
          {/* Rx */}
          <div className="bg-white rounded-lg px-2.5 py-[5px] flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 12L8 4M8 4L5 7M8 4L11 7"
                stroke="#0492f4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-text-secondary text-sm">Rx</p>
            <p className="text-[#0492f4] text-sm">{avgNetwork.rx}</p>
            <p className="text-text-secondary text-xs">{avgNetwork.unit}</p>
          </div>

          <div className="text-text-secondary text-xs">|</div>

          {/* Tx */}
          <div className="bg-white rounded-lg px-2.5 py-[5px] flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 4L8 12M8 12L11 9M8 12L5 9"
                stroke="#14ba6d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-text-secondary text-sm">Tx</p>
            <p className="text-[#14ba6d] text-sm">{avgNetwork.tx}</p>
            <p className="text-text-secondary text-xs">{avgNetwork.unit}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-[225px] bg-gray-50 rounded-lg p-2">
        <Line ref={chartRef} data={initialChartData} options={options} />
      </div>
    </div>
  );
};
