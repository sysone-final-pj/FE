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
   * - NESTED 구조 + time-series 포함
   * - Store에 병합 (기존 데이터의 time-series만 업데이트)
   */
  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const data: ContainerDashboardResponseDTO = JSON.parse(message.body);

        console.log('[Dashboard Detail WebSocket] Received:', {
          containerId: data.container.containerId,
          containerName: data.container.containerName,
          cpuDataPoints: data.cpu.cpuPercent.length,
          memoryDataPoints: data.memory.memoryPercent.length,
        });

        // Store 병합 (time-series 포함된 데이터로 업데이트)
        updateContainer(data);
      } catch (error) {
        console.error('[Dashboard Detail WebSocket] Failed to parse message:', error);
      }
    },
    [updateContainer]
  );

  // 동적 destination 생성
  const destination = containerId ? WS_DESTINATIONS.dashboardDetail(containerId) : null;

  // WebSocket 구독 (containerId가 null이면 구독 안함)
  const { isConnected } = useWebSocket({
    destination: destination!,
    onMessage: handleMessage,
    autoConnect: !!containerId, // containerId가 있을 때만 자동 연결
    autoDisconnect: false,
  });

  return {
    /** 연결되어 있는지 여부 */
    isConnected: containerId ? isConnected : false,
  };
}
