/**
 작성자: 김슬기
 */
/********************************************************************************************
 * 📈 ErrorDropHistoryChart.tsx
 * REST API 기반 Network Error/Drop Rate 추이 차트 (Time Range)
 *
 * ⚠️ 주의: 현재 백엔드 API에서 에러/드랍의 시계열 데이터를 제공하지 않습니다.
 * rxErrors, txErrors, rxDropped, txDropped는 누적 값(cumulative)으로만 제공됩니다.
 *
 * 현재 구현: 패킷 손실률을 계산하여 표시 (향후 백엔드 API 개선 필요)
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

export const ErrorDropHistoryChart = ({ selectedContainers }: Props) => {
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
   *
   * ⚠️ 제한사항: 백엔드에서 에러/드랍의 시계열 데이터를 제공하지 않으므로
   * 현재는 패킷 전송률 데이터만 표시합니다.
   *
   * TODO: 백엔드에서 다음 필드를 TimeSeriesDataPoint[]로 제공하도록 개선 필요
   * - rxErrorsPerSec: TimeSeriesDataPoint[]
   * - txErrorsPerSec: TimeSeriesDataPoint[]
   * - rxDroppedPerSec: TimeSeriesDataPoint[]
   * - txDroppedPerSec: TimeSeriesDataPoint[]
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

        const newDatasets: ChartDataset[] = results
          .filter((result): result is NonNullable<typeof result> => result !== null)
          .map(({ container, metric }) => {
            // 현재는 전체 패킷 전송률을 표시 (Rx + Tx)
            // 에러율 계산을 위해서는 백엔드에서 에러 시계열 데이터 제공 필요
            const rxPackets = metric.network.rxPacketsPerSec;
            const txPackets = metric.network.txPacketsPerSec;

            // 시간별 총 패킷 수 계산
            const combinedData = rxPackets.map((rxPoint, index) => {
              const txPoint = txPackets[index];
              const totalPackets = rxPoint.value + (txPoint?.value || 0);

              return {
                x: new Date(rxPoint.timestamp).getTime(),
                y: totalPackets,
              };
            });

            return {
              label: container.containerName,
              borderWidth: 2,
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHitRadius: 10,
              data: combinedData,
            };
          });

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
        ticks: {
          callback: (value) => `${value} pkt/s`,
        },
        title: {
          display: true,
          text: 'Total Packets/sec',
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
            return `${context.dataset.label}: ${value.toFixed(1)} packets/sec`;
          },
        },
      },
    },
  };

  /************************************************************************************************
   * 3) TimeFilter 변경 핸들러
   ************************************************************************************************/
  const handleTimeFilterChange = (value: TimeFilterValue) => {
    // console.log('[ErrorDropHistoryChart] TimeFilter changed:', value);
    setTimeFilter(value);
  };

  /************************************************************************************************
   * 4) 렌더
   ************************************************************************************************/
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        <h3 className="text-text-primary font-medium text-base">
          Network Packet Rate Trend (Time Range)
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
              Select a time range to view Network packet metrics
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
        Time Range data — Total packet rate (Error/Drop time series not available from backend)
      </p>
    </section>
  );
};
