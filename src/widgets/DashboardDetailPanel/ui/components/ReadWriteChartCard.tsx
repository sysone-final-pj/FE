/**
 작성자: 김슬기
 */
/********************************************************************************************
 * ReadWriteChartCard.tsx (Optimized - Realtime Streaming)
 * ─────────────────────────────────────────────
 * Dashboard용 Block I/O Read/Write 실시간 스트리밍 카드
 *
 * 최적화 전략:
 * 1. Realtime scale + streaming plugin 사용
 * 2. timelineRef (단일 진실) → REST + List WS + Detail WS 통합
 * 3. bufferRef → onRefresh에서 push만 수행
 * 4. splice 사용 → 배열 레퍼런스 유지
 * 5. Detail WS patch → 덩어리 교체 대신 부분 보정
 * 6. bytes/sec 값 그대로 사용 (단위 변환만 적용)
 ********************************************************************************************/
import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-date-fns';

import type { Chart, ChartOptions } from 'chart.js';

// Chart.js 등록
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  streamingPlugin
);

import { useSelectedContainerStore } from '@/shared/stores/useSelectedContainerStore';
import { convertBytesPerSecAuto } from '@/shared/lib/formatters';

interface ReadWriteChartCardProps {
  containerId: number;
}

interface ChartPoint {
  x: number;  // timestamp (ms)
  y: number;  // 선택된 단위로 변환된 값
}

export const ReadWriteChartCard: React.FC<ReadWriteChartCardProps> = ({ containerId }) => {
  // Selected Container Store에서 직접 구독 (List WebSocket 배열 교체 영향 없음)
  const containerData = useSelectedContainerStore((state) => state.selectedContainer);

  // Ref 구조
  const chartRef = useRef<Chart<'bar', ChartPoint[]> | null>(null);
  const prevContainerIdRef = useRef<number | null>(null);

  // 단일 진실 원천: timeline (REST + List WS + Detail WS 통합)
  // bytes/sec 값 저장 (이미 변환된 값)
  const timelineRef = useRef<{
    read: Map<number, number>;  // timestamp → bytes/sec
    write: Map<number, number>;
  }>({ read: new Map(), write: new Map() });

  // onRefresh에서 push할 데이터
  const bufferRef = useRef<{
    read: ChartPoint[];
    write: ChartPoint[];
  }>({ read: [], write: [] });

  // 마지막으로 차트에 push한 timestamp
  const lastPushedTimestampRef = useRef<number>(0);

  // containerId 변경 감지 및 초기화
  useEffect(() => {
    if (prevContainerIdRef.current !== null && prevContainerIdRef.current !== containerId) {

      // 모든 데이터 클리어
      timelineRef.current.read.clear();
      timelineRef.current.write.clear();
      bufferRef.current.read = [];
      bufferRef.current.write = [];
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

  // Block I/O 데이터 존재 여부 확인 (EXITED 상태면 데이터 없음 처리)
  const hasBlockIOData = useMemo(() => {
    if (!containerData?.blockIO) return false;
    // EXITED 상태면 데이터 없음 처리
    if (containerData.container.state === 'EXITED') return false;
    return true;
  }, [containerData]);

  // 평균 Read/Write 계산 (현재값 기준)
  // 백엔드에서 bytes/sec 값으로 전송됨
  const avgMetrics = useMemo(() => {


    if (!containerData?.blockIO || !hasBlockIOData) {
      return {
        read: '0',
        write: '0',
        unit: 'B/s' as const,
        divisor: 1,
      };
    }

    const readVal = containerData.blockIO.currentBlkReadPerSec ?? 0;
    const writeVal = containerData.blockIO.currentBlkWritePerSec ?? 0;


    // 단위는 두 값의 최대값 기반으로 자동 결정
    const { unit } = convertBytesPerSecAuto(Math.max(readVal, writeVal));

    const unitIndex = ['B/s', 'KB/s', 'MB/s', 'GB/s'].indexOf(unit);
    const divisor = 1024 ** unitIndex;

    return {
      read: (readVal / divisor).toFixed(1),
      write: (writeVal / divisor).toFixed(1),
      unit,
      divisor,
    };
  }, [containerData, hasBlockIOData]);

  // 단위 변환 함수 (차트용)
  const converter = useCallback(
    (bytesPerSec: number | null | undefined) => {
      if (!bytesPerSec || Number.isNaN(bytesPerSec)) return 0;
      return bytesPerSec / avgMetrics.divisor;
    },
    [avgMetrics.divisor]
  );

  // converter 최신값 유지
  const convertRef = useRef(converter);
  useEffect(() => {
    convertRef.current = converter;
  }, [converter]);

  // Detail WS / REST 데이터를 timelineRef에 patch
  const patchTimeline = useCallback(
    (
      incomingTimeSeries: { timestamp: string; value: number }[] | undefined,
      type: 'read' | 'write'
    ) => {
      if (!incomingTimeSeries || incomingTimeSeries.length === 0) return;


      // timelineRef에 bytes/sec 값 그대로 저장
      incomingTimeSeries.forEach((point) => {
        const timestamp = new Date(point.timestamp).getTime();
        timelineRef.current[type].set(timestamp, point.value); // bytes/sec
      });

    },
    []
  );

  // timelineRef의 새 데이터를 bufferRef로 이동 (값 그대로 사용)
  const syncBufferFromTimeline = useCallback(() => {
    const lastTimestamp = lastPushedTimestampRef.current;
    let newPointsAdded = false;

    // Read 처리 - 값 그대로 사용 (이미 bytes/sec)
    const readSorted = Array.from(timelineRef.current.read.entries())
      .filter(([timestamp]) => timestamp > lastTimestamp)
      .sort(([a], [b]) => a - b);

    if (readSorted.length > 0) {
      const readPoints = readSorted.map(([timestamp, value]) => ({
        x: timestamp,
        y: convertRef.current(value), // 선택된 단위로 변환
      }));
      bufferRef.current.read.push(...readPoints);
      newPointsAdded = true;
    }

    // Write 처리 - 값 그대로 사용 (이미 bytes/sec)
    const writeSorted = Array.from(timelineRef.current.write.entries())
      .filter(([timestamp]) => timestamp > lastTimestamp)
      .sort(([a], [b]) => a - b);

    if (writeSorted.length > 0) {
      const writePoints = writeSorted.map(([timestamp, value]) => ({
        x: timestamp,
        y: convertRef.current(value), // 선택된 단위로 변환
      }));
      bufferRef.current.write.push(...writePoints);
      newPointsAdded = true;
    }

    if (newPointsAdded) {
      // 최신 타임스탬프 업데이트
      const allTimestamps = [
        ...Array.from(timelineRef.current.read.keys()),
        ...Array.from(timelineRef.current.write.keys()),
      ];
      if (allTimestamps.length > 0) {
        lastPushedTimestampRef.current = Math.max(...allTimestamps);
      }

    }
  }, []);

  // Store 데이터 변경 감지 및 patch
  useEffect(() => {
    if (!containerData?.blockIO) return;

    // 현재 선택된 컨테이너의 데이터인지 확인 (stale data 방지)
    if (containerData.container.containerId !== containerId) {
      return;
    }

    const readTimeSeries = containerData.blockIO.blkReadPerSec ?? [];
    const writeTimeSeries = containerData.blockIO.blkWritePerSec ?? [];

    // Detail WS / REST에서 time-series가 왔으면 patch (bytes/sec 값)
    if (readTimeSeries.length > 0) {
      patchTimeline(readTimeSeries, 'read');
    }
    if (writeTimeSeries.length > 0) {
      patchTimeline(writeTimeSeries, 'write');
    }

    // List WS에서 현재값만 왔으면 직접 추가 (bytes/sec 값)
    const currentRead = containerData.blockIO.currentBlkReadPerSec;
    const currentWrite = containerData.blockIO.currentBlkWritePerSec;

    if (readTimeSeries.length === 0 && currentRead !== undefined && !isNaN(currentRead)) {
      const now = Date.now();
      timelineRef.current.read.set(now, currentRead);
    }
    if (writeTimeSeries.length === 0 && currentWrite !== undefined && !isNaN(currentWrite)) {
      const now = Date.now();
      timelineRef.current.write.set(now, currentWrite);
    }

    // bufferRef 동기화
    syncBufferFromTimeline();
  }, [containerData, containerId, patchTimeline, syncBufferFromTimeline]);

  // Chart options (Realtime scale - splice 사용)
const options = useMemo<ChartOptions<'bar'>>(
  () => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    parsing: false, // {x, y} 그대로 쓰기

    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 180000,
          delay: 2000,
          refresh: 1000,
          onRefresh: (chart: Chart<'bar'>) => {
            const readDataset = chart.data.datasets[0].data as any;
            const writeDataset = chart.data.datasets[1].data as any;

            if (bufferRef.current.read.length > 0) {
              readDataset.push(...bufferRef.current.read);
              bufferRef.current.read = [];
            }
            if (bufferRef.current.write.length > 0) {
              writeDataset.push(...bufferRef.current.write);
              bufferRef.current.write = [];
            }

            // 오래된 데이터 제거
            const now = Date.now();
            const cutoff = now - 180000;

            while (readDataset.length > 0 && readDataset[0].x < cutoff)
              readDataset.shift();

            while (writeDataset.length > 0 && writeDataset[0].x < cutoff)
              writeDataset.shift();
          },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#777' },
      },

      y: {
        beginAtZero: true,
        grace: '20%',
        min: 0,
        ticks: {
          callback: (v: any) => v.toFixed(1), // 단위는 다음 단계에서 수정
          color: '#777',
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },

    plugins: {
      legend: { display: false },
      tooltip: {
        intersect: false,
        mode: 'index',
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}`, // 단위는 다음 단계에서 처리
        },
      },
    },
  }),
  []
);
  const toggleDataset = (datasetIndex: number) => {
    const chart = chartRef.current;
    if (!chart) return;

    const meta = chart.getDatasetMeta(datasetIndex);
    const isVisible = meta.hidden !== true;

    chart.setDatasetVisibility(datasetIndex, !isVisible);
    chart.update();
  };


  // 차트 데이터 (고정된 레퍼런스, key로 리셋)
const chartData = useMemo(
  () => ({
    datasets: [
      {
        label: 'Read',
        backgroundColor: 'rgba(137, 121, 255)',
        borderColor: '#8979ff',
        borderWidth: 0,
        barThickness: 4,
        maxBarThickness: 4,
        categoryPercentage: 1.0,
        barPercentage: 1.0,
        minBarLength: 2,
        data: [] as ChartPoint[],
      },
      {
        label: 'Write',
        backgroundColor: 'rgba(255, 146, 138)',
        borderColor: '#ff928a',
        borderWidth: 0,
        barThickness: 4,
        maxBarThickness: 4,
        categoryPercentage: 1.0,
        barPercentage: 1.0,
        minBarLength: 2,
        data: [] as ChartPoint[],
      },
    ],
  }),
  []
);


  return (
    <div className=" bg-white w-full h-[203px] rounded-xl border border-border-light p-4">
      {/* Header Section */}
      <div className="flex items-center gap-2 mb-3">
        <p className="text-text-primary font-semibold text-xl">Read / Write</p>
        <div className="flex items-center gap-4 ml-4 text-xs">
          {/* READ */}
          <button
            onClick={() => toggleDataset(0)}
            className="flex items-center gap-1 cursor-pointer select-none"
          >
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{
                backgroundColor: 'rgba(137, 121, 255, 0.1)',
                border: '2px solid #8979ff',
              }}
            ></span>
            Read :
            <span className="text-[#8979ff] font-medium">{avgMetrics.read}</span>
            {avgMetrics.unit}
          </button>

          <span>|</span>

          {/* WRITE */}
          <button
            onClick={() => toggleDataset(1)}
            className="flex items-center gap-1 cursor-pointer select-none"
          >
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{
                backgroundColor: 'rgba(255, 146, 138, 0.1)',
                border: '2px solid #ff928a',
              }}
            ></span>
            Write :
            <span className="text-[#ff928a] font-medium">{avgMetrics.write}</span>
            {avgMetrics.unit}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[140px] rounded-lg mt-3 p-3">
        {hasBlockIOData ? (
          <Bar ref={chartRef} data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            수신 된 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};