import { useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, type ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { DashboardContainerListItem } from '@/shared/types/api/dashboard.types';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

/**
 * Dashboard List 전용 웹소켓 훅
 * - /topic/dashboard/list 구독 (1번 API)
 * - 모든 컨테이너 목록 수신 (카드 표시용, time-series 없음)
 * - Container Store 자동 업데이트
 * - 일시정지 중에는 업데이트 안함
 *
 * @example
 * ```tsx
 * const { isConnected, containers, isPaused, togglePause } = useDashboardWebSocket();
 *
 * return (
 *   <div>
 *     <button onClick={togglePause}>
 *       {isPaused ? '재개' : '일시정지'}
 *     </button>
 *     <ContainerGrid containers={containers} />
 *   </div>
 * );
 * ```
 */
export function useDashboardWebSocket() {
  // Store에서 상태 가져오기
  const updateContainer = useContainerStore((state) => state.updateContainer);
  const containers = useContainerStore((state) => state.getDisplayData());
  const isPaused = useContainerStore((state) => state.isPaused);
  const togglePause = useContainerStore((state) => state.togglePause);
  const status = useWebSocketStore((state) => state.status);
  const error = useWebSocketStore((state) => state.error);

  /**
   * 메시지 처리 콜백
   * - DashboardContainerListItem 파싱 (1번 API)
   * - DashboardContainerMetrics (FLAT) → ContainerDashboardResponseDTO (NESTED) 변환
   * - time-series 필드는 빈 배열로 설정 (detail에서 채워짐)
   * - Store에 자동 업데이트 (일시정지 체크는 Store에서 처리)
   */
  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const item: DashboardContainerListItem = JSON.parse(message.body);
        const { container } = item;

        console.log('[Dashboard List WebSocket] Received:', item);

        // FLAT 구조 → NESTED 구조로 변환 (Store 타입에 맞춤)
        const dto: ContainerDashboardResponseDTO = {
          container: {
            containerId: container.containerId,
            containerHash: container.containerHash,
            containerName: container.containerName,
            agentName: container.agentName,
            imageName: container.imageName,
            imageSize: container.imageSize,
            state: container.state,
            health: container.health,
          },
          cpu: {
            cpuPercent: [], // time-series는 detail에서 채워짐
            cpuCoreUsage: [],
            currentCpuPercent: container.cpuPercent,
            currentCpuCoreUsage: container.cpuCoreUsage,
            hostCpuUsageTotal: container.hostCpuUsageTotal,
            cpuUsageTotal: container.cpuUsageTotal,
            cpuUser: container.cpuUser,
            cpuSystem: container.cpuSystem,
            cpuQuota: container.cpuQuota,
            cpuPeriod: container.cpuPeriod,
            onlineCpus: container.onlineCpus,
            cpuLimitCores: 0,
            throttlingPeriods: container.throttlingPeriods,
            throttledPeriods: container.throttledPeriods,
            throttledTime: container.throttledTime,
            throttleRate: 0,
            summary: {
              current: container.cpuPercent,
              avg1m: 0,
              avg5m: 0,
              avg15m: 0,
              p95: 0,
            },
          },
          memory: {
            memoryUsage: [],
            memoryPercent: [],
            currentMemoryUsage: container.memUsage,
            currentMemoryPercent: container.memPercent,
            memLimit: container.memLimit,
            memMaxUsage: container.memMaxUsage,
            oomKills: 0,
          },
          network: {
            rxBytesPerSec: [],
            txBytesPerSec: [],
            rxPacketsPerSec: [],
            txPacketsPerSec: [],
            currentRxBytesPerSec: container.rxBytesPerSec,
            currentTxBytesPerSec: container.txBytesPerSec,
            totalRxBytes: container.rxBytes,
            totalTxBytes: container.txBytes,
            totalRxPackets: container.rxPackets,
            totalTxPackets: container.txPackets,
            networkTotalBytes: container.networkTotalBytes,
            rxErrors: container.rxErrors,
            txErrors: container.txErrors,
            rxDropped: container.rxDropped,
            txDropped: container.txDropped,
            rxFailureRate: container.rxFailureRate,
            txFailureRate: container.txFailureRate,
          },
          oom: {
            timeSeries: {},
            totalOomKills: 0,
            lastOomKilledAt: '',
          },
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          dataPoints: 0,
        };

        // Store 업데이트 (일시정지 중이면 Store 내부에서 무시됨)
        updateContainer(dto);
      } catch (error) {
        console.error('[Dashboard List WebSocket] Failed to parse message:', error);
      }
    },
    [updateContainer]
  );

  // WebSocket 구독
  const { isConnected } = useWebSocket({
    destination: WS_DESTINATIONS.DASHBOARD_LIST,
    onMessage: handleMessage,
    autoConnect: true,
    autoDisconnect: false,
  });

  return {
    /** 현재 연결 상태 */
    status,
    /** 발생한 에러 */
    error,
    /** 연결되어 있는지 여부 */
    isConnected,
    /** 화면에 표시할 컨테이너 목록 (일시정지 시 스냅샷, 아니면 실시간) */
    containers,
    /** 일시정지 상태 */
    isPaused,
    /** 일시정지 토글 */
    togglePause,
  };
}
