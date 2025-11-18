/********************************************************************************************
 * 🌐 NetworkChartCard.tsx (Realtime Streaming)
 * ─────────────────────────────────────────────
 * Dashboard용 네트워크 Rx/Tx 실시간 스트리밍 카드
 * - Store에서 시계열 데이터 가져오기 (REST API + WebSocket 병합)
 * - Realtime scale 사용 (chartjs-plugin-streaming)
 ********************************************************************************************/
import React, { useMemo, useRef, useEffect, useState } from 'react';
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
import type { TooltipItem, Chart, ChartOptions } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { convertNetworkSpeedAuto } from '@/shared/lib/formatters';

// Chart.js 등록 (streaming plugin 추가)
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

interface NetworkChartCardProps {
  containerId: number;
}

interface RealtimeDataset {
  label: string;
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  fill: boolean;
  data: { x: number; y: number }[];
}

export const NetworkChartCard: React.FC<NetworkChartCardProps> = ({ containerId }) => {
  // ✅ Store 변경 감지: containerData 가져오기
  const containerData = useContainerStore((state) => {
    const containers = state.isPaused ? state.pausedData : state.containers;
    return containers.find((c) => c.container.containerId === containerId);
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [datasetVersion, setDatasetVersion] = useState(0); // 차트 재렌더링 트리거
  const datasetMapRef = useRef<Map<'rx' | 'tx', RealtimeDataset>>(new Map());
  const prevContainerIdRef = useRef<number | null>(null);

  // 🔄 containerId 변경 감지 및 초기화
  useEffect(() => {
    if (prevContainerIdRef.current !== null && prevContainerIdRef.current !== containerId) {
      console.log(`[NetworkChartCard] 🔄 Container changed: ${prevContainerIdRef.current} → ${containerId}`);

      // 데이터 클리어
      datasetMapRef.current.clear();
      setIsInitialized(false);
      setDatasetVersion(0);
    }

    prevContainerIdRef.current = containerId;
  }, [containerId]);

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

  // 초기 데이터 로드 (Store의 시계열 데이터 사용)
  useEffect(() => {
    if (!containerData) return;

    const rxTimeSeries = containerData.network?.rxBytesPerSec ?? [];
    const txTimeSeries = containerData.network?.txBytesPerSec ?? [];

    console.log('[NetworkChartCard] 📊 Checking Store data:', {
      containerId,
      rxTimeSeriesLength: rxTimeSeries.length,
      txTimeSeriesLength: txTimeSeries.length,
      isInitialized,
    });

    // 데이터가 없으면 초기화하지 않음 (REST API 대기 중)
    if (rxTimeSeries.length === 0 && txTimeSeries.length === 0) {
      console.log('[NetworkChartCard] ⏳ No time-series data yet, waiting for REST API...');
      return;
    }

    // 이미 같은 데이터로 초기화되어 있으면 스킵
    const currentRxData = datasetMapRef.current.get('rx')?.data ?? [];
    if (isInitialized && currentRxData.length === rxTimeSeries.length && rxTimeSeries.length > 0) {
      console.log('[NetworkChartCard] ✓ Already initialized with same data, skipping...');
      return;
    }

    console.log('[NetworkChartCard] 🔄 Initializing/Re-initializing with Store data...');

    // 시계열 데이터 변환
    const rxData: { x: number; y: number }[] = rxTimeSeries.map((point) => ({
      x: new Date(point.timestamp).getTime(),
      y: converter(point.value),
    }));

    const txData: { x: number; y: number }[] = txTimeSeries.map((point) => ({
      x: new Date(point.timestamp).getTime(),
      y: converter(point.value),
    }));

    // Dataset 생성 또는 업데이트
    datasetMapRef.current.set('rx', {
      label: 'Rx',
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: false,
      data: rxData,
    });

    datasetMapRef.current.set('tx', {
      label: 'Tx',
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: false,
      data: txData,
    });

    console.log('[NetworkChartCard] ✅ Initialized with Store data:', {
      rxPoints: rxData.length,
      txPoints: txData.length,
    });

    setIsInitialized(true);
    setDatasetVersion((prev) => prev + 1); // 차트 재렌더링 트리거
  }, [containerData, converter, isInitialized, containerId]);

  // Chart options (Realtime scale - streaming)
  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'realtime',
          realtime: {
            duration: 180000, // 3분 윈도우 (1분 초기 + 2분 실시간)
            delay: 2000, // 2초 딜레이
            refresh: 1000, // 1초마다 갱신
            onRefresh: (chart: Chart<'line'>) => {
              // WebSocket 데이터 추가
              if (!containerData) return;

              const rxDataset = datasetMapRef.current.get('rx');
              const txDataset = datasetMapRef.current.get('tx');

              if (!rxDataset || !txDataset) return;

              const now = Date.now();
              const duration = 180000; // 3분 윈도우

              // 1. 오래된 데이터 제거 (3분 윈도우 밖)
              const cutoffTime = now - duration;
              rxDataset.data = rxDataset.data.filter(point => point.x >= cutoffTime);
              txDataset.data = txDataset.data.filter(point => point.x >= cutoffTime);

              // 2. 새 데이터 추가
              const rxBytesPerSec = containerData.network?.currentRxBytesPerSec ?? 0;
              const txBytesPerSec = containerData.network?.currentTxBytesPerSec ?? 0;
              const rx = converter(rxBytesPerSec);
              const tx = converter(txBytesPerSec);
              const timestamp = new Date(containerData.endTime).getTime();

              const lastRx = rxDataset.data.at(-1);
              const lastTx = txDataset.data.at(-1);

              // 새 데이터 추가 (중복 방지)
              if (!lastRx || lastRx.x !== timestamp || lastRx.y !== rx) {
                rxDataset.data.push({ x: timestamp, y: rx });
              }
              if (!lastTx || lastTx.x !== timestamp || lastTx.y !== tx) {
                txDataset.data.push({ x: timestamp, y: tx });
              }

              // ✅ datasets는 이미 참조가 유지되므로 재할당 불필요
              // chart.data.datasets는 초기화 시 한 번만 설정됨
            },
          },
          ticks: { color: '#777' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        y: {
          beginAtZero: true,
          grace: '20%',
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
    [unit, containerData, converter]
  );

  // 차트 데이터
  const chartData = useMemo(() => {
    const datasets = Array.from(datasetMapRef.current.values());
    console.log('[NetworkChartCard] 📈 Chart data recalculated:', {
      datasetsCount: datasets.length,
      rxDataPoints: datasets[0]?.data?.length ?? 0,
      txDataPoints: datasets[1]?.data?.length ?? 0,
      datasetVersion,
    });
    return { datasets };
  }, [datasetVersion]); // datasetVersion 변경 시 재렌더링

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
      <div className="w-full h-[225px] bg-gray-50 rounded-lg p-2 relative">
        {!isInitialized ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">데이터 로딩 중...</p>
            </div>
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};
