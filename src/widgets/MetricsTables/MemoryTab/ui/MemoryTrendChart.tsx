/********************************************************************************************
 * 💾 MemoryTrendChart.tsx
 * 실시간 Memory 사용률 추이 차트 (Streaming Plugin)
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
import autocolors from 'chartjs-plugin-autocolors';
import 'chartjs-adapter-date-fns';

import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import type { Chart, ChartOptions, TooltipItem } from 'chart.js';
import { formatBytes } from '@/shared/lib/formatters';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  streamingPlugin,
  autocolors
);

interface Props {
  selectedContainers: ContainerData[];
  initialMetricsMap: Map<number, MetricDetail>;
  metricsMap: Map<number, MetricDetail>;
}

interface RealtimeDataset {
  label: string;
  borderWidth: number;
  fill: boolean;
  pointRadius: number;
  pointHoverRadius: number;
  pointHitRadius: number;
  data: { x: number; y: number }[];
  metricRef: { current: MetricDetail | null };
}

export const MemoryTrendChart = ({ selectedContainers, initialMetricsMap, metricsMap }: Props) => {
  /************************************************************************************************
   * 0) Chart ref & cleanup
   ************************************************************************************************/
  const chartRef = useRef<Chart<'line'> | null>(null);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 차트 정리
      if (chartRef.current) {
        chartRef.current.stop();
        chartRef.current.destroy();
      }
    };
  }, []);

  /************************************************************************************************
   * 1) initialMetricsMap 디버깅
   ************************************************************************************************/
  useEffect(() => {
    // console.log('[MemoryTrendChart] initialMetricsMap updated:', {
    //   size: initialMetricsMap.size,
    //   keys: Array.from(initialMetricsMap.keys()),
    //   entries: Array.from(initialMetricsMap.entries()).map(([id, metric]) => ({
    //     id,
    //     memoryUsageLength: metric.memory?.memoryUsage?.length || 0,
    //     startTime: metric.startTime,
    //     endTime: metric.endTime,
    //     dataPoints: metric.dataPoints,
    //   })),
    // });
  }, [initialMetricsMap]);

  /************************************************************************************************
   * 1) 선택된 컨테이너 + 해당 metric 매핑
   ************************************************************************************************/
  const containerMetricPairs = useMemo(
    () =>
      selectedContainers.map((container) => ({
        container,
        metric: metricsMap.get(Number(container.id)) ?? null,
      })),
    [selectedContainers, metricsMap]
  );

  /************************************************************************************************
   * 2) dataset을 "절대 초기화하지 않는" Map 형태로 유지
   ************************************************************************************************/
  const datasetMapRef = useRef<Map<number, RealtimeDataset>>(new Map());

  /************************************************************************************************
   * 3) 선택 변경 시 → add/remove (초기 데이터 포함)
   ************************************************************************************************/
  useEffect(() => {
    // console.log('[MemoryTrendChart] useEffect triggered - Creating/updating datasets');
    // console.log('[MemoryTrendChart] Current state:', {
    //   selectedContainersCount: selectedContainers.length,
    //   selectedContainerIds: selectedContainers.map(c => c.id),
    //   initialMetricsMapSize: initialMetricsMap.size,
    //   initialMetricsMapKeys: Array.from(initialMetricsMap.keys()),
    //   metricsMapSize: metricsMap.size,
    //   metricsMapKeys: Array.from(metricsMap.keys()),
    //   currentDatasetMapSize: datasetMapRef.current.size,
    // });

    const nextMap = new Map(datasetMapRef.current);

    // (1) 선택된 컨테이너에 대한 dataset 추가/업데이트
    containerMetricPairs.forEach(({ container, metric }) => {
      const id = Number(container.id);
      const existing = nextMap.get(id);

      // console.log(`[MemoryTrendChart] ========== Processing container ${id} (${container.containerName}) ==========`);
      // console.log(`[MemoryTrendChart] Has existing dataset: ${!!existing}`);

      if (!existing) {
        // 신규 dataset 생성 - 초기 데이터 로드
        const initialMetric = initialMetricsMap.get(id);
        let initialData: { x: number; y: number }[] = [];

        // console.log(`[MemoryTrendChart] Loading initial data for NEW dataset ${id}:`, {
        //   hasInitialMetric: !!initialMetric,
        //   hasMemoryData: !!initialMetric?.memory,
        //   hasMemoryUsage: !!initialMetric?.memory?.memoryUsage,
        //   memoryUsageLength: initialMetric?.memory?.memoryUsage?.length || 0,
        //   rawMemoryUsage: initialMetric?.memory?.memoryUsage,
        //   fullInitialMetric: initialMetric,
        // });

        // REST API로 받은 초기 데이터 (1분 time series)
        if (initialMetric?.memory?.memoryUsage && initialMetric.memory.memoryUsage.length > 0) {
          initialData = initialMetric.memory.memoryUsage.map((point) => ({
            x: new Date(point.timestamp).getTime(),
            y: point.value,
          }));
          // console.log(`[MemoryTrendChart] Loaded ${initialData.length} initial data points for container ${id}:`, {
          //   firstPoint: initialData[0],
          //   lastPoint: initialData[initialData.length - 1],
          //   allPoints: initialData,
          // });
        } else {
          // console.warn(`[MemoryTrendChart] No initial data for container ${id}`);
        }

        // WebSocket 데이터가 있고, 초기 데이터가 있을 때만 마지막에 추가 (중복 체크)
        if (initialData.length > 0 && metric?.memory?.currentMemoryUsage !== undefined) {
          const memory = metric.memory.currentMemoryUsage;
          const ts = new Date(metric.endTime).getTime();
          const lastPoint = initialData.at(-1);

          // 마지막 포인트와 다른 경우에만 추가
          if (!lastPoint || lastPoint.x !== ts || lastPoint.y !== memory) {
            initialData.push({ x: ts, y: memory });
            // console.log(`[MemoryTrendChart] Appended WebSocket data to initial data for container ${id}:`, { x: ts, y: memory });
          }
        }

        // 초기 데이터가 없으면 dataset을 생성하지 않음 (REST API 응답 대기)
        if (initialData.length === 0) {
          // console.warn(`[MemoryTrendChart] No initial data for container ${id}, skipping dataset creation`);
          return; // dataset 생성하지 않음
        }

        const dataset = {
          label: container.containerName,
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
          data: initialData,
          metricRef: { current: metric },
        };

        nextMap.set(id, dataset);

        // console.log(`[MemoryTrendChart] Created dataset for container ${id}:`, {
        //   label: dataset.label,
        //   dataLength: dataset.data.length,
        //   data: dataset.data,
        // });
      } else {
        // 기존 dataset은 유지하되 metricRef 갱신 + 초기 데이터 확인
        existing.metricRef.current = metric;
        // console.log(`[MemoryTrendChart] Updating EXISTING dataset for container ${id}:`, {
        //   currentDataLength: existing.data.length,
        // });

        // 초기 데이터가 새로 로드되었는지 확인 (기존 데이터가 적고 initialMetric에 데이터가 있을 때)
        const initialMetric = initialMetricsMap.get(id);
        if (initialMetric?.memory?.memoryUsage && initialMetric.memory.memoryUsage.length > 0) {
          const initialDataPoints = initialMetric.memory.memoryUsage.map((point) => ({
            x: new Date(point.timestamp).getTime(),
            y: point.value,
          }));

          // console.log(`[MemoryTrendChart] Found initial data for existing dataset ${id}:`, {
          //   initialDataPointsCount: initialDataPoints.length,
          //   existingDataLength: existing.data.length,
          //   firstInitialPoint: initialDataPoints[0],
          //   lastInitialPoint: initialDataPoints[initialDataPoints.length - 1],
          // });

          // 기존 데이터가 초기 데이터보다 적으면 (WebSocket만 있는 경우) 초기 데이터를 앞에 추가
          if (existing.data.length < initialDataPoints.length) {
            // 기존 데이터 중 초기 데이터 범위 밖의 WebSocket 데이터만 필터링
            const lastInitialTime = initialDataPoints[initialDataPoints.length - 1].x;
            const realtimeData = existing.data.filter(point => point.x > lastInitialTime);

            // 초기 데이터 + 실시간 데이터 병합
            existing.data = [...initialDataPoints, ...realtimeData];

            // console.log(`[MemoryTrendChart] Merged initial + realtime data for container ${id}:`, {
            //   initialPoints: initialDataPoints.length,
            //   realtimePoints: realtimeData.length,
            //   totalPoints: existing.data.length,
            //   mergedData: existing.data,
            // });
          } else {
            // console.log(`[MemoryTrendChart] Existing data already has enough points, skipping merge for container ${id}`);
          }
        } else {
          // console.log(`[MemoryTrendChart] No initial data available for container ${id}`);
        }
      }
    });

    // (2) 선택 해제된 컨테이너 라인 제거
    datasetMapRef.current.forEach((_value, key) => {
      const stillSelected = selectedContainers.some(
        (c) => Number(c.id) === key
      );
      if (!stillSelected) {
        nextMap.delete(key);
        // console.log(`[MemoryTrendChart] Removed dataset for deselected container ${key}`);
      }
    });

    datasetMapRef.current = nextMap;

    // console.log('[MemoryTrendChart] Final datasetMapRef:', {
    //   size: datasetMapRef.current.size,
    //   keys: Array.from(datasetMapRef.current.keys()),
    //   datasets: Array.from(datasetMapRef.current.entries()).map(([id, ds]) => ({
    //     id,
    //     label: ds.label,
    //     dataLength: ds.data.length,
    //     firstPoint: ds.data[0],
    //     lastPoint: ds.data[ds.data.length - 1],
    //   })),
    // });
  }, [selectedContainers, containerMetricPairs, initialMetricsMap]);


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
          duration: 180000,  // 3분 윈도우 (1분 초기 데이터 + 2분 실시간 여유)
          delay: 2000,       // 2초 딜레이 (네트워크 지연 고려)
          refresh: 1000,     // 1초마다 갱신
          onRefresh: (chart: Chart<'line'>) => {
            const datasets = Array.from(datasetMapRef.current.values());
            chart.data.datasets = datasets;

            datasets.forEach((dataset) => {
              const metric = dataset.metricRef.current;
              if (!metric) return;

              const memory = metric.memory?.currentMemoryUsage ?? 0;
              const ts = new Date(metric.endTime).getTime();
              const last = dataset.data.at(-1);

              if (!last || last.x !== ts || last.y !== memory) {
                dataset.data.push({ x: ts, y: memory });
                // console.log(`[MemoryTrendChart] onRefresh added point for ${dataset.label}:`, { x: ts, y: memory });
              }
            });
          },
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      y: {
        min: 0,
        ticks: {
          callback: (value) => {
            const numValue = typeof value === 'number' ? value : parseFloat(String(value));
            return formatBytes(numValue);
          },
        },
      },
    },
    plugins: {
      autocolors: {
        mode: 'dataset',
      },
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
            return `${context.dataset.label}: ${formatBytes(value)}`;
          },
        },
      },
    },
  } as ChartOptions<'line'>);

  /************************************************************************************************
   * 5) 렌더
   ************************************************************************************************/
  const datasets = Array.from(datasetMapRef.current.values());

  // console.log('[MemoryTrendChart] RENDER - Chart data:', {
  //   datasetCount: datasets.length,
  //   datasets: datasets.map(ds => ({
  //     label: ds.label,
  //     dataPointsCount: ds.data.length,
  //     firstDataPoint: ds.data[0],
  //     lastDataPoint: ds.data[ds.data.length - 1],
  //     allDataPoints: ds.data,
  //   })),
  // });

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-text-primary font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        Memory Usage Trend (Realtime)
      </h3>
      <div className="bg-white rounded-lg p-4 h-[280px]">
        <Line
          ref={chartRef}
          data={{ datasets }}
          options={optionsRef.current}
        />
      </div>
      <p className="text-xs text-text-secondary mt-2 text-right">
        WebSocket realtime data — Actual backend timestamps
      </p>
    </section>
  );
};
