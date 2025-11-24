import { useMemo } from 'react';
import type { DashboardContainerDetail } from '@/entities/container/model/types';
import { DetailPanelHeader } from './components/DetailPanelHeader';
import { DetailStatCard } from './components/DetailStatCard';
import { NetworkChartCard } from './components/NetworkChartCard';
import { ImageInfoCard } from './components/ImageInfoCard';
import { ReadWriteChartCard } from './components/ReadWriteChartCard';
import { EventSummaryCard } from './components/EventSummaryCard';
import { StorageUsageCard } from './components/StorageUsageCard';
import { EmptyDetailState } from './components/EmptyDetailState';

interface DashboardDetailPanelProps {
  container?: DashboardContainerDetail;
  onClose?: () => void;
  /** List의 CPU percent (카드와 동일한 값) */
  listCpuPercent?: string;
  /** List의 Memory percent (카드와 동일한 값) */
  listMemoryPercent?: string;
}

export const DashboardDetailPanel = ({
  container,
  listCpuPercent,
  listMemoryPercent
}: DashboardDetailPanelProps) => {
  // containerId(string)를 containerId(number)로 변환
  const containerId = useMemo(() => {
    if (!container) return null;

    // container.containerId는 이제 실제 containerId (string으로 변환된 값)
    // Number()로 변환만 하면 됨
    return Number(container.containerId);
  }, [container]);

  // 컨테이너 데이터가 없으면 빈 상태 표시
  if (!container) {
    return <EmptyDetailState />;
  }

  return (
    <div className="w-full rounded-xl">
      {/* Header */}
      <DetailPanelHeader
        agentName={container.agentName}
        containerName={container.containerName}
        containerHash={container.containerHash}
      />

      {/* Stats Cards */}
      <div className="flex gap-2 mt-[14px]">
        <DetailStatCard
          title="CPU"
          mainValue={listCpuPercent ?? container.cpu.usage}
          subValue={`현재 : ${container.cpu.current}`}
          subValueLine2={`최대 : ${container.cpu.total}`}
        />
        <DetailStatCard
          title="Memory"
          mainValue={listMemoryPercent ?? container.memory.usage}
          subValue={`현재 : ${container.memory.current}`}
          subValueLine2={`최대 : ${container.memory.total}`}
        />
        <DetailStatCard
          title="State"
          mainValue={container.state.status}
          subValue={`Uptime : ${container.state.uptime}`}
          variant="state"
        />
        <DetailStatCard
          title="Healthy"
          mainValue={container.healthy.status}
          variant="healthy"
        />
      </div>

      {/* Network Chart */}
      {containerId && <NetworkChartCard containerId={containerId} />}

      {/* Images + Read&Write */}
      <div className="flex mt-2 gap-2">
        <ImageInfoCard
          repository={container.image?.repository}
          tag={container.image?.tag}
          imageId={container.image?.imageId}
          size={container.image?.size}
        />
        {containerId && <ReadWriteChartCard containerId={containerId} />}
      </div>

      {/* Event Summary + Storage Usage */}
      <div className="flex mt-2 gap-2">
        <EventSummaryCard
          totalCount={container.logs?.totalCount}
          stdoutCount={container.logs?.stdoutCount}
          stderrCount={container.logs?.stderrCount}
          stdoutCountByCreatedAt={container.logs?.stdoutCountByCreatedAt}
          stderrCountByCreatedAt={container.logs?.stderrCountByCreatedAt}
        />
        <StorageUsageCard
          percentage={container.storage?.percentage}
          used={container.storage?.used}
          available={container.storage?.total}
        />
      </div>
    </div>
  );
};
