/********************************************************************************************
 * 🌐 NetworkChartCard.tsx (Realtime Streaming - Optimized)
 * ─────────────────────────────────────────────
 * Dashboard용 네트워크 Rx/Tx 실시간 스트리밍 카드
 *
 * 🎯 최적화 전략:
 * 1. React state 제거 → 재렌더링 최소화
 * 2. timelineRef (단일 진실) → REST + List WS + Detail WS 통합
 * 3. bufferRef → onRefresh에서 push만 수행
 * 4. splice 사용 → 배열 레퍼런스 유지
 * 5. Detail WS patch → 덩어리 교체 대신 부분 보정
 ********************************************************************************************/
import React, { useMemo, useRef, useEffect, useCallback } from 'react';
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

interface NetworkChartCardProps {
  containerId: number;
}

interface ChartPoint {
  x: number;  // timestamp (ms)
  y: number;  // 변환된 값
}

export const NetworkChartCard: React.FC<NetworkChartCardProps> = ({ containerId }) => {
  // ✅ Store 변경 감지
  const containerData = useContainerStore((state) => {
    const containers = state.isPaused ? state.pausedData : state.containers;
    return containers.find((c) => c.container.containerId === containerId);
  });

  // ✅ Ref 구조 (React state 제거)
  const chartRef = useRef<Chart<'line'> | null>(null);
  const prevContainerIdRef = useRef<number | null>(null);

  // 단일 진실 원천: timeline (REST + List WS + Detail WS 통합)
  const timelineRef = useRef<{
    rx: Map<number, number>;  // timestamp → value (bytes/sec)
    tx: Map<number, number>;
  }>({ rx: new Map(), tx: new Map() });

  // onRefresh에서 push할 데이터
  const bufferRef = useRef<{
    rx: ChartPoint[];
    tx: ChartPoint[];
  }>({ rx: [], tx: [] });

  // 마지막으로 차트에 push한 timestamp
  const lastPushedTimestampRef = useRef<number>(0);

  // 🔄 containerId 변경 감지 및 초기화
  useEffect(() => {
    if (prevContainerIdRef.current !== null && prevContainerIdRef.current !== containerId) {
      console.log(`[NetworkChartCard] 🔄 Container changed: ${prevContainerIdRef.current} → ${containerId}`);

      // 모든 데이터 클리어
      timelineRef.current.rx.clear();
      timelineRef.current.tx.clear();
      bufferRef.current.rx = [];
      bufferRef.current.tx = [];
      lastPushedTimestampRef.current = 0;

      // 차트 데이터 클리어
      if (chartRef.current) {
        chartRef.current.data.datasets[0].data = [];
        chartRef.current.data.datasets[1].data = [];
        chartRef.current.update('none');
      }
    }

    prevContainerIdRef.current = containerId;
  }, [containerId]);

  // 현재값 기반 단위 결정
  const unit = useMemo(() => {
    const rxBytesPerSec = containerData?.network?.currentRxBytesPerSec ?? 0;
    const txBytesPerSec = containerData?.network?.currentTxBytesPerSec ?? 0;
    const maxValue = Math.max(rxBytesPerSec, txBytesPerSec);
    return convertNetworkSpeedAuto(maxValue).unit;
  }, [containerData]);

  // 단위 변환 함수 (bytes/s → 지정된 단위로 통일)
  const converter = useCallback((bytesPerSec: number) => {
    // formatters.ts의 상수값과 동일하게 사용
    const BYTE_TO_BIT = 8;
    const DECIMAL_BASE = 1000;
    const bitsPerSec = bytesPerSec * BYTE_TO_BIT;

    switch (unit) {
      case 'Kbps':
        return bitsPerSec / DECIMAL_BASE;
      case 'Mbps':
        return bitsPerSec / (DECIMAL_BASE ** 2);
      case 'Gbps':
        return bitsPerSec / (DECIMAL_BASE ** 3);
      default:
        return bitsPerSec / DECIMAL_BASE;
    }
  }, [unit]);

  // ✅ converter 최신값 유지 (주의사항 반영)
  const convertRef = useRef(converter);
  useEffect(() => {
    convertRef.current = converter;
  }, [converter]);

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

  // ✅ Detail WS 데이터를 timelineRef에 patch
  const patchTimeline = useCallback((
    incomingTimeSeries: { timestamp: string; value: number }[] | undefined,
    type: 'rx' | 'tx'
  ) => {
    if (!incomingTimeSeries || incomingTimeSeries.length === 0) return;

    console.log(`[NetworkChartCard] 📦 Patching ${type} timeline:`, {
      incomingCount: incomingTimeSeries.length,
      existingCount: timelineRef.current[type].size,
    });

    // timelineRef에 merge (같은 timestamp면 덮어쓰기, 새 것은 추가)
    incomingTimeSeries.forEach(point => {
      const timestamp = new Date(point.timestamp).getTime();
      timelineRef.current[type].set(timestamp, point.value);
    });

    console.log(`[NetworkChartCard] ✅ Timeline patched:`, {
      type,
      totalCount: timelineRef.current[type].size,
    });
  }, []);

  // ✅ timelineRef의 새 데이터를 bufferRef로 이동
  const syncBufferFromTimeline = useCallback(() => {
    const lastTimestamp = lastPushedTimestampRef.current;
    let newPointsAdded = false;

    // Rx 처리
    const rxSorted = Array.from(timelineRef.current.rx.entries())
      .filter(([timestamp]) => timestamp > lastTimestamp)
      .sort(([a], [b]) => a - b);

    if (rxSorted.length > 0) {
      const rxPoints = rxSorted.map(([timestamp, value]) => ({
        x: timestamp,
        y: convertRef.current(value), // 최신 converter 사용
      }));
      bufferRef.current.rx.push(...rxPoints);
      newPointsAdded = true;
    }

    // Tx 처리
    const txSorted = Array.from(timelineRef.current.tx.entries())
      .filter(([timestamp]) => timestamp > lastTimestamp)
      .sort(([a], [b]) => a - b);

    if (txSorted.length > 0) {
      const txPoints = txSorted.map(([timestamp, value]) => ({
        x: timestamp,
        y: convertRef.current(value), // 최신 converter 사용
      }));
      bufferRef.current.tx.push(...txPoints);
      newPointsAdded = true;
    }

    if (newPointsAdded) {
      // 최신 타임스탬프 업데이트
      const allTimestamps = [
        ...Array.from(timelineRef.current.rx.keys()),
        ...Array.from(timelineRef.current.tx.keys()),
      ];
      if (allTimestamps.length > 0) {
        lastPushedTimestampRef.current = Math.max(...allTimestamps);
      }

      console.log('[NetworkChartCard] 🔄 Buffer synced:', {
        rxBufferSize: bufferRef.current.rx.length,
        txBufferSize: bufferRef.current.tx.length,
        lastPushedTimestamp: new Date(lastPushedTimestampRef.current).toISOString(),
      });
    }
  }, []);

  // ✅ Store 데이터 변경 감지 및 patch
  useEffect(() => {
    if (!containerData?.network) return;

    const rxTimeSeries = containerData.network.rxBytesPerSec ?? [];
    const txTimeSeries = containerData.network.txBytesPerSec ?? [];

    // Detail WS에서 time-series가 왔으면 patch
    if (rxTimeSeries.length > 0) {
      patchTimeline(rxTimeSeries, 'rx');
    }
    if (txTimeSeries.length > 0) {
      patchTimeline(txTimeSeries, 'tx');
    }

    // List WS에서 현재값만 왔으면 직접 추가
    const currentRx = containerData.network.currentRxBytesPerSec;
    const currentTx = containerData.network.currentTxBytesPerSec;

    if (rxTimeSeries.length === 0 && currentRx !== undefined && !isNaN(currentRx)) {
      const now = Date.now();
      timelineRef.current.rx.set(now, currentRx);
      console.log('[NetworkChartCard] 📍 List WS - Rx current value added:', { now, value: currentRx });
    }
    if (txTimeSeries.length === 0 && currentTx !== undefined && !isNaN(currentTx)) {
      const now = Date.now();
      timelineRef.current.tx.set(now, currentTx);
      console.log('[NetworkChartCard] 📍 List WS - Tx current value added:', { now, value: currentTx });
    }

    // bufferRef 동기화
    syncBufferFromTimeline();
  }, [containerData, patchTimeline, syncBufferFromTimeline]);

  // ✅ Chart options (Realtime scale - splice 사용)
  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // 애니메이션 비활성화 (성능 향상)
      scales: {
        x: {
          type: 'realtime',
          realtime: {
            duration: 180000, // 3분 윈도우
            delay: 2000, // 2초 딜레이
            refresh: 1000, // 1초마다 갱신
            onRefresh: (chart: Chart<'line'>) => {
              // 1. bufferRef의 데이터를 chart에 push (참조 유지)
              const rxDataset = chart.data.datasets[0].data as ChartPoint[];
              const txDataset = chart.data.datasets[1].data as ChartPoint[];

              if (bufferRef.current.rx.length > 0) {
                rxDataset.push(...bufferRef.current.rx);
                console.log(`[NetworkChartCard] ➕ Pushed ${bufferRef.current.rx.length} Rx points`);
                bufferRef.current.rx = [];
              }
              if (bufferRef.current.tx.length > 0) {
                txDataset.push(...bufferRef.current.tx);
                console.log(`[NetworkChartCard] ➕ Pushed ${bufferRef.current.tx.length} Tx points`);
                bufferRef.current.tx = [];
              }

              // 2. 오래된 데이터 삭제 (splice로 참조 유지)
              const now = Date.now();
              const cutoff = now - 180000; // 3분

              // Rx 삭제
              let rxIdx = 0;
              while (rxIdx < rxDataset.length && rxDataset[rxIdx].x < cutoff) {
                rxIdx++;
              }
              if (rxIdx > 0) {
                rxDataset.splice(0, rxIdx);
                console.log(`[NetworkChartCard] 🗑️ Removed ${rxIdx} old Rx points`);
              }

              // Tx 삭제
              let txIdx = 0;
              while (txIdx < txDataset.length && txDataset[txIdx].x < cutoff) {
                txIdx++;
              }
              if (txIdx > 0) {
                txDataset.splice(0, txIdx);
                console.log(`[NetworkChartCard] 🗑️ Removed ${txIdx} old Tx points`);
              }
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
    [unit]
  );

  // ✅ 차트 데이터 (고정된 레퍼런스 - 한 번만 생성)
  const chartData = useMemo(() => ({
    datasets: [
      {
        label: 'Rx',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        data: [] as ChartPoint[],  // 빈 배열로 시작, onRefresh에서 push
      },
      {
        label: 'Tx',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        data: [] as ChartPoint[],
      },
    ],
  }), []); // ✅ 재렌더링 없음

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
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};