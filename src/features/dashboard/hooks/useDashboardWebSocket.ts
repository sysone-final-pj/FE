import { useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, type ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { DashboardContainerListItem, DashboardContainerMetrics } from '@/shared/types/api/dashboard.types';
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
  const removeContainer = useContainerStore((state) => state.removeContainer);
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
        // 디버깅: 원본 메시지 출력
        console.log('[Dashboard List WebSocket] Raw message.body:', message.body);

        // 메시지 파싱
        const parsed = JSON.parse(message.body);
        console.log('[Dashboard List WebSocket] Parsed message:', parsed);

        // 메시지 형식 감지 및 처리
        let items: DashboardContainerListItem[] = [];

        if (Array.isArray(parsed)) {
          // 케이스 1: 배열 형식 [{...}, {...}]
          console.log('[Dashboard List WebSocket] Array format detected, length:', parsed.length);
          items = parsed;
        } else if (parsed.data && Array.isArray(parsed.data)) {
          // 케이스 2: Response wrapper with array { statusCode, message, data: [...] }
          console.log('[Dashboard List WebSocket] Response wrapper with array detected');
          items = parsed.data;
        } else if (parsed.data && !Array.isArray(parsed.data)) {
          // 케이스 3: Response wrapper with single item { statusCode, message, data: {...} }
          console.log('[Dashboard List WebSocket] Response wrapper with single item detected');
          items = [parsed.data];
        } else if (parsed.container) {
          // 케이스 4: 단일 아이템 (nested 형식)
          console.log('[Dashboard List WebSocket] Single item (nested) format detected');
          items = [parsed];
        } else if (parsed.containerId !== undefined) {
          // 케이스 5: Flat 구조 (실제 백엔드 형식)
          console.log('[Dashboard List WebSocket] Flat structure format detected');

          // TEMPORARY: 백엔드에서 containerHash를 보내지 않는 버그
          // TODO: 백엔드 수정 후 아래 fallback 로직 제거하고 parsed.containerHash만 사용
          const containerHash = parsed.containerHash || parsed.imageId;

          // Flat → Nested 변환 (실제로 받은 필드만 사용)
          const wrappedItem: DashboardContainerListItem = {
            container: {
              // 실제로 받은 필드 (8개)
              containerId: parsed.containerId,
              containerHash: containerHash,
              containerName: parsed.containerName || '',
              imageName: parsed.imageName || '',
              state: parsed.state || 'UNKNOWN',
              health: parsed.health || 'UNKNOWN',
              cpuPercent: parsed.cpuPercent || 0,
              memPercent: parsed.memPercent || 0,

              // 타입 필수 필드만 기본값 (3개)
              agentId: 0,
              agentName: '',
              imageSize: 0,
            } as DashboardContainerMetrics, // 타입 단언: 나머지 메트릭은 다른 토픽에서 채워짐
            isFavorite: parsed.isFavorite || false,
          };
          items = [wrappedItem];
        } else {
          console.warn('[Dashboard List WebSocket] Unknown message format:', parsed);
          return;
        }

        console.log('[Dashboard List WebSocket] Processing items:', {
          count: items.length,
          first: items[0]?.container?.containerName || 'N/A',
        });

        // 각 아이템을 Store에 업데이트
        items.forEach((item) => {
          const container = item.container;

          // DELETED/UNKNOWN 필터링 (UI에서 완전히 제외)
          const state = container.state?.toUpperCase();
          if (state === 'DELETED' || state === 'UNKNOWN') {
            console.log('[Dashboard List WebSocket] Removing DELETED/UNKNOWN container from store:', {
              containerId: container.containerId,
              containerName: container.containerName,
              state: container.state,
            });
            // ✅ Store에서 완전히 제거
            removeContainer(container.containerId);
            return;
          }

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
        });
      } catch (error) {
        console.error('[Dashboard List WebSocket] Failed to parse message:', error, 'Raw:', message.body);
      }
    },
    [updateContainer, removeContainer]
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
