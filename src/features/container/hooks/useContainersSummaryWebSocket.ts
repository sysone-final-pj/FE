import { useState, useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS } from '@/shared/types/websocket';
import type { ManageContainerListItem } from '@/shared/types/api/manage.types';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

/**
 * Containers Summary 전용 웹소켓 훅
 * - /topic/containers/summary 구독 (3번 API)
 * - 모든 컨테이너 요약 정보 수신 (테이블용, FLAT 구조)
 * - Dashboard Store와 분리된 별도 state 관리
 * - Manage Containers 페이지 전용
 *
 * @example
 * ```tsx
 * const { containers, isConnected } = useContainersSummaryWebSocket();
 *
 * return (
 *   <table>
 *     {containers.map(c => (
 *       <tr key={c.id}>
 *         <td>{c.containerName}</td>
 *         <td>{c.cpuPercent}%</td>
 *       </tr>
 *     ))}
 *   </table>
 * );
 * ```
 */
export function useContainersSummaryWebSocket() {
  const [containers, setContainers] = useState<ManageContainerListItem[]>([]);
  const status = useWebSocketStore((state) => state.status);
  const error = useWebSocketStore((state) => state.error);

  /**
   * 메시지 처리 콜백
   * - ManageContainerListItem 파싱 (3번 API)
   * - FLAT 구조 (테이블용, time-series 없음)
   * - 로컬 state에 병합 업데이트
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      const item: ManageContainerListItem = JSON.parse(message.body);

      console.log('[Containers Summary WebSocket] Received:', {
        id: item.id,
        containerName: item.containerName,
        cpuPercent: item.cpuPercent,
      });

      // 기존 컨테이너 업데이트 또는 새로 추가
      setContainers((prev) => {
        const index = prev.findIndex((c) => c.id === item.id);

        if (index >= 0) {
          // 기존 컨테이너 업데이트
          const updated = [...prev];
          updated[index] = item;
          return updated;
        } else {
          // 새 컨테이너 추가
          return [...prev, item];
        }
      });
    } catch (error) {
      console.error('[Containers Summary WebSocket] Failed to parse message:', error);
    }
  }, []);

  // WebSocket 구독
  const { isConnected } = useWebSocket({
    destination: WS_DESTINATIONS.CONTAINERS_SUMMARY,
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
    /** 컨테이너 목록 (FLAT 구조) */
    containers,
    /** 수동으로 컨테이너 목록 설정 (REST 초기 로드용) */
    setContainers,
  };
}
