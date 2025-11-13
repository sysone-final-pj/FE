/********************************************************************************************
 * 💿 ReadWriteChartCard.tsx
 * ─────────────────────────────────────────────
 * Dashboard용 Block I/O (Read/Write) 실시간 카드
 * - 실시간 데이터 기반 평균 Read/Write 계산
 * - 막대 차트로 컨테이너별 비교
 * - 자동 단위 변환 (KB/s ~ GB/s)
 ********************************************************************************************/
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { formatBytesPerSec } from '@/shared/lib/formatters';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const ReadWriteChartCard: React.FC = () => {
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 모든 컨테이너의 Block I/O 데이터
  const blockIOData = useMemo(() => {
    const allData = getDisplayData();

    return allData.map((dto) => {
      const readVal = dto.blkReadPerSec ?? 0;
      const writeVal = dto.blkWritePerSec ?? 0;

      const formattedRead = formatBytesPerSec(readVal);
      const formattedWrite = formatBytesPerSec(writeVal);

      const [readValue] = formattedRead.split(' ');
      const [writeValue] = formattedWrite.split(' ');
      const unit = formattedRead.split(' ')[1] || 'MB/s';

      return {
        name: dto.containerName || 'Unknown',
        read: Number(readValue),
        write: Number(writeValue),
        unit,
      };
    });
  }, [getDisplayData]);

  // 평균 Read/Write 계산
  const avgMetrics = useMemo(() => {
    if (blockIOData.length === 0)
      return { read: '0', write: '0', unit: 'MB/s' };

    const avgRead =
      blockIOData.reduce((sum, d) => sum + d.read, 0) / blockIOData.length;
    const avgWrite =
      blockIOData.reduce((sum, d) => sum + d.write, 0) / blockIOData.length;

    return {
      read: avgRead.toFixed(1),
      write: avgWrite.toFixed(1),
      unit: blockIOData[0].unit,
    };
  }, [blockIOData]);

  // 차트 데이터
  const data = useMemo(
    () => ({
      labels: blockIOData.map((d) => d.name),
      datasets: [
        {
          label: 'Read',
          data: blockIOData.map((d) => d.read),
          backgroundColor: '#8979ff',
          borderRadius: 4,
        },
        {
          label: 'Write',
          data: blockIOData.map((d) => d.write),
          backgroundColor: '#ff928a',
          borderRadius: 4,
        },
      ],
    }),
    [blockIOData]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: '#777',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        grace: '20%', // 자동 스케일
        ticks: {
          callback: (v: number | string) => `${v} ${avgMetrics.unit}`,
          color: '#777',
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} ${avgMetrics.unit}`,
        },
      },
    },
  };

  return (
    <div className="bg-white w-[567px] h-[250px] rounded-xl border border-border-light p-4">
      {/* Header */}
      <div className="border-b border-border-light pb-3 px-3 flex items-center justify-between">
        <p className="text-[#505050] font-medium text-xl">Read & Write</p>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <span>
            Read : <span className="text-[#8979ff] font-medium">{avgMetrics.read}</span> {avgMetrics.unit}
          </span>
          <span>|</span>
          <span>
            Write : <span className="text-[#ff928a] font-medium">{avgMetrics.write}</span> {avgMetrics.unit}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[160px] bg-gray-50 rounded-lg mt-3 p-3">
        {blockIOData.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Data
          </div>
        )}
      </div>
    </div>
  );
};
