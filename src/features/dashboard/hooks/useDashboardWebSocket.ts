import { useCallback } from 'react';
import { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, WS_SEND_DESTINATIONS } from '@/shared/types/websocket';

/**
 * Dashboard 전용 웹소켓 훅
 *
 * @example
 * ```tsx
 * const { status, dashboardData, isConnected } = useDashboardWebSocket();
 *
 * useEffect(() => {
 *   if (dashboardData) {
 *     console.log('Dashboard data updated:', dashboardData);
 *   }
 * }, [dashboardData]);
 * ```
 */
export function useDashboardWebSocket() {
  /**
   * 메시지 처리 콜백
   * TODO: 백엔드에서 실제 메시지 포맷 확인 후 수정
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data = JSON.parse(message.body);
      console.log('[Dashboard WebSocket] Received:', data);

      // TODO: 실제 데이터 처리 로직 구현
      // 예: setDashboardData(data);
    } catch (error) {
      console.error('[Dashboard WebSocket] Failed to parse message:', error);
    }
  }, []);

  const { status, error, isConnected, send } = useWebSocket({
    destination: WS_DESTINATIONS.DASHBOARD,
    onMessage: handleMessage,
    autoConnect: true,
    autoDisconnect: false,
  });

  /**
   * Dashboard 구독 요청
   * TODO: 백엔드에서 구독 방식 확인 후 수정
   */
  const subscribeDashboard = useCallback(() => {
    if (!isConnected) {
      console.warn('[Dashboard WebSocket] Not connected yet');
      return;
    }

    // 구독 메시지 발행 (필요한 경우)
    send(WS_SEND_DESTINATIONS.SUBSCRIBE_DASHBOARD, {
      action: 'subscribe',
      timestamp: Date.now(),
    });
  }, [isConnected, send]);

  return {
    /** 현재 연결 상태 */
    status,
    /** 발생한 에러 */
    error,
    /** 연결되어 있는지 여부 */
    isConnected,
    /** Dashboard 구독 요청 */
    subscribeDashboard,
    /** TODO: 실제 대시보드 데이터 상태 추가 */
    // dashboardData,
  };
}
