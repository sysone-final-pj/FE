import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Plugin } from 'chart.js/types/index.esm';


ChartJS.register(ArcElement, Tooltip, Legend);

interface StorageUsageContentProps {
  percentage: number;
  used: string;
  available: string;
}

export const StorageUsageContent = ({ percentage, used, available }: StorageUsageContentProps) => {
  // Doughnut chart 데이터
  const chartData = useMemo(() => ({
    labels: ['사용 중', '여유 공간'],
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ['#0199ee', '#c3c3c3'],
        borderWidth: 0,
      },
    ],
  }), [percentage]);

  // Doughnut chart 옵션
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  }), []);

  // 중앙 텍스트 플러그인
  const centerTextPlugin: Plugin<'doughnut'> = useMemo(() => ({
    id: 'centerText',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#767676';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${percentage}%`, centerX, centerY);
      ctx.restore();
    },
  }), [percentage]);

  return (
    <div className="flex gap-[18px] items-center px-3">
      <div className="relative w-[62px] h-[62px]">
        <Doughnut data={chartData} options={chartOptions} plugins={[centerTextPlugin]} />
      </div>
      <div>
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
          <div className="w-2 h-2 bg-[#0199ee]" />
          <p>사용 중인 공간 : {used}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-2 h-2 bg-[#c3c3c3]" />
          <p>여유 공간 : {available}</p>
        </div>
      </div>
    </div>
  );
};
