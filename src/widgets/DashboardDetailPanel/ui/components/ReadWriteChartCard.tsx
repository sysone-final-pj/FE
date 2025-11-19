
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
 * 6. 누적값 → bytes/sec 변환
 ********************************************************************************************/
import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';

import type { TooltipItem, Chart, ChartOptions } from 'chart.js';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { convertBytesPerSecAuto } from '@/shared/lib/formatters';

interface ReadWriteChartCardProps {
  containerId: number;
}

interface ChartPoint {
  x: number;  // timestamp (ms)
  y: number;  // 변환된 값 (bytes/sec)
}

export const ReadWriteChartCard: React.FC<ReadWriteChartCardProps> = ({ containerId }) => {
  // Store 변경 감지
  const containerData = useContainerStore((state) => {
    const containers = state.isPaused ? state.pausedData : state.containers;
    return containers.find((c) => c.container.containerId === containerId);
  });

  // Ref 구조
  const chartRef = useRef<Chart<'line'> | null>(null);
  const prevContainerIdRef = useRef<number | null>(null);

  // 단일 진실 원천: timeline (REST + List WS + Detail WS 통합)
  // 누적값(cumulative bytes) 저장
  const timelineRef = useRef<{
    read: Map<number, number>;  // timestamp → cumulative bytes
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
      console.log(`[ReadWriteChartCard] 🔄 Container changed: ${prevContainerIdRef.current} → ${containerId}`);

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

  // Block I/O 데이터 존재 여부 확인
  const hasBlockIOData = useMemo(() => {
    if (!containerData?.blockIO) return false;
    return (
      containerData.blockIO.currentBlkReadPerSec !== undefined ||
      containerData.blockIO.currentBlkWritePerSec !== undefined
    );
  }, [containerData]);

  // 평균 Read/Write 계산 (현재값 기준)
  // 주의: 백엔드가 bytes/sec를 보내는지, 누적값을 보내는지 확인 필요
  const avgMetrics = useMemo(() => {
    if (!containerData?.blockIO || !hasBlockIOData) {
      return { read: '0', write: '0', unit: 'B/s' as const };
    }

    // 현재값이 누적값인 경우 이전값과 비교 필요
    // 하지만 단순 표시용이므로 일단 그대로 사용
    const readVal = containerData.blockIO.currentBlkReadPerSec ?? 0;
    const writeVal = containerData.blockIO.currentBlkWritePerSec ?? 0;

    const maxValue = Math.max(readVal, writeVal);
    const { unit } = convertBytesPerSecAuto(maxValue);

    const BINARY_BASE = 1024;
    const unitIndex = ['B/s', 'KB/s', 'MB/s', 'GB/s'].indexOf(unit);
    const divisor = BINARY_BASE ** unitIndex;

    return {
      read: (readVal / divisor).toFixed(1),
      write: (writeVal / divisor).toFixed(1),
      unit,
    };
  }, [containerData, hasBlockIOData]);

  // 단위 변환 함수
  const converter = useCallback((bytesPerSec: number | null | undefined) => {
    if (bytesPerSec == null) return 0;
    const BINARY_BASE = 1024;
    const unitIndex = ['B/s', 'KB/s', 'MB/s', 'GB/s'].indexOf(avgMetrics.unit);
    const divisor = BINARY_BASE ** unitIndex;
    return bytesPerSec / divisor;
  }, [avgMetrics.unit]);

  // converter 최신값 유지
  const convertRef = useRef(converter);
  useEffect(() => {
    convertRef.current = converter;
  }, [converter]);

  // Detail WS 데이터를 timelineRef에 patch
  const patchTimeline = useCallback((
    incomingTimeSeries: { timestamp: string; value: number }[] | undefined,
    type: 'read' | 'write'
  ) => {
    if (!incomingTimeSeries || incomingTimeSeries.length === 0) return;

    console.log(`[ReadWriteChartCard] 📦 Patching ${type} timeline:`, {
      incomingCount: incomingTimeSeries.length,
      existingCount: timelineRef.current[type].size,
    });

    //  timelineRef에는 누적값 그대로 저장
    incomingTimeSeries.forEach(point => {
      const timestamp = new Date(point.timestamp).getTime();
      timelineRef.current[type].set(timestamp, point.value); // 누적값
    });

    console.log(`[ReadWriteChartCard] Timeline patched:`, {
      type,
      totalCount: timelineRef.current[type].size,
    });
  }, []);

  // timelineRef의 새 데이터를 bufferRef로 이동 (누적값 → bytes/sec 변환)
  const syncBufferFromTimeline = useCallback(() => {
    const lastTimestamp = lastPushedTimestampRef.current;
    let newPointsAdded = false;

    // Read 처리
    const readSorted = Array.from(timelineRef.current.read.entries())
      .filter(([timestamp]) => timestamp > lastTimestamp)
      .sort(([a], [b]) => a - b);

    if (readSorted.length > 0) {
      // 누적값 → bytes/sec 변환
      const readPoints: ChartPoint[] = [];

      readSorted.forEach(([timestamp, cumulativeBytes], idx) => {
        if (idx === 0) {
          // 첫 번째: 이전 timeline에서 가장 가까운 값 찾기
          const prevEntries = Array.from(timelineRef.current.read.entries())
            .filter(([ts]) => ts < timestamp)
            .sort(([a], [b]) => b - a);

          if (prevEntries.length > 0) {
            const [prevTimestamp, prevBytes] = prevEntries[0];
            const bytes = cumulativeBytes - prevBytes;
            const timeMs = timestamp - prevTimestamp;
            const bytesPerSec = timeMs > 0 ? (bytes / timeMs) * 1000 : 0;

            readPoints.push({
              x: timestamp,
              y: convertRef.current(Math.max(0, bytesPerSec)),
            });
          } else {
            // 이전 데이터 없으면 0
            readPoints.push({ x: timestamp, y: 0 });
          }
        } else {
          // 이후: 이전 포인트와 비교
          const [prevTimestamp, prevBytes] = readSorted[idx - 1];
          const bytes = cumulativeBytes - prevBytes;
          const timeMs = timestamp - prevTimestamp;
          const bytesPerSec = timeMs > 0 ? (bytes / timeMs) * 1000 : 0;

          readPoints.push({
            x: timestamp,
            y: convertRef.current(Math.max(0, bytesPerSec)),
          });
        }
      });

      bufferRef.current.read.push(...readPoints);
      newPointsAdded = true;
    }

    // Write 처리
    const writeSorted = Array.from(timelineRef.current.write.entries())
      .filter(([timestamp]) => timestamp > lastTimestamp)
      .sort(([a], [b]) => a - b);

    if (writeSorted.length > 0) {
      // 누적값 → bytes/sec 변환
      const writePoints: ChartPoint[] = [];

      writeSorted.forEach(([timestamp, cumulativeBytes], idx) => {
        if (idx === 0) {
          // 첫 번째: 이전 timeline에서 가장 가까운 값 찾기
          const prevEntries = Array.from(timelineRef.current.write.entries())
            .filter(([ts]) => ts < timestamp)
            .sort(([a], [b]) => b - a);

          if (prevEntries.length > 0) {
            const [prevTimestamp, prevBytes] = prevEntries[0];
            const bytes = cumulativeBytes - prevBytes;
            const timeMs = timestamp - prevTimestamp;
            const bytesPerSec = timeMs > 0 ? (bytes / timeMs) * 1000 : 0;

            writePoints.push({
              x: timestamp,
              y: convertRef.current(Math.max(0, bytesPerSec)),
            });
          } else {
            // 이전 데이터 없으면 0
            writePoints.push({ x: timestamp, y: 0 });
          }
        } else {
          // 이후: 이전 포인트와 비교
          const [prevTimestamp, prevBytes] = writeSorted[idx - 1];
          const bytes = cumulativeBytes - prevBytes;
          const timeMs = timestamp - prevTimestamp;
          const bytesPerSec = timeMs > 0 ? (bytes / timeMs) * 1000 : 0;

          writePoints.push({
            x: timestamp,
            y: convertRef.current(Math.max(0, bytesPerSec)),
          });
        }
      });

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

      console.log('[ReadWriteChartCard] 🔄 Buffer synced (cumulative → bytes/sec):', {
        readBufferSize: bufferRef.current.read.length,
        writeBufferSize: bufferRef.current.write.length,
        lastPushedTimestamp: new Date(lastPushedTimestampRef.current).toISOString(),
      });
    }
  }, []);

  // Store 데이터 변경 감지 및 patch
  useEffect(() => {
    if (!containerData?.blockIO) return;

    const readTimeSeries = containerData.blockIO.blkReadPerSec ?? [];
    const writeTimeSeries = containerData.blockIO.blkWritePerSec ?? [];

    // Detail WS에서 time-series가 왔으면 patch (누적값 그대로 저장)
    if (readTimeSeries.length > 0) {
      patchTimeline(readTimeSeries, 'read');
    }
    if (writeTimeSeries.length > 0) {
      patchTimeline(writeTimeSeries, 'write');
    }

    // List WS에서 현재값만 왔으면 직접 추가 (누적값 그대로 저장)
    const currentRead = containerData.blockIO.currentBlkReadPerSec;
    const currentWrite = containerData.blockIO.currentBlkWritePerSec;

    if (readTimeSeries.length === 0 && currentRead !== undefined && !isNaN(currentRead)) {
      const now = Date.now();
      timelineRef.current.read.set(now, currentRead); // 누적값 저장
      console.log('[ReadWriteChartCard] 📍 List WS - Read cumulative value added:', { now, value: currentRead });
    }
    if (writeTimeSeries.length === 0 && currentWrite !== undefined && !isNaN(currentWrite)) {
      const now = Date.now();
      timelineRef.current.write.set(now, currentWrite); // 누적값 저장
      console.log('[ReadWriteChartCard] 📍 List WS - Write cumulative value added:', { now, value: currentWrite });
    }

    // bufferRef 동기화 (누적값 → bytes/sec 변환)
    syncBufferFromTimeline();
  }, [containerData, patchTimeline, syncBufferFromTimeline]);

  // Chart options (Realtime scale - splice 사용)
  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          type: 'realtime',
          realtime: {
            duration: 180000, // 3분 윈도우
            delay: 2000,
            refresh: 1000,
            onRefresh: (chart: Chart<'line'>) => {
              // 1. bufferRef의 데이터를 chart에 push
              const readDataset = chart.data.datasets[0].data as ChartPoint[];
              const writeDataset = chart.data.datasets[1].data as ChartPoint[];

              if (bufferRef.current.read.length > 0) {
                readDataset.push(...bufferRef.current.read);
                console.log(`[ReadWriteChartCard] ➕ Pushed ${bufferRef.current.read.length} Read points`);
                bufferRef.current.read = [];
              }
              if (bufferRef.current.write.length > 0) {
                writeDataset.push(...bufferRef.current.write);
                console.log(`[ReadWriteChartCard] ➕ Pushed ${bufferRef.current.write.length} Write points`);
                bufferRef.current.write = [];
              }

              // 2. 오래된 데이터 삭제
              const now = Date.now();
              const cutoff = now - 180000;

              let readIdx = 0;
              while (readIdx < readDataset.length && readDataset[readIdx].x < cutoff) {
                readIdx++;
              }
              if (readIdx > 0) {
                readDataset.splice(0, readIdx);
                console.log(`[ReadWriteChartCard] 🗑️ Removed ${readIdx} old Read points`);
              }

              let writeIdx = 0;
              while (writeIdx < writeDataset.length && writeDataset[writeIdx].x < cutoff) {
                writeIdx++;
              }
              if (writeIdx > 0) {
                writeDataset.splice(0, writeIdx);
                console.log(`[ReadWriteChartCard] 🗑️ Removed ${writeIdx} old Write points`);
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
              `${typeof v === 'number' ? v.toFixed(1) : v} ${avgMetrics.unit}`,
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
              `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ${avgMetrics.unit}`,
          },
        },
      },
    }),
    [avgMetrics.unit]
  );

  // 차트 데이터 (고정된 레퍼런스)
  const chartData = useMemo(() => ({
    datasets: [
      {
        label: 'Read',
        borderColor: '#8979ff',
        backgroundColor: 'rgba(137, 121, 255, 0.1)',
        borderWidth: 2,
        fill: false,
        data: [] as ChartPoint[],
      },
      {
        label: 'Write',
        borderColor: '#ff928a',
        backgroundColor: 'rgba(255, 146, 138, 0.1)',
        borderWidth: 2,
        fill: false,
        data: [] as ChartPoint[],
      },
    ],
  }), []);

  return (
    <div className="mt-3.5 bg-white w-full h-[268px] rounded-xl border border-border-light p-4">
      {/* Header Section */}
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[#505050] font-semibold text-xl">Read / Write</p>
        <div className="flex items-center gap-2 ml-4 text-xs">
          <span>
            Read : <span className="text-[#8979ff] font-medium">{avgMetrics.read}</span>{' '}
            {avgMetrics.unit}
          </span>
          <span>|</span>
          <span>
            Write : <span className="text-[#ff928a] font-medium">{avgMetrics.write}</span>{' '}
            {avgMetrics.unit}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[160px] bg-gray-50 rounded-lg mt-3 p-3">
        {hasBlockIOData ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            수신 된 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};