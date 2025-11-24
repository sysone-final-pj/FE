/********************************************************************************************
 * 📈 CPUHistoryChart.tsx
 * REST API 기반 CPU 사용률 추이 차트 (Time Range)
 ********************************************************************************************/
import {
  useState,
  useEffect,
  useMemo,
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
import 'chartjs-adapter-date-fns';

import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import type { ChartOptions, TooltipItem } from 'chart.js';
import { TimeFilter, type TimeFilterValue } from '@/shared/ui/TimeFilter/TimeFilter';
import { containerApi } from '@/shared/api/container';


ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend
);

interface Props {
  selectedContainers: ContainerData[];
  metricsMap: Map<number, MetricDetail>;
}

interface ChartDataset {
  label: string;
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  fill: boolean;
  data: { x: number; y: number }[];
}

export const CPUHistoryChart = ({ selectedContainers }: Props) => {
  const [datasets, setDatasets] = useState<ChartDataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue | null>(null);

  // 배열 참조 변경에 의한 불필요한 API 호출 방지
  const containerIdsKey = useMemo(
    () => selectedContainers.map((c) => c.id).join(','),
    [selectedContainers]
  );

  /************************************************************************************************
   * 1) TimeFilter 변경 및 컨테이너 선택 시 API 호출
   ************************************************************************************************/
  useEffect(() => {
    if (!timeFilter || selectedContainers.length === 0) {
      setDatasets([]);
      return;
    }

    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const metricsPromises = selectedContainers.map((container, index) =>
          containerApi
            .getContainerMetrics(Number(container.id), {
              startTime: timeFilter.collectedAtFrom,
              endTime: timeFilter.collectedAtTo,
            })
            .then((metric) => ({
              container,
              metric,
              colorIndex: index,
            }))
            .catch((error) => {
              console.error(`Failed to fetch metrics for ${container.containerName}:`, error);
              return null;
            })
        );

        const results = await Promise.all(metricsPromises);

        const newDatasets: ChartDataset[] = results
          .filter((result): result is NonNullable<typeof result> => result !== null)
          .map(({ container, metric, colorIndex }) => ({
            label: container.containerName,
            borderColor: `hsl(${(colorIndex * 70) % 360}, 75%, 55%)`,
            backgroundColor: `hsla(${(colorIndex * 70) % 360}, 75%, 55%, 0.1)`,
            borderWidth: 2,
            fill: false,
            data: metric.cpu.cpuPercent.map((point) => ({
              x: new Date(point.timestamp).getTime(),
              y: point.value,
            })),
          }));

        setDatasets(newDatasets);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setDatasets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [containerIdsKey, timeFilter]);

  /************************************************************************************************
   * 2) Chart Options
   ************************************************************************************************/
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
          },
        },
        title: {
          display: true,
          text: 'Time (DB Timestamp)',
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
        title: {
          display: true,
          text: 'CPU Usage (%)',
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
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  /************************************************************************************************
   * 3) TimeFilter 변경 핸들러
   ************************************************************************************************/
  const handleTimeFilterChange = (value: TimeFilterValue) => {
    console.log('[CPUHistoryChart] TimeFilter changed:', value);
    setTimeFilter(value);
  };

  /************************************************************************************************
   * 4) 렌더
   ************************************************************************************************/
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        <h3 className="text-gray-700 font-medium text-base">
          CPU Usage Trend (Time Range)
        </h3>
        <TimeFilter onSearch={handleTimeFilterChange} />
      </div>

      <div className="bg-white rounded-lg p-4 h-[280px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <p className="text-gray-500 text-sm">Loading metrics...</p>
          </div>
        )}
        {!timeFilter ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              Select a time range to view CPU metrics
            </p>
          </div>
        ) : datasets.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              No data available for the selected time range
            </p>
          </div>
        ) : (
          <Line data={{ datasets }} options={options} />
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-right">
        Time Range data — Actual backend timestamps
      </p>
    </section>
  );
};
