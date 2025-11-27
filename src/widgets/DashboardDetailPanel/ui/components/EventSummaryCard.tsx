/**
 작성자: 김슬기
 */
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
  // 서버 시간 기준 (수집시간)
  stdoutCount?: number;
  stderrCount?: number;
  // 클라이언트 시간 기준
  stdoutCountByCreatedAt?: number;
  stderrCountByCreatedAt?: number;
}

export const EventSummaryCard = ({
  totalCount = 0,
  stdoutCount = 0,
  stderrCount = 0,
  stdoutCountByCreatedAt = 0,
  stderrCountByCreatedAt = 0,
}: EventSummaryCardProps) => {
  // 퍼센트 포맷 함수: 0과 100은 정수, 그 외는 소수점 1자리
  const formatPercentage = (value: number): string => {
    if (value === 0 || value === 100) {
      return `${value}%`;
    }
    return `${value.toFixed(1)}%`;
  };

  // 서버 시간 기준 STDERR 비율 계산
  const stderrPercentageByServer = useMemo(() => {
    const total = stdoutCount + stderrCount;
    if (total === 0) return 0;
    return (stderrCount / total) * 100;
  }, [stdoutCount, stderrCount]);

  // 클라이언트 시간 기준 STDERR 비율 계산
  const stderrPercentageByClient = useMemo(() => {
    const total = stdoutCountByCreatedAt + stderrCountByCreatedAt;
    if (total === 0) return 0;
    return (stderrCountByCreatedAt / total) * 100;
  }, [stdoutCountByCreatedAt, stderrCountByCreatedAt]);

  // 서버 시간 기준 Doughnut chart 데이터
  const chartDataByServer = useMemo(() => ({
    labels: ['STDERR', 'STDOUT'],
    datasets: [
      {
        data: [stderrCount, stdoutCount],
        backgroundColor: ['#ff6c5e', '#c3c3c3'],
        borderWidth: 0,
      },
    ],
  }), [stderrCount, stdoutCount]);

  // 클라이언트 시간 기준 Doughnut chart 데이터
  const chartDataByClient = useMemo(() => ({
    labels: ['STDERR', 'STDOUT'],
    datasets: [
      {
        data: [stderrCountByCreatedAt, stdoutCountByCreatedAt],
        backgroundColor: ['#ff6c5e', '#c3c3c3'],
        borderWidth: 0,
      },
    ],
  }), [stderrCountByCreatedAt, stdoutCountByCreatedAt]);

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

  // 서버 시간 기준 중앙 텍스트 플러그인
  const centerTextPluginByServer: Plugin<'doughnut'> = useMemo(() => ({
    id: 'centerTextByServer',
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
      ctx.fillText(formatPercentage(stderrPercentageByServer), centerX, centerY);
      ctx.restore();
    },
  }), [stderrPercentageByServer]);

  // 클라이언트 시간 기준 중앙 텍스트 플러그인
  const centerTextPluginByClient: Plugin<'doughnut'> = useMemo(() => ({
    id: 'centerTextByClient',
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
      ctx.fillText(formatPercentage(stderrPercentageByClient), centerX, centerY);
      ctx.restore();
    },
  }), [stderrPercentageByClient]);

  return (
    <div className="bg-white rounded-xl border border-border-light pt-6 pr-4 pb-6 pl-4 flex flex-row gap-2.5 items-start justify-start h-[150px]">
      <div className="flex flex-col gap-0 items-start justify-start shrink-0 h-[116px]">
        {/* Header */}
        <div className="border-solid border-border-light border-b pr-3 pb-3 pl-3 flex flex-row gap-2.5 items-center justify-start self-stretch shrink-0">
          <div className="text-text-primary text-left font-semibold text-xl leading-[140%] w-[268px] flex items-center justify-start tracking-[-0.025em]">
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
                    data={chartDataByServer}
                    options={chartOptions}
                    plugins={[centerTextPluginByServer]}
                  />
                </div>
                <div className="flex flex-col gap-0.5 items-start justify-start shrink-0 w-[115px]">
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="bg-[#ff6c5e] shrink-0 w-2 h-2"></div>
                    <div className="text-[#767676] text-center font-medium text-xs leading-[140%] flex items-center justify-center tracking-[-0.025em]">
                      STDERR : {stderrCount}
                    </div>
                  </div>
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="bg-[#c3c3c3] shrink-0 w-2 h-2"></div>
                    <div className="text-[#767676] text-left font-medium text-xs leading-[140%] flex items-center justify-start tracking-[-0.025em]">
                      STDOUT : {stdoutCount}
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
                    data={chartDataByClient}
                    options={chartOptions}
                    plugins={[centerTextPluginByClient]}
                  />
                </div>
                <div className="flex flex-col gap-0.5 items-start justify-start shrink-0 w-[115px]">
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="bg-[#ff6c5e] shrink-0 w-2 h-2"></div>
                    <div className="text-[#767676] text-center font-medium text-xs leading-[140%] flex items-center justify-center tracking-[-0.025em]">
                      STDERR : {stderrCountByCreatedAt}
                    </div>
                  </div>
                  <div className="flex flex-row gap-0.5 items-center justify-start shrink-0 h-[17px]">
                    <div className="bg-[#c3c3c3] shrink-0 w-2 h-2"></div>
                    <div className="text-[#767676] text-left font-medium text-xs leading-[140%] flex items-center justify-start tracking-[-0.025em]">
                      STDOUT : {stdoutCountByCreatedAt}
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
