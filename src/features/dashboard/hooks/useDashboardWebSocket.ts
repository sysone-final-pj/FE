import { useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, type ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

/**
 * Dashboard 전용 웹소켓 훅
 * - 실시간 컨테이너 메트릭 수신
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
   * - ContainerDashboardResponseDTO 파싱
   * - Store에 자동 업데이트 (일시정지 체크는 Store에서 처리)
   */
  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const data: ContainerDashboardResponseDTO = JSON.parse(message.body);

        console.log('[Dashboard WebSocket] Received container update:', {
          id: data.containerId,
          name: data.containerName,
          cpu: data.cpuPercent,
          mem: data.memPercent,
        });

        // Store 업데이트 (일시정지 중이면 Store 내부에서 무시됨)
        updateContainer(data);
      } catch (error) {
        console.error('[Dashboard WebSocket] Failed to parse message:', error);
      }
    },
    [updateContainer]
  );

  // WebSocket 구독
  const { isConnected } = useWebSocket({
    destination: WS_DESTINATIONS.DASHBOARD,
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
