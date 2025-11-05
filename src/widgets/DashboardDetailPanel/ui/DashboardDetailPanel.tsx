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
}

export const DashboardDetailPanel = ({ container }: DashboardDetailPanelProps) => {
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
        containerId={container.containerId}
      />

      {/* Stats Cards */}
      <div className="flex gap-2 mt-[14px]">
        <DetailStatCard
          title="CPU"
          mainValue={container.cpu.usage}
          subValue={`현재 : ${container.cpu.current} / 최대 : ${container.cpu.total}`}
        />
        <DetailStatCard
          title="Memory"
          mainValue={container.memory.usage}
          subValue={`현재 : ${container.memory.current} / 최대 : ${container.memory.total}`}
        />
        <DetailStatCard
          title="State"
          mainValue={container.state.status}
          subValue={`Uptime : ${container.state.uptime}`}
        />
        <DetailStatCard
          title="Healthy"
          mainValue={container.healthy.status}
          subValue={`응답시간 : ${container.healthy.lastCheck} / 에러율 : ${container.healthy.message}`}
        />
      </div>

      {/* Network Chart */}
      <NetworkChartCard
        rxValue={container.network?.rx}
        txValue={container.network?.tx}
      />

      {/* Images + Read&Write */}
      <div className="flex mt-4 gap-2">
        <ImageInfoCard
          repository={container.image?.repository}
          tag={container.image?.tag}
          imageId={container.image?.imageId}
          size={container.image?.size}
        />
        <ReadWriteChartCard />
      </div>

      {/* Event Summary + Storage Usage */}
      <div className="flex mt-2 gap-2">
        <EventSummaryCard />
        <StorageUsageCard
          percentage={container.storage?.percentage}
          used={container.storage?.used}
          available={container.storage?.total}
        />
      </div>
    </div>
  );
};
