/********************************************************************************************
 * 💾 ReadWriteChartCard.tsx
 * ─────────────────────────────────────────────
 * Dashboard용 Block I/O Read/Write 실시간 카드
 * - REST API 초기 1분 데이터 로드
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
import { formatBytesPerSec } from '@/shared/lib/formatters';

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

interface ReadWriteChartCardProps {
  containerId: number;
}

export const ReadWriteChartCard: React.FC<ReadWriteChartCardProps> = ({ containerId }) => {
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
      console.log(`[ReadWriteChartCard] 🔄 Container changed: ${prevContainerIdRef.current} → ${containerId}`);

      // 1. 플래그 초기화
      initialLoadedRef.current = false;

      // 2. 차트 데이터 클리어
      if (chartRef.current) {
        chartRef.current.data.datasets[0].data = [];
        chartRef.current.data.datasets[1].data = [];
        chartRef.current.update('none');
        console.log('[ReadWriteChartCard] 🧹 Chart data cleared');
      }
    }

    // 3. 이전 containerId 업데이트
    prevContainerIdRef.current = containerId;
  }, [containerId]);

  // 디버깅 로그 제거 (성능 최적화)

  // Block I/O 데이터 존재 여부 확인
  const hasBlockIOData = useMemo(() => {
    if (!containerData?.blockIO) return false;
    return (
      containerData.blockIO.currentBlkReadPerSec !== undefined ||
      containerData.blockIO.currentBlkWritePerSec !== undefined
    );
  }, [containerData]);

  // 평균 Read/Write 계산 (현재값 기반)
  const avgMetrics = useMemo(() => {
    if (!containerData?.blockIO || !hasBlockIOData) {
      return { read: '0', write: '0', unit: 'MB/s' };
    }

    const readVal = containerData.blockIO.currentBlkReadPerSec ?? 0;
    const writeVal = containerData.blockIO.currentBlkWritePerSec ?? 0;

    const formattedRead = formatBytesPerSec(readVal);
    const formattedWrite = formatBytesPerSec(writeVal);

    const [readValue] = formattedRead.split(' ');
    const [writeValue] = formattedWrite.split(' ');
    const unit = formattedRead.split(' ')[1] || 'MB/s';

    return {
      read: readValue,
      write: writeValue,
      unit,
    };
  }, [containerData, hasBlockIOData]);

  // 단위 변환 함수
  const converter = useMemo(() => {
    return (bytesPerSec: number) => {
      const formatted = formatBytesPerSec(bytesPerSec);
      const [value] = formatted.split(' ');
      return Number(value);
    };
  }, []);

  // 초기 데이터 로드 (REST API 시계열 데이터)
  useEffect(() => {
    console.log('[ReadWriteChartCard] useEffect - Initial load check:', {
      hasChart: !!chartRef.current,
      hasContainerData: !!containerData,
      hasBlockIO: !!containerData?.blockIO,
      alreadyLoaded: initialLoadedRef.current,
    });

    if (!chartRef.current || !containerData?.blockIO || initialLoadedRef.current) return;

    const chart = chartRef.current;
    const readTimeSeries = containerData.blockIO.blkReadPerSec ?? [];
    const writeTimeSeries = containerData.blockIO.blkWritePerSec ?? [];

    console.log('[ReadWriteChartCard] Initial data check:', {
      readLength: readTimeSeries.length,
      writeLength: writeTimeSeries.length,
      readSample: readTimeSeries[0],
      writeSample: writeTimeSeries[0],
      currentChartReadLength: chart.data.datasets[0].data.length,
      currentChartWriteLength: chart.data.datasets[1].data.length,
    });

    // 방어 로직: 차트에 이미 데이터가 있으면 중복 로드 방지
    if (chart.data.datasets[0].data.length > 0) {
      console.warn('[ReadWriteChartCard] ⚠️ Chart already has data, skipping load');
      initialLoadedRef.current = true;
      return;
    }

    // 시계열 배열이 비어있지 않으면 초기 데이터 로드
    if (readTimeSeries.length > 0 || writeTimeSeries.length > 0) {
      // converter 함수 inline
      const convertValue = (bytesPerSec: number) => {
        const formatted = formatBytesPerSec(bytesPerSec);
        const [value] = formatted.split(' ');
        return Number(value);
      };

      // Read 데이터 추가
      readTimeSeries.forEach((point) => {
        const timestamp = new Date(point.timestamp).getTime();
        const value = convertValue(point.value);
        chart.data.datasets[0].data.push({ x: timestamp, y: value });
      });

      // Write 데이터 추가
      writeTimeSeries.forEach((point) => {
        const timestamp = new Date(point.timestamp).getTime();
        const value = convertValue(point.value);
        chart.data.datasets[1].data.push({ x: timestamp, y: value });
      });

      chart.update('none'); // 애니메이션 없이 즉시 표시
      initialLoadedRef.current = true;
      console.log('[ReadWriteChartCard] ✅ Initial data loaded:', {
        readPoints: readTimeSeries.length,
        writePoints: writeTimeSeries.length,
      });
    } else {
      console.warn('[ReadWriteChartCard] ⚠️ No initial time-series data, waiting for REST API...');
    }
  }, [containerData]);

  // 실시간 데이터 추가 (WebSocket 업데이트 감지)
  useEffect(() => {
    if (!chartRef.current || !containerData?.blockIO || !initialLoadedRef.current) return;

    const chart = chartRef.current;
    const readPerSec = containerData.blockIO.currentBlkReadPerSec ?? 0;
    const writePerSec = containerData.blockIO.currentBlkWritePerSec ?? 0;
    const read = converter(readPerSec);
    const write = converter(writePerSec);
    const timestamp = new Date(containerData.endTime).getTime();

    const readData = chart.data.datasets[0].data as { x: number; y: number }[];
    const writeData = chart.data.datasets[1].data as { x: number; y: number }[];

    const lastRead = readData.at(-1);
    const lastWrite = writeData.at(-1);

    // 새 데이터 추가 (타임스탬프와 값이 모두 다를 때만)
    let updated = false;
    if (!lastRead || lastRead.x !== timestamp || lastRead.y !== read) {
      readData.push({ x: timestamp, y: read });
      updated = true;
    }
    if (!lastWrite || lastWrite.x !== timestamp || lastWrite.y !== write) {
      writeData.push({ x: timestamp, y: write });
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

  // 초기 차트 데이터
  const initialChartData = useMemo(
    () => ({
      datasets: [
        {
          label: 'Read',
          borderColor: '#8979ff',
          backgroundColor: 'rgba(137, 121, 255, 0.1)',
          borderWidth: 2,
          fill: false,
          data: [] as { x: number; y: number }[],
        },
        {
          label: 'Write',
          borderColor: '#ff928a',
          backgroundColor: 'rgba(255, 146, 138, 0.1)',
          borderWidth: 2,
          fill: false,
          data: [] as { x: number; y: number }[],
        },
      ],
    }),
    []
  );

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
          <Line ref={chartRef} data={initialChartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            수신 된 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};
