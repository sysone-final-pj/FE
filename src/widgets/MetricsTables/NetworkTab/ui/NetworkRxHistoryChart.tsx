/********************************************************************************************
 * 📈 NetworkRxHistoryChart.tsx
 * REST API 기반 Network Rx (수신) 속도 추이 차트 (Time Range)
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

import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import type { ChartOptions, TooltipItem } from 'chart.js';
import { TimeFilter, type TimeFilterValue } from '@/shared/ui/TimeFilter/TimeFilter';
import { containerApi } from '@/shared/api/container';
import { convertNetworkSpeedAuto } from '@/shared/lib/formatters';


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
  selectedContainers: ContainerData[];
  metricsMap: Map<number, MetricDetail>;
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

export const NetworkRxHistoryChart = ({ selectedContainers }: Props) => {
  const [datasets, setDatasets] = useState<ChartDataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue | null>(null);
  const [networkUnit, setNetworkUnit] = useState<'Kbps' | 'Mbps' | 'Gbps'>('Mbps');

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
              // console.error(`Failed to fetch metrics for ${container.containerName}:`, error);
              void error;
              return null;
            })
        );

        const results = await Promise.all(metricsPromises);
        const validResults = results.filter((result): result is NonNullable<typeof result> => result !== null);

        // 모든 데이터에서 최대값 찾기 (단위 결정용)
        let maxValue = 0;
        validResults.forEach(({ metric }) => {
          metric.network.rxBytesPerSec.forEach((point) => {
            if (point.value > maxValue) {
              maxValue = point.value;
            }
          });
        });

        // 최대값으로 단위 결정
        const { unit } = convertNetworkSpeedAuto(maxValue);
        setNetworkUnit(unit);

        // 데이터셋 생성
        const newDatasets: ChartDataset[] = validResults.map(({ container, metric }) => ({
          label: container.containerName,
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
          data: metric.network.rxBytesPerSec.map((point) => {
            const converted = convertNetworkSpeedAuto(point.value);
            // 결정된 단위로 통일
            let value: number;
            if (unit === 'Kbps') {
              value = converted.unit === 'Kbps' ? converted.value : converted.value * (converted.unit === 'Mbps' ? 1000 : 1000000);
            } else if (unit === 'Mbps') {
              value = converted.unit === 'Mbps' ? converted.value : (converted.unit === 'Kbps' ? converted.value / 1000 : converted.value * 1000);
            } else {
              value = converted.unit === 'Gbps' ? converted.value : (converted.unit === 'Mbps' ? converted.value / 1000 : converted.value / 1000000);
            }

            return {
              x: new Date(point.timestamp).getTime(),
              y: value,
            };
          }),
        }));

        setDatasets(newDatasets);
      } catch (error) {
        // console.error('Failed to fetch metrics:', error);
        void error;
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
          callback: (value) => `${value} ${networkUnit}`,
        },
        title: {
          display: true,
          text: `Network Rx (${networkUnit})`,
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
            return `${context.dataset.label}: ${value.toFixed(1)} ${networkUnit}`;
          },
        },
      },
    },
  }), [networkUnit]);

  /************************************************************************************************
   * 3) TimeFilter 변경 핸들러
   ************************************************************************************************/
  const handleTimeFilterChange = (value: TimeFilterValue) => {
    // console.log('[NetworkRxHistoryChart] TimeFilter changed:', value);
    setTimeFilter(value);
  };

  /************************************************************************************************
   * 4) 렌더
   ************************************************************************************************/
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        <h3 className="text-text-primary font-medium text-base">
          Network Rx Trend (Time Range)
        </h3>
        <TimeFilter onSearch={handleTimeFilterChange} />
      </div>

      <div className="bg-white rounded-lg p-4 h-[280px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <p className="text-text-secondary text-sm">Loading metrics...</p>
          </div>
        )}
        {!timeFilter ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              Select a time range to view Network Rx metrics
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
