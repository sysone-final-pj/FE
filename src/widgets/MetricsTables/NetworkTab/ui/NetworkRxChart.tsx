/********************************************************************************************
 * 🌐 NetworkRxChart.tsx (Streaming Plugin)
 * ─────────────────────────────────────────────
 * 컨테이너별 네트워크 수신 속도(Rx) 실시간 표시
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
import { convertNetworkSpeedAuto } from '@/shared/lib/formatters';

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
  data: { x: number; y: number }[];
  metricRef: { current: MetricDetail | null };
}

export const NetworkRxChart = ({ selectedContainers, metricsMap }: Props) => {

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
   * 3) 현재 데이터 기반 최대값으로 단위 결정
   ************************************************************************************************/
  const unit = useMemo(() => {
    const currentValues = containerMetricPairs.map(
      ({ metric }) => metric?.network?.currentRxBytesPerSec ?? 0
    );
    const maxValue = currentValues.length > 0 ? Math.max(...currentValues) : 0;
    return convertNetworkSpeedAuto(maxValue * 8).unit; // bytes/s → bits/s
  }, [containerMetricPairs]);

  /************************************************************************************************
   * 4) 선택 변경 시 → add/remove
   ************************************************************************************************/
  useEffect(() => {
    const nextMap = new Map(datasetMapRef.current);

    // (1) 선택된 컨테이너에 대한 dataset 추가/업데이트
    containerMetricPairs.forEach(({ container, metric, colorIndex }) => {
      const id = Number(container.id);
      const existing = nextMap.get(id);

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

      const rxBytesPerSec = metric?.network?.currentRxBytesPerSec ?? 0;
      const rx = converter(rxBytesPerSec);
      const ts = metric ? new Date(metric.endTime).getTime() : Date.now();

      if (!existing) {
        // 신규 dataset 생성
        nextMap.set(id, {
          label: container.containerName,
          borderColor: `hsl(${(colorIndex * 70) % 360}, 75%, 55%)`,
          backgroundColor: `hsla(${(colorIndex * 70) % 360}, 75%, 55%, 0.1)`,
          borderWidth: 2,
          fill: false,
          data: [{ x: ts, y: rx }],
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
  }, [selectedContainers, containerMetricPairs, unit]);


  /************************************************************************************************
   * 5) chart options — streaming
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

            // 단위 변환 함수
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

            datasets.forEach((dataset) => {
              const metric = dataset.metricRef.current;
              if (!metric) return;

              const rxBytesPerSec = metric.network?.currentRxBytesPerSec ?? 0;
              const rx = converter(rxBytesPerSec);
              const ts = new Date(metric.endTime).getTime();
              const last = dataset.data.at(-1);

              if (!last || last.x !== ts || last.y !== rx) {
                dataset.data.push({ x: ts, y: rx });
              }
            });
          },
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      y: {
        min: 0,
        ticks: {
          callback: (value) => `${typeof value === 'number' ? value.toFixed(1) : value} ${unit}`,
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
            return `${context.dataset.label}: ${value.toFixed(2)} ${unit}`;
          },
        },
      },
    },
  } as ChartOptions<'line'>);

  // unit이 변경될 때마다 optionsRef 업데이트
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scales = optionsRef.current.scales as any;
    if (scales?.y?.ticks) {
      scales.y.ticks.callback = (value: number | string) =>
        `${typeof value === 'number' ? value.toFixed(1) : value} ${unit}`;
    }
    if (optionsRef.current.plugins?.tooltip?.callbacks) {
      optionsRef.current.plugins.tooltip.callbacks.label = (context: TooltipItem<'line'>) => {
        const value = context.parsed.y ?? 0;
        return `${context.dataset.label}: ${value.toFixed(2)} ${unit}`;
      };
    }
  }, [unit]);

  /************************************************************************************************
   * 6) 렌더
   ************************************************************************************************/
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        Network Rx Trend
      </h3>
      <div className="bg-white rounded-lg p-4 h-[280px]">
        <Line
          data={{ datasets: Array.from(datasetMapRef.current.values()) }}
          options={optionsRef.current}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        WebSocket realtime data — Actual backend timestamps
      </p>
    </section>
  );
};
