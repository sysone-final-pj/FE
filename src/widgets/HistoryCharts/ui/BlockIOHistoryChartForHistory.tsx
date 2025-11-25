/********************************************************************************************
 * 📈 BlockIOHistoryChartForHistory.tsx
 * HistoryPage용 Block I/O Read/Write 속도 추이 차트 (Time Range)
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
import autocolors from 'chartjs-plugin-autocolors';

import type { ChartOptions, TooltipItem } from 'chart.js';
import { TimeFilter, type TimeFilterValue } from '@/shared/ui/TimeFilter/TimeFilter';
import { containerApi } from '@/shared/api/container';
import { convertBytesPerSecAuto } from '@/shared/lib/formatters';


ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  autocolors
);

interface Props {
  containerId: number | null;
  containerName?: string;
}

interface ChartDataset {
  label: string;
  borderWidth: number;
  fill: boolean;
  pointRadius: number;
  pointHoverRadius: number;
  pointHitRadius: number;
  data: { x: number; y: number }[];
}

export const BlockIOHistoryChartForHistory = ({ containerId, containerName }: Props) => {
  const [datasets, setDatasets] = useState<ChartDataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue | null>(null);
  const [ioUnit, setIoUnit] = useState<'B/s' | 'KB/s' | 'MB/s' | 'GB/s'>('MB/s');

  /************************************************************************************************
   * 1) TimeFilter 변경 및 컨테이너 선택 시 API 호출
   ************************************************************************************************/
  useEffect(() => {
    if (!timeFilter || !containerId) {
      setDatasets([]);
      return;
    }

    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const metric = await containerApi.getContainerMetrics(containerId, {
          startTime: timeFilter.collectedAtFrom,
          endTime: timeFilter.collectedAtTo,
        });

        // 최대값 찾기 (단위 결정용)
        let maxValue = 0;
        [...metric.blockIO.blkReadPerSec, ...metric.blockIO.blkWritePerSec].forEach((point) => {
          if (point.value > maxValue) {
            maxValue = point.value;
          }
        });

        // 최대값으로 단위 결정
        const { unit } = convertBytesPerSecAuto(maxValue);
        setIoUnit(unit);

        // Read 데이터셋
        const readDataset: ChartDataset = {
          label: `${containerName || `Container ${containerId}`} - Read`,
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
          data: metric.blockIO.blkReadPerSec.map((point) => {
            const converted = convertBytesPerSecAuto(point.value);
            // 결정된 단위로 통일 (1024 기반)
            let value: number;
            const unitIndex = ['B/s', 'KB/s', 'MB/s', 'GB/s'].indexOf(unit);
            const convertedIndex = ['B/s', 'KB/s', 'MB/s', 'GB/s'].indexOf(converted.unit);
            const diff = unitIndex - convertedIndex;

            if (diff === 0) {
              value = converted.value;
            } else if (diff > 0) {
              value = converted.value / Math.pow(1024, diff);
            } else {
              value = converted.value * Math.pow(1024, -diff);
            }

            return {
              x: new Date(point.timestamp).getTime(),
              y: value,
            };
          }),
        };

        // Write 데이터셋
        const writeDataset: ChartDataset = {
          label: `${containerName || `Container ${containerId}`} - Write`,
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
          data: metric.blockIO.blkWritePerSec.map((point) => {
            const converted = convertBytesPerSecAuto(point.value);
            // 결정된 단위로 통일 (1024 기반)
            let value: number;
            const unitIndex = ['B/s', 'KB/s', 'MB/s', 'GB/s'].indexOf(unit);
            const convertedIndex = ['B/s', 'KB/s', 'MB/s', 'GB/s'].indexOf(converted.unit);
            const diff = unitIndex - convertedIndex;

            if (diff === 0) {
              value = converted.value;
            } else if (diff > 0) {
              value = converted.value / Math.pow(1024, diff);
            } else {
              value = converted.value * Math.pow(1024, -diff);
            }

            return {
              x: new Date(point.timestamp).getTime(),
              y: value,
            };
          }),
        };

        setDatasets([readDataset, writeDataset]);
      } catch (error) {
        void error;
        setDatasets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [containerId, timeFilter, containerName]);

  /************************************************************************************************
   * 2) Chart Options
   ************************************************************************************************/
  const options: ChartOptions<'line'> = useMemo(() => ({
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
        ticks: {
          callback: (value) => `${value} ${ioUnit}`,
        },
        title: {
          display: true,
          text: `Block I/O Speed (${ioUnit})`,
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
            return `${context.dataset.label}: ${value.toFixed(1)} ${ioUnit}`;
          },
        },
      },
    },
  }), [ioUnit]);

  /************************************************************************************************
   * 3) TimeFilter 변경 핸들러
   ************************************************************************************************/
  const handleTimeFilterChange = (value: TimeFilterValue) => {
    setTimeFilter(value);
  };

  /************************************************************************************************
   * 4) 렌더
   ************************************************************************************************/
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        <h3 className="text-text-primary font-medium text-base">
          Block I/O Read/Write Trend
        </h3>
        <TimeFilter onSearch={handleTimeFilterChange} />
      </div>

      <div className="bg-white rounded-lg p-4 h-[280px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <p className="text-text-secondary text-sm">Loading metrics...</p>
          </div>
        )}
        {!containerId ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              Select a container to view Block I/O metrics
            </p>
          </div>
        ) : !timeFilter ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              Select a time range to view Block I/O metrics
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
      <p className="text-xs text-text-secondary mt-2 text-right">
        Time Range data — Actual backend timestamps
      </p>
    </section>
  );
};
