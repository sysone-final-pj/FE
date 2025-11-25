/********************************************************************************************
 * 🚦 TrafficUsageChart.tsx (Real-time WebSocket Data)
 * ─────────────────────────────────────────────
 * 컨테이너별 누적 트래픽 사용량 (Rx + Tx) 실시간 표시
 ********************************************************************************************/
import React, { useMemo, useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ContainerData } from '@/shared/types/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BYTES_TO_GB = 1024 ** 3;

interface TrafficUsageChartProps {
  selectedContainers: ContainerData[];
  metricsMap: Map<number, MetricDetail>;
}

export const TrafficUsageChart: React.FC<TrafficUsageChartProps> = ({ selectedContainers, metricsMap }) => {
  // Chart ref & cleanup
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 차트 정리
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // 선택된 컨테이너의 실시간 메트릭 데이터
  const selectedMetrics = useMemo(() => {
    if (selectedContainers.length === 0) return [];

    const metrics: MetricDetail[] = [];
    selectedContainers.forEach((container) => {
      const metric = metricsMap.get(Number(container.id));
      if (metric) {
        metrics.push(metric);
      }
    });

    return metrics;
  }, [selectedContainers, metricsMap]);

  const data = {
    labels: selectedMetrics.map((metric) => metric?.container?.containerName || 'Unknown'),
    datasets: [
      {
        label: '누적 트래픽 (GB)',
        data: selectedMetrics.map((metric) => {
          // Rx + Tx bytes를 GB로 변환
          const totalBytes = (metric?.network?.totalRxBytes || 0) + (metric?.network?.totalTxBytes || 0);
          return Number((totalBytes / BYTES_TO_GB).toFixed(2));
        }),
        backgroundColor: ['#6366f1', '#3b82f6', '#f87171', '#fbbf24', '#06b6d4'],
        borderRadius: 4,
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: '#777' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 50,
          callback: (v: number | string) => `${v}GB`,
          color: '#777',
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => `${ctx.parsed.y} GB`,
        },
      },
    },
  };

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <h3 className="text-text-primary font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        누적 트래픽 사용량
      </h3>
      <div className="bg-white rounded-lg p-4 h-[320px]">
        {selectedMetrics.length > 0 ? (
          <Bar ref={chartRef} data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            데이터 없음
          </div>
        )}
      </div>
      <p className="text-xs text-text-secondary mt-2 text-right">
        WebSocket 실시간 데이터 — 누적 트래픽 (Rx + Tx)
      </p>
    </section>
  );
};
