import { useCallback } from 'react';
import { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, WS_SEND_DESTINATIONS } from '@/shared/types/websocket';

/**
 * Container 관리 전용 웹소켓 훅
 *
 * @example
 * ```tsx
 * const { status, isConnected, subscribeContainers } = useContainerWebSocket();
 *
 * useEffect(() => {
 *   if (isConnected) {
 *     subscribeContainers();
 *   }
 * }, [isConnected, subscribeContainers]);
 * ```
 */
export function useContainerWebSocket() {
  /**
   * 메시지 처리 콜백
   * TODO: 백엔드에서 실제 메시지 포맷 확인 후 수정
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data = JSON.parse(message.body);
      console.log('[Container WebSocket] Received:', data);

      // TODO: 실제 데이터 처리 로직 구현
      // 예: setContainerData(data);
      // 예: updateContainerStatus(data);
    } catch (error) {
      console.error('[Container WebSocket] Failed to parse message:', error);
    }
  }, []);

  const { status, error, isConnected, send } = useWebSocket({
    destination: WS_DESTINATIONS.CONTAINERS,
    onMessage: handleMessage,
    autoConnect: true,
    autoDisconnect: false,
  });

  /**
   * Container 상태 구독 요청
   * TODO: 백엔드에서 구독 방식 확인 후 수정
   */
  const subscribeContainers = useCallback(() => {
    if (!isConnected) {
      console.warn('[Container WebSocket] Not connected yet');
      return;
    }

    // 구독 메시지 발행 (필요한 경우)
    send(WS_SEND_DESTINATIONS.SUBSCRIBE_CONTAINERS, {
      action: 'subscribe',
      timestamp: Date.now(),
    });
  }, [isConnected, send]);

  /**
   * 특정 Container 상태 변경 알림 구독
   * TODO: 백엔드에서 개별 컨테이너 구독 방식 확인 후 구현
   */
  const subscribeContainerStatus = useCallback(
    (containerId: string) => {
      if (!isConnected) {
        console.warn('[Container WebSocket] Not connected yet');
        return;
      }

      console.log(`[Container WebSocket] Subscribing to container: ${containerId}`);
      // 개별 컨테이너 상태 구독 로직
    },
    [isConnected]
  );

  return {
    /** 현재 연결 상태 */
    status,
    /** 발생한 에러 */
    error,
    /** 연결되어 있는지 여부 */
    isConnected,
    /** 전체 Container 구독 요청 */
    subscribeContainers,
    /** 특정 Container 상태 구독 */
    subscribeContainerStatus,
    /** TODO: 실제 컨테이너 데이터 상태 추가 */
    // containerData,
    // containerStatusMap,
  };
}
