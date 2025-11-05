import { useCallback } from 'react';
import { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, WS_SEND_DESTINATIONS } from '@/shared/types/websocket';

/**
 * Alert 전용 웹소켓 훅
 *
 * @example
 * ```tsx
 * const { status, isConnected, subscribeAlerts } = useAlertWebSocket();
 *
 * useEffect(() => {
 *   if (isConnected) {
 *     subscribeAlerts();
 *   }
 * }, [isConnected, subscribeAlerts]);
 * ```
 */
export function useAlertWebSocket() {
  /**
   * 메시지 처리 콜백
   * TODO: 백엔드에서 실제 메시지 포맷 확인 후 수정
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data = JSON.parse(message.body);
      console.log('[Alert WebSocket] Received:', data);

      // TODO: 실제 데이터 처리 로직 구현
      // 예: setAlertData(data);
      // 예: showNotification(data);
    } catch (error) {
      console.error('[Alert WebSocket] Failed to parse message:', error);
    }
  }, []);

  const { status, error, isConnected, send } = useWebSocket({
    destination: WS_DESTINATIONS.ALERTS,
    onMessage: handleMessage,
    autoConnect: true,
    autoDisconnect: false,
  });

  /**
   * Alert 구독 요청
   * TODO: 백엔드에서 구독 방식 확인 후 수정
   */
  const subscribeAlerts = useCallback(() => {
    if (!isConnected) {
      console.warn('[Alert WebSocket] Not connected yet');
      return;
    }

    // 구독 메시지 발행 (필요한 경우)
    send(WS_SEND_DESTINATIONS.SUBSCRIBE_ALERTS, {
      action: 'subscribe',
      timestamp: Date.now(),
    });
  }, [isConnected, send]);

  /**
   * 사용자별 알림 구독 (개인 알림용)
   * TODO: 백엔드에서 사용자별 알림 방식 확인 후 구현
   */
  const subscribeUserAlerts = useCallback(() => {
    if (!isConnected) {
      console.warn('[Alert WebSocket] Not connected yet');
      return;
    }

    // 사용자별 알림 구독 로직
    console.log('[Alert WebSocket] Subscribing to user-specific alerts');
  }, [isConnected]);

  return {
    /** 현재 연결 상태 */
    status,
    /** 발생한 에러 */
    error,
    /** 연결되어 있는지 여부 */
    isConnected,
    /** Alert 구독 요청 */
    subscribeAlerts,
    /** 사용자별 알림 구독 */
    subscribeUserAlerts,
    /** TODO: 실제 알림 데이터 상태 추가 */
    // alertData,
    // unreadCount,
  };
}
