/********************************************************************************************
 * ⚠️ ErrorDropRateChart.tsx (Real-time WebSocket Data)
 * ─────────────────────────────────────────────
 * 컨테이너별 네트워크 에러율 및 드랍율 실시간 표시
 ********************************************************************************************/
import {
  useMemo,
  useRef,
  useEffect,
} from 'react';
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

import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import type { Chart, ChartOptions, TooltipItem } from 'chart.js';

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

interface Props {
  selectedContainers: ContainerData[];
  metricsMap: Map<number, MetricDetail>;
}

interface RealtimeDataset {
  label: string;
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  fill: boolean;
  pointRadius: number;
  pointHoverRadius: number;
  pointHitRadius: number;
  data: { x: number; y: number }[];
  metricRef: { current: MetricDetail | null };
}

export const ErrorDropRateChart = ({ selectedContainers, metricsMap }: Props) => {

  /************************************************************************************************
   * 1) 선택된 컨테이너 + 해당 metric 매핑
   ************************************************************************************************/
  const containerMetricPairs = useMemo(
    () =>
      selectedContainers.map((container, index) => ({
        container,
        metric: metricsMap.get(Number(container.id)) ?? null,
        colorIndex: index,
      })),
    [selectedContainers, metricsMap]
  );

  /************************************************************************************************
   * 2) dataset을 "절대 초기화하지 않는" Map 형태로 유지
   ************************************************************************************************/
  const datasetMapRef = useRef<Map<number, RealtimeDataset>>(new Map());

  /************************************************************************************************
   * 3) 선택 변경 시 → add/remove
   ************************************************************************************************/
  useEffect(() => {
    const nextMap = new Map(datasetMapRef.current);

    // (1) 선택된 컨테이너에 대한 dataset 추가/업데이트
    containerMetricPairs.forEach(({ container, metric, colorIndex }) => {
      const id = Number(container.id);
      const existing = nextMap.get(id);

      // 에러율 + 드랍율 계산
      const totalPackets = (metric?.network?.totalRxPackets || 0) + (metric?.network?.totalTxPackets || 0);
      let failureRate = 0;

      if (totalPackets > 0) {
        const totalErrors = (metric?.network?.rxErrors || 0) + (metric?.network?.txErrors || 0);
        const totalDropped = (metric?.network?.rxDropped || 0) + (metric?.network?.txDropped || 0);
        failureRate = ((totalErrors + totalDropped) / totalPackets) * 100;
      }

      const ts = metric ? new Date(metric.endTime).getTime() : Date.now();

      if (!existing) {
        // 신규 dataset 생성
        nextMap.set(id, {
          label: container.containerName,
          borderColor: `hsl(${(colorIndex * 70 + 40) % 360}, 75%, 55%)`,
          backgroundColor: `hsla(${(colorIndex * 70 + 40) % 360}, 75%, 55%, 0.1)`,
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
          data: [{ x: ts, y: Number(failureRate.toFixed(4)) }],
          metricRef: { current: metric },
        });
      } else {
        // 기존 dataset은 유지하되 metricRef만 최신 갱신
        existing.metricRef.current = metric;
      }
    });

    // (2) 선택 해제된 컨테이너 라인 제거
    datasetMapRef.current.forEach((_value, key) => {
      const stillSelected = selectedContainers.some(
        (c) => Number(c.id) === key
      );
      if (!stillSelected) {
        nextMap.delete(key);
      }
    });

    datasetMapRef.current = nextMap;
  }, [selectedContainers, containerMetricPairs]);


  /************************************************************************************************
   * 4) chart options — streaming
   ************************************************************************************************/
  const optionsRef = useRef<ChartOptions<'line'>>({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 120000,
          delay: 1000,
          refresh: 1000,
          onRefresh: (chart: Chart<'line'>) => {
            const datasets = Array.from(datasetMapRef.current.values());
            chart.data.datasets = datasets;

            datasets.forEach((dataset) => {
              const metric = dataset.metricRef.current;
              if (!metric) return;

              // 에러율 + 드랍율 계산
              const totalPackets = (metric.network?.totalRxPackets || 0) + (metric.network?.totalTxPackets || 0);
              let failureRate = 0;

              if (totalPackets > 0) {
                const totalErrors = (metric.network?.rxErrors || 0) + (metric.network?.txErrors || 0);
                const totalDropped = (metric.network?.rxDropped || 0) + (metric.network?.txDropped || 0);
                failureRate = ((totalErrors + totalDropped) / totalPackets) * 100;
              }

              const ts = new Date(metric.endTime).getTime();
              const last = dataset.data.at(-1);

              if (!last || last.x !== ts || last.y !== Number(failureRate.toFixed(4))) {
                dataset.data.push({ x: ts, y: Number(failureRate.toFixed(4)) });
              }
            });
          },
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      y: {
        min: 0,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          color: '#444',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label}: ${value.toFixed(4)}%`;
          },
        },
      },
    },
  } as ChartOptions<'line'>);

  /************************************************************************************************
   * 5) 렌더
   ************************************************************************************************/
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <h3 className="text-text-primary font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        에러 및 드랍율
      </h3>
      <div className="bg-white rounded-lg p-4 h-[320px]">
        <Line
          data={{ datasets: Array.from(datasetMapRef.current.values()) }}
          options={optionsRef.current}
        />
      </div>
      <p className="text-xs text-text-secondary mt-2 text-right">
        WebSocket 실시간 데이터 — Error / Drop Rate (%)
      </p>
    </section>
  );
};
