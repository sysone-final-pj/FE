/**
 작성자: 김슬기
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { stompClient } from '@/shared/lib/websocket/stompClient';
import { WS_DESTINATIONS } from '@/shared/types/websocket';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

/**
 * Container Metrics 다중 구독 웹소켓 훅
 */
export function useContainerMetricsWebSocket(containerIds: number[]) {
  // 각 컨테이너의 메트릭 데이터 (Map<containerId, MetricDetail>)
  const [metricsMap, setMetricsMap] = useState<Map<number, MetricDetail>>(new Map());

  // 구독 ID 관리 (Map<containerId, subscriptionId>)
  const subscriptionsRef = useRef<Map<number, string>>(new Map());

  // WebSocket 연결 상태
  const status = useWebSocketStore((state) => state.status);
  const isConnected = status === 'connected';

  /**
   * 메시지 처리 콜백
   * - MetricDetail 파싱 (4번 API)
   * - Map에 병합 업데이트
   * - 값이 동일하면 업데이트 스킵
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data: MetricDetail = JSON.parse(message.body);

      setMetricsMap((prev) => {
        const existing = prev.get(data.container.containerId);

        if (existing) {
          const cpuSame =
            existing.cpu?.currentCpuPercent === data.cpu?.currentCpuPercent;

          const memSame =
            existing.memory?.currentMemoryPercent ===
            data.memory?.currentMemoryPercent;

          const netSame =
            existing.network?.rxBytesPerSec.at(-1) ===
              data.network?.rxBytesPerSec.at(-1) &&
            existing.network?.txBytesPerSec.at(-1) ===
              data.network?.txBytesPerSec.at(-1);

          if (cpuSame && memSame && netSame) {
            // 값이 완전히 같으면 리렌더링 스킵
            return prev;
          }
        }

        // 차트에 필요 없는 time-series는 비워서 참조 변경 최소화
        const trimmed: MetricDetail = {
          ...data,
          cpu: {
            ...data.cpu,
            cpuPercent: [],
          },
          memory: {
            ...data.memory,
            memoryPercent: [],
          },
          network: {
            ...data.network,
            rxBytesPerSec: [],
            txBytesPerSec: [],
          },
        };

        const newMap = new Map(prev);
        newMap.set(data.container.containerId, trimmed);
        return newMap;
      });
    } catch (error) {
      console.error('[Container Metrics WebSocket] parse error:', error);
    }
  }, []);

  /**
   * 특정 컨테이너 구독
   */
  const subscribeContainer = useCallback(
    (containerId: number) => {
      const destination = WS_DESTINATIONS.containerMetrics(containerId);
      const subscriptionId = stompClient.subscribe(destination, handleMessage);
      subscriptionsRef.current.set(containerId, subscriptionId);

    },
    [handleMessage]
  );

  /**
   * 특정 컨테이너 구독 해제
   */
  const unsubscribeContainer = useCallback((containerId: number) => {
    const subscriptionId = subscriptionsRef.current.get(containerId);
    if (subscriptionId) {
      stompClient.unsubscribe(subscriptionId);
      subscriptionsRef.current.delete(containerId);

    }
  }, []);

  /**
   * containerIds 변경 감지 및 구독 관리
   */
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    if (containerIds.length === 0) {
      return;
    }

    const currentIds = new Set(containerIds);
    const subscribedIds = new Set(subscriptionsRef.current.keys());

    // 추가된 컨테이너 구독
    const addedIds = [...currentIds].filter((id) => !subscribedIds.has(id));
    addedIds.forEach((id) => subscribeContainer(id));

    // 제거된 컨테이너 구독 해제
    const removedIds = [...subscribedIds].filter((id) => !currentIds.has(id));
    removedIds.forEach((id) => {
      unsubscribeContainer(id);

      // Map에서도 제거
      setMetricsMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    });

    // Cleanup: effect 재실행 시 기존 구독 정리
    return () => {
      subscribedIds.forEach((id) => unsubscribeContainer(id));
    };
  }, [containerIds, subscribeContainer, unsubscribeContainer, isConnected, status]);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((subscriptionId) => {
        stompClient.unsubscribe(subscriptionId);
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    metricsMap,
    isConnected,
  };
}
