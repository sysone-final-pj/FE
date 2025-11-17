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
   * - API 응답 래퍼에서 ManageContainerListItem[] 추출 (3번 API)
   * - FLAT 구조 (테이블용, time-series 없음)
   * - 전체 컨테이너 배열로 state 교체
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      // 🔍 디버깅: 원본 메시지 출력
      console.log('[Containers Summary WebSocket] Raw message.body:', message.body);

      // 메시지 파싱
      const parsed = JSON.parse(message.body);
      console.log('[Containers Summary WebSocket] Parsed message:', parsed);

      // 메시지 형식 감지 및 처리
      let containersList: ManageContainerListItem[] = [];

      if (Array.isArray(parsed)) {
        // 케이스 1: 직접 배열 형식 [{...}, {...}]
        console.log('[Containers Summary WebSocket] Direct array format detected');
        containersList = parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        // 케이스 2: Response wrapper 형식 { statusCode, message, data: [...] }
        console.log('[Containers Summary WebSocket] Response wrapper format detected');
        containersList = parsed.data;
      } else {
        console.warn('[Containers Summary WebSocket] Unknown message format:', parsed);
        return;
      }

      console.log('[Containers Summary WebSocket] Processed containers:', {
        count: containersList.length,
        first3: containersList.slice(0, 3).map(c => ({
          id: c.id,
          containerName: c.containerName,
          cpuPercent: c.cpuPercent,
        })),
      });

      // 증분 업데이트 방식으로 변경 (Dashboard 패턴)
      setContainers((prev) => {
        // 변경 사항이 있는지 확인
        if (prev.length === 0 && containersList.length > 0) {
          // 초기 로드
          console.log('[Containers Summary WebSocket] Initial load:', containersList.length);
          return containersList;
        }

        // 기존 컨테이너와 merge
        const updated = [...prev];
        let hasChanges = false;

        containersList.forEach((newContainer) => {
          const existingIndex = updated.findIndex(
            (c) => c.containerHash === newContainer.containerHash
          );

          if (existingIndex >= 0) {
            // 기존 컨테이너 업데이트 (값 변경 확인)
            const existing = updated[existingIndex];
            const hasValueChanges =
              existing.cpuPercent !== newContainer.cpuPercent ||
              existing.memPercent !== newContainer.memPercent ||
              existing.state !== newContainer.state ||
              existing.health !== newContainer.health;

            if (hasValueChanges) {
              updated[existingIndex] = { ...existing, ...newContainer };
              hasChanges = true;
            }
          } else {
            // 새 컨테이너 추가
            updated.push(newContainer);
            hasChanges = true;
          }
        });

        // 삭제된 컨테이너 제거
        const newHashes = new Set(containersList.map(c => c.containerHash));
        const filtered = updated.filter(c => newHashes.has(c.containerHash));
        if (filtered.length !== updated.length) {
          hasChanges = true;
        }

        if (hasChanges) {
          console.log('[Containers Summary WebSocket] Updated containers:', filtered.length);
          return filtered;
        }

        // 변경 없으면 이전 상태 유지 (재렌더링 방지)
        return prev;
      });
    } catch (error) {
      console.error('[Containers Summary WebSocket] Failed to parse message:', error, 'Raw:', message.body);
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
