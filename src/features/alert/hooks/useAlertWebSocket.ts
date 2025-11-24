import { useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, type AlertMessageResponseDTO } from '@/shared/types/websocket';
import { useAlertStore } from '@/shared/stores/useAlertStore';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

/**
 * Alert 전용 웹소켓 훅
 * - 실시간 알림 수신
 * - Alert Store 자동 업데이트
 * - localStorage 자동 저장
 * - Toast 알림 표시 (선택적)
 *
 * @example
 * ```tsx
 * const { isConnected, notifications, unreadCount, markAsRead } = useAlertWebSocket();
 *
 * return (
 *   <div>
 *     <Badge count={unreadCount} />
 *     <AlertList
 *       alerts={notifications}
 *       onRead={markAsRead}
 *     />
 *   </div>
 * );
 * ```
 */
export function useAlertWebSocket() {
  // Store에서 상태 가져오기
  const addNotification = useAlertStore((state) => state.addNotification);
  const notifications = useAlertStore((state) => state.notifications);
  const unreadCount = useAlertStore((state) => state.unreadCount);
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const markAllAsRead = useAlertStore((state) => state.markAllAsRead);
  const removeNotification = useAlertStore((state) => state.removeNotification);
  const clearAll = useAlertStore((state) => state.clearAll);
  const clearRead = useAlertStore((state) => state.clearRead);
  const status = useWebSocketStore((state) => state.status);
  const error = useWebSocketStore((state) => state.error);

  /**
   * 메시지 처리 콜백
   * - AlertMessageResponseDTO 파싱
   * - Store에 자동 추가 (localStorage 자동 저장)
   * - Toast 알림 표시 (선택적 - 컴포넌트에서 처리 가능)
   */
  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const data: AlertMessageResponseDTO = JSON.parse(message.body);
        // Store 업데이트 (localStorage 자동 저장)
        addNotification(data);

        // TODO (선택적): Toast 알림 표시
        // showToast({ title: data.title, message: data.message });
      } catch (error) {
        console.error('[Alert WebSocket] Failed to parse message:', error);
      }
    },
    [addNotification]
  );

  // WebSocket 구독 - 사용자별 알림 (/user/queue/alerts)
  const { isConnected } = useWebSocket({
    destination: WS_DESTINATIONS.USER_ALERTS,
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
    /** 모든 알림 목록 (읽음/읽지 않음 포함) */
    notifications,
    /** 읽지 않은 알림 개수 */
    unreadCount,
    /** 특정 알림 읽음 처리 */
    markAsRead,
    /** 모든 알림 읽음 처리 */
    markAllAsRead,
    /** 특정 알림 삭제 */
    removeNotification,
    /** 모든 알림 삭제 */
    clearAll,
    /** 읽은 알림만 삭제 */
    clearRead,
  };
}
