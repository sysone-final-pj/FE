import { useState, useEffect, useRef, useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { stompClient } from '@/shared/lib/websocket/stompClient';
import type { ContainerLogEntryDTO } from '@/shared/api/container';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

/**
 * Container Logs WebSocket 훅
 * - Topic: /topic/containers/{containerId}/logs
 * - 여러 컨테이너의 로그를 실시간으로 구독
 */
export function useLogWebSocket(containerIds: number[], enabled: boolean = true) {
  // 전체 로그 배열
  const [logs, setLogs] = useState<ContainerLogEntryDTO[]>([]);

  // 구독 ID 관리 (Map<containerId, subscriptionId>)
  const subscriptionsRef = useRef<Map<number, string>>(new Map());

  // WebSocket 연결 상태
  const status = useWebSocketStore((state) => state.status);
  const isConnected = status === 'connected';

  /**
   * 메시지 처리 콜백
   * - ContainerLogEntryDTO 파싱
   * - 새 로그를 배열 앞에 추가 (최신 로그가 위로)
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data: ContainerLogEntryDTO = JSON.parse(message.body);

      console.log('[Log WebSocket] New log received:', data);

      setLogs((prev) => [data, ...prev]); // 최신 로그를 앞에 추가
    } catch (error) {
      console.error('[Log WebSocket] parse error:', error);
    }
  }, []);

  /**
   * 특정 컨테이너 로그 구독
   */
  const subscribeContainer = useCallback(
    (containerId: number) => {
      const destination = `/topic/containers/${containerId}/logs`;
      const subscriptionId = stompClient.subscribe(destination, handleMessage);
      subscriptionsRef.current.set(containerId, subscriptionId);

      console.log(`[Log WebSocket] Subscribed to container ${containerId} logs`);
    },
    [handleMessage]
  );

  /**
   * 특정 컨테이너 로그 구독 해제
   */
  const unsubscribeContainer = useCallback((containerId: number) => {
    const subscriptionId = subscriptionsRef.current.get(containerId);
    if (subscriptionId) {
      stompClient.unsubscribe(subscriptionId);
      subscriptionsRef.current.delete(containerId);

      console.log(`[Log WebSocket] Unsubscribed from container ${containerId} logs`);
    }
  }, []);

  /**
   * 모든 구독 해제
   */
  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach((subscriptionId, containerId) => {
      stompClient.unsubscribe(subscriptionId);
      console.log(`[Log WebSocket] Unsubscribed from container ${containerId} logs`);
    });
    subscriptionsRef.current.clear();
  }, []);

  /**
   * 로그 초기화 (실시간 모드 재시작 시 사용)
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /**
   * containerIds 변경 감지 및 구독 관리
   */
  useEffect(() => {
    if (!enabled) {
      console.log('[Log WebSocket] Disabled by parent');
      unsubscribeAll();
      return;
    }

    if (!isConnected) {
      console.log('[Log WebSocket] Waiting for connection... Status:', status);
      return;
    }

    if (containerIds.length === 0) {
      console.log('[Log WebSocket] No containers selected');
      unsubscribeAll();
      return;
    }

    const currentIds = new Set(containerIds);
    const subscribedIds = new Set(subscriptionsRef.current.keys());

    // 추가된 컨테이너 구독
    const addedIds = [...currentIds].filter((id) => !subscribedIds.has(id));
    addedIds.forEach((id) => subscribeContainer(id));

    // 제거된 컨테이너 구독 해제
    const removedIds = [...subscribedIds].filter((id) => !currentIds.has(id));
    removedIds.forEach((id) => unsubscribeContainer(id));

    console.log('[Log WebSocket] Subscriptions updated:', {
      containerIds,
      added: addedIds,
      removed: removedIds,
      total: currentIds.size,
      currentSubscriptions: Array.from(subscriptionsRef.current.keys()),
    });

    // Cleanup: effect 재실행 시 기존 구독 정리 (containerIds 변경 시)
    return () => {
      subscribedIds.forEach((id) => unsubscribeContainer(id));
    };
  }, [
    containerIds,
    enabled,
    subscribeContainer,
    unsubscribeContainer,
    unsubscribeAll,
    isConnected,
    status,
  ]);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((subscriptionId) => {
        stompClient.unsubscribe(subscriptionId);
      });
      subscriptionsRef.current.clear();
      console.log('[Log WebSocket] Cleanup: All subscriptions cleared');
    };
  }, []);

  return {
    logs, // WebSocket으로 받은 실시간 로그
    isConnected,
    clearLogs, // 로그 초기화 함수
    unsubscribeAll, // 모든 구독 해제 함수
  };
}
