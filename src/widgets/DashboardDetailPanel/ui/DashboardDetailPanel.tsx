import { useState, useEffect } from 'react';
import type { DashboardContainerDetail } from '@/entities/container/model/types';
import { DetailPanelHeader } from './components/DetailPanelHeader';
import { DetailStatCard } from './components/DetailStatCard';
import { NetworkChartCard } from './components/NetworkChartCard';
import { ImageInfoCard } from './components/ImageInfoCard';
import { ReadWriteChartCard } from './components/ReadWriteChartCard';
import { EventSummaryCard } from './components/EventSummaryCard';
import { StorageUsageCard } from './components/StorageUsageCard';
import { EmptyDetailState } from './components/EmptyDetailState';
import { containerApi } from '@/shared/api/container';
import type { ContainerLogEntryDTO } from '@/shared/api/container';

interface DashboardDetailPanelProps {
  container?: DashboardContainerDetail;
  onClose?: () => void;
}

export const DashboardDetailPanel = ({ container }: DashboardDetailPanelProps) => {
  const [logs, setLogs] = useState<ContainerLogEntryDTO[]>([]);
  const [_logsLoading, setLogsLoading] = useState(false);

  // 컨테이너가 선택되면 로그 가져오기
  useEffect(() => {
    if (!container) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      try {
        setLogsLoading(true);
        // containerHash를 사용해서 로그 조회 (containerId는 hash 문자열)
        // API는 containerIds를 number[]로 받으므로, 실제 숫자 ID가 필요할 수 있음
        // 일단 최근 100개 로그만 가져옴
        const response = await containerApi.getLogs({
          size: 100,
        });

        // 현재 컨테이너의 로그만 필터링 (containerHash 기준)
        const containerLogs = response.logs.filter(
          log => log.containerName === container.containerName
        );

        setLogs(containerLogs);
      } catch (error) {
        console.error('[DashboardDetailPanel] Failed to fetch logs:', error);
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
  }, [container?.containerName]);

  // 컨테이너 데이터가 없으면 빈 상태 표시
  if (!container) {
    return <EmptyDetailState />;
  }

  // 로그 통계 계산
  const totalCount = logs.length;
  const normalCount = logs.filter(log => log.logSource === 'STDOUT').length;
  const errorCount = logs.filter(log => log.logSource === 'STDERR').length;

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
      <NetworkChartCard />

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
        <EventSummaryCard
          totalCount={totalCount}
          normalCount={normalCount}
          errorCount={errorCount}
          duration="최근 100개"
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
