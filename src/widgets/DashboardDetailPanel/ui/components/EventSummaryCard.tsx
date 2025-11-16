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

interface EventSummaryCardProps {
  totalCount?: number;
  normalCount?: number;
  errorCount?: number;
  duration?: string;
}

export const EventSummaryCard = ({
  totalCount = 100,
  normalCount = 80,
  errorCount = 20,
}: EventSummaryCardProps) => {
  // STDERR 비율 계산
  const stderrPercentage = useMemo(() => {
    const total = normalCount + errorCount;
    return total > 0 ? Math.round((errorCount / total) * 100) : 0;
  }, [normalCount, errorCount]);

  // Doughnut chart 데이터
  const chartData = useMemo(() => ({
    labels: ['STDERR', 'STDOUT'],
    datasets: [
      {
        data: [errorCount, normalCount],
        backgroundColor: ['#ff6c5e', '#c3c3c3'],
        borderWidth: 0,
      },
    ],
  }), [errorCount, normalCount]);

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
      ctx.fillStyle = '#000000';
      ctx.font = '600 12px Pretendard';
      ctx.fillText(`${stderrPercentage}%`, centerX, centerY);
      ctx.restore();
    },
  }), [stderrPercentage]);

  return (
    <div className="bg-white rounded-xl border border-border-light pt-6 pr-4 pb-6 pl-4 flex flex-row gap-2.5 items-start justify-start h-[150px]">
      <div className="flex flex-col gap-0 items-start justify-start shrink-0 h-[116px]">
        {/* Header */}
        <div className="border-solid border-border-light border-b pr-3 pb-3 pl-3 flex flex-row gap-2.5 items-center justify-start self-stretch shrink-0">
          <div className="text-[#505050] text-left font-semibold text-xl leading-[140%] w-[268px] flex items-center justify-start tracking-[-0.025em]">
            Event Summary
          </div>
          <div className="flex flex-col gap-2.5 items-end justify-center shrink-0 w-48 h-7">
            <div className="bg-white rounded-xl flex flex-row gap-2 items-center justify-start shrink-0">
              <div className="flex flex-row gap-2 items-center justify-start shrink-0">
                <div className="flex flex-row gap-2 items-center justify-start shrink-0">
                  <div className="text-[#555555] text-left font-medium text-xs leading-[140%] flex items-center justify-start tracking-[-0.025em]">
                    Total
                  </div>
                </div>
                <div className="bg-border-light shrink-0 w-px h-4"></div>
              </div>
              <div className="text-[#767676] text-left font-medium text-xs leading-[140%] flex items-center justify-start tracking-[-0.025em]">
                {totalCount}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="flex flex-row gap-5 items-center justify-center shrink-0 w-[494px] h-[76px]">
          {/* 서버 시간(수집시간) 기준 */}
          <div className="flex flex-col gap-0 items-start justify-center flex-1">
            <div className="flex flex-row gap-2.5 items-center justify-center self-stretch shrink-0">
              <div className="flex flex-row gap-2.5 items-center justify-start shrink-0">
                <div className="shrink-0 w-[62px] h-[62px]">
                  <Doughnut
                    data={chartData}
                    options={chartOptions}
                    plugins={[centerTextPlugin]}
                  />
                </div>
                <div className="flex flex-col gap-0.5 items-start justify-start shrink-0 w-[115px]">
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="bg-[#ff6c5e] shrink-0 w-2 h-2"></div>
                    <div className="text-[#767676] text-center font-medium text-xs leading-[140%] flex items-center justify-center tracking-[-0.025em]">
                      STDERR : {errorCount}
                    </div>
                  </div>
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="bg-[#c3c3c3] shrink-0 w-2 h-2"></div>
                    <div className="text-[#767676] text-left font-medium text-xs leading-[140%] flex items-center justify-start tracking-[-0.025em]">
                      STDOUT : {normalCount}
                    </div>
                  </div>
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="text-[#000000] text-left font-medium text-xs leading-[140%] flex items-center justify-start tracking-[-0.025em]">
                      서버 시간(수집시간) 기준
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 클라이언트 시간 기준 */}
          <div className="flex flex-col gap-0 items-start justify-center flex-1">
            <div className="flex flex-row gap-2.5 items-center justify-center self-stretch shrink-0">
              <div className="flex flex-row gap-2.5 items-center justify-start shrink-0">
                <div className="shrink-0 w-[62px] h-[62px]">
                  <Doughnut
                    data={chartData}
                    options={chartOptions}
                    plugins={[centerTextPlugin]}
                  />
                </div>
                <div className="flex flex-col gap-0.5 items-start justify-start shrink-0 w-[115px]">
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="bg-[#ff6c5e] shrink-0 w-2 h-2"></div>
                    <div className="text-[#767676] text-center font-medium text-xs leading-[140%] flex items-center justify-center tracking-[-0.025em]">
                      STDERR : {errorCount}
                    </div>
                  </div>
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="bg-[#c3c3c3] shrink-0 w-2 h-2"></div>
                    <div className="text-[#767676] text-left font-medium text-xs leading-[140%] flex items-center justify-start tracking-[-0.025em]">
                      STDOUT : {normalCount}
                    </div>
                  </div>
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="text-[#000000] text-left font-medium text-xs leading-[140%] flex items-center justify-start tracking-[-0.025em]">
                      클라이언트 시간 기준
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
