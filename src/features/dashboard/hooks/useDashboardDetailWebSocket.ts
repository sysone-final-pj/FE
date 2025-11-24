import { useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, type ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import { useContainerStore } from '@/shared/stores/useContainerStore';

/**
 * Dashboard Detail 전용 웹소켓 훅
 * - /topic/dashboard/detail/{containerId} 구독 (2번 API)
 * - 선택된 컨테이너의 상세 메트릭 수신 (time-series 포함)
 * - Container Store에 병합 업데이트 (time-series 덮어쓰기)
 * - containerId 변경 시 자동으로 이전 구독 해제 후 새로운 컨테이너 구독
 *
 * @param containerId - 구독할 컨테이너 ID (null이면 구독 안함)
 *
 * @example
 * ```tsx
 * const [selectedId, setSelectedId] = useState<number | null>(null);
 * const { isConnected } = useDashboardDetailWebSocket(selectedId);
 *
 * // containerId 변경 시 자동 재구독
 * <button onClick={() => setSelectedId(123)}>Select Container 123</button>
 * ```
 */
export function useDashboardDetailWebSocket(containerId: number | null) {
  const updateContainer = useContainerStore((state) => state.updateContainer);

  /**
   * 메시지 처리 콜백
   * - ContainerDashboardResponseDTO 파싱 (2번 API)
   * - 메시지 형식 감지: 스냅샷(현재값) vs 시계열(배열) 형식
   * - Store에 병합 (기존 데이터의 time-series만 업데이트)
   */
  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const parsed = JSON.parse(message.body);
        let data: ContainerDashboardResponseDTO;

        // 메시지 형식 감지
          // 케이스 1: 스냅샷 형식 (현재값만, time-series 없음)
          // CPU와 Memory 객체 생성 (필드를 아예 포함하지 않음)
          const cpuData: any = {
            cpuPercent: [],
            cpuCoreUsage: [],
            currentCpuCoreUsage: parsed.cpu.cpuCoreUsage || 0,
            hostCpuUsageTotal: 0,
            cpuUsageTotal: parsed.cpu.cpuUsage || 0,
            cpuUser: 0,
            cpuSystem: 0,
            cpuQuota: 0,
            cpuPeriod: 0,
            onlineCpus: 0,
            cpuLimitCores: parsed.cpu.cpuLimitCores || 0,
            throttlingPeriods: 0,
            throttledPeriods: 0,
            throttledTime: 0,
            throttleRate: 0,
            summary: {
              current: 0,
              avg1m: 0,
              avg5m: 0,
              avg15m: 0,
              p95: 0,
            },
            // currentCpuPercent는 의도적으로 제외
          };

          const memoryData: any = {
            memoryUsage: [],
            memoryPercent: [],
            currentMemoryUsage: parsed.memory.memUsage || 0,
            memLimit: parsed.memory.memLimit || 0,
            memMaxUsage: 0,
            oomKills: 0,
            // currentMemoryPercent는 의도적으로 제외
          };

          data = {
            container: {
              containerId: parsed.container.containerId,
              containerHash: parsed.
              container.containerHash,
              containerName: parsed.container.containerName,
              agentName: parsed.container.agentName,
              imageName: parsed.container.repository || parsed.container.imageName,
              imageSize: parsed.container.imageSize,
              state: parsed.container.state,
              health: parsed.container.health,
            },
            cpu: cpuData,
            memory: memoryData,
            network: {
              rxBytesPerSec: [],
              txBytesPerSec: [],
              rxPacketsPerSec: [],
              txPacketsPerSec: [],
              currentRxBytesPerSec: parsed.network.rxBytesPerSec || 0,
              currentTxBytesPerSec: parsed.network.txBytesPerSec || 0,
              totalRxBytes: 0,
              totalTxBytes: 0,
              totalRxPackets: 0,
              totalTxPackets: 0,
              networkTotalBytes: 0,
              rxErrors: 0,
              txErrors: 0,
              rxDropped: 0,
              txDropped: 0,
              rxFailureRate: 0,
              txFailureRate: 0,
            },
            storage: parsed.storage ? {
              storageLimit: parsed.storage.storageLimit || 0,
              storageUsed: parsed.storage.storageUsed || 0,
            } : undefined,
            logs: parsed.logs ? {
              stdoutCount: parsed.logs.stdoutCount || 0,
              stderrCount: parsed.logs.stderrCount || 0,
              stdoutCountByCreatedAt: parsed.logs.stdoutCountByCreatedAt || 0,
              stderrCountByCreatedAt: parsed.logs.stderrCountByCreatedAt || 0,
            } : undefined,
            blockIO: parsed.blockIO ? {
              blkReadPerSec: [],       // time-series로 빈 배열
              blkWritePerSec: [],

              // 그대로 (ReadWriteChartCard에서 사용)
              currentBlkReadPerSec: parsed.blockIO.blkReadPerSec || 0,  // ⚠️ 누적값
              currentBlkWritePerSec: parsed.blockIO.blkWritePerSec || 0, // ⚠️ 누적값


            } : undefined,

            oom: {
              timeSeries: {},
              totalOomKills: 0,
              lastOomKilledAt: '',
            },
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            dataPoints: 0,
          };
  

        // console.log('🔵 [Dashboard Detail WebSocket] 📊 Parsed data summary:', {
        //   containerId: data.container.containerId,
        //   containerName: data.container.containerName,
        //   containerHash: data.container.containerHash,
        //   state: data.container.state,
        //   health: data.container.health,
        //   cpu: {
        //     timeSeriesLength: data.cpu.cpuPercent.length,
        //     currentCpuPercent: data.cpu.currentCpuPercent,
        //     currentCpuCoreUsage: data.cpu.currentCpuCoreUsage,
        //     cpuLimitCores: data.cpu.cpuLimitCores,
        //     summary: data.cpu.summary,
        //   },
        //   memory: {
        //     timeSeriesLength: data.memory.memoryPercent.length,
        //     currentMemoryUsage: data.memory.currentMemoryUsage,
        //     currentMemoryPercent: data.memory.currentMemoryPercent,
        //     memLimit: data.memory.memLimit,
        //   },
        //   network: {
        //     rxTimeSeriesLength: data.network?.rxBytesPerSec?.length || 0,
        //     txTimeSeriesLength: data.network?.txBytesPerSec?.length || 0,
        //     currentRxBytesPerSec: data.network?.currentRxBytesPerSec || 0,
        //     currentTxBytesPerSec: data.network?.currentTxBytesPerSec || 0,
        //   },
        //   blockIO: data.blockIO ? {
        //     readTimeSeriesLength: data.blockIO.blkReadPerSec?.length || 0,
        //     writeTimeSeriesLength: data.blockIO.blkWritePerSec?.length || 0,
        //     currentBlkReadPerSec: data.blockIO.currentBlkReadPerSec,
        //     currentBlkWritePerSec: data.blockIO.currentBlkWritePerSec,
        //   } : 'N/A',
        //   dataPoints: data.dataPoints,
        //   startTime: data.startTime,
        //   endTime: data.endTime,
        // });

        // Store 병합 (time-series 포함된 데이터로 업데이트)
        updateContainer(data);
      } catch (error) {
        console.error('🔵 [Dashboard Detail WebSocket] ❌ Failed to parse message:', error);
        console.error('🔵 [Dashboard Detail WebSocket] Raw message body:', message.body);
      }
    },
    [updateContainer]
  );

  // 동적 destination 생성
  const destination = containerId ? WS_DESTINATIONS.dashboardDetail(containerId) : null;

  // WebSocket 구독 (containerId가 null이면 구독 안함)
  const { isConnected } = useWebSocket({
    destination: destination || '',
    onMessage: handleMessage,
    autoConnect: !!containerId && destination !== null, // containerId가 있을 때만 자동 연결
    autoDisconnect: false,
  });

  return {
    /** 연결되어 있는지 여부 */
    isConnected: containerId ? isConnected : false,
  };
}
