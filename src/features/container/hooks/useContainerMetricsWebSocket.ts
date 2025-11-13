import { useState, useEffect, useRef, useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { stompClient } from '@/shared/lib/websocket/stompClient';
import { WS_DESTINATIONS } from '@/shared/types/websocket';
import type { MetricDetail } from '@/shared/types/api/manage.types';

/**
 * Container Metrics 다중 구독 웹소켓 훅
 * - /topic/containers/{id}/metrics 다중 구독 (4번 API)
 * - 선택된 컨테이너들의 메트릭 상세 정보 수신 (time-series 포함)
 * - Map<containerId, MetricDetail> 형태로 데이터 관리
 * - containerIds 변경 시 자동으로 이전 구독 해제 후 새로운 컨테이너 구독
 *
 * @param containerIds - 구독할 컨테이너 ID 목록
 *
 * @example
 * ```tsx
 * const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]);
 * const { metricsMap, isConnected } = useContainerMetricsWebSocket(selectedIds);
 *
 * // 차트에서 사용
 * const metric = metricsMap.get(containerId);
 * if (metric) {
 *   const cpuData = metric.cpu.cpuPercent; // TimeSeriesDataPoint[]
 * }
 * ```
 */
export function useContainerMetricsWebSocket(containerIds: number[]) {
  // 각 컨테이너의 메트릭 데이터 (Map<containerId, MetricDetail>)
  const [metricsMap, setMetricsMap] = useState<Map<number, MetricDetail>>(new Map());

  // 구독 ID 관리 (Map<containerId, subscriptionId>)
  const subscriptionsRef = useRef<Map<number, string>>(new Map());

  /**
   * 메시지 처리 콜백
   * - MetricDetail 파싱 (4번 API)
   * - NESTED 구조 + time-series 포함
   * - Map에 병합 업데이트
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data: MetricDetail = JSON.parse(message.body);

      console.log('[Container Metrics WebSocket] Received:', {
        containerId: data.container.containerId,
        containerName: data.container.containerName,
        cpuDataPoints: data.cpu.cpuPercent.length,
        memoryDataPoints: data.memory.memoryPercent.length,
        networkDataPoints: data.network.rxBytesPerSec.length,
      });

      // Map에 업데이트
      setMetricsMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.container.containerId, data);
        return newMap;
      });
    } catch (error) {
      console.error('[Container Metrics WebSocket] Failed to parse message:', error);
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

      console.log(`[Container Metrics WebSocket] Subscribed to container ${containerId}`);
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

      console.log(`[Container Metrics WebSocket] Unsubscribed from container ${containerId}`);
    }
  }, []);

  /**
   * containerIds 변경 감지 및 구독 관리
   */
  useEffect(() => {
    // 연결되지 않았으면 대기
    if (!stompClient.isConnected()) {
      console.log('[Container Metrics WebSocket] Waiting for connection...');
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

    console.log('[Container Metrics WebSocket] Subscriptions updated:', {
      added: addedIds.length,
      removed: removedIds.length,
      total: currentIds.size,
    });

    // Cleanup: 모든 구독 해제
    return () => {
      subscribedIds.forEach((id) => unsubscribeContainer(id));
    };
  }, [containerIds, subscribeContainer, unsubscribeContainer]);

  /**
   * WebSocket 연결 시작
   */
  useEffect(() => {
    stompClient.connect();

    return () => {
      // 컴포넌트 언마운트 시 모든 구독 해제
      subscriptionsRef.current.forEach((subscriptionId) => {
        stompClient.unsubscribe(subscriptionId);
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    /** 각 컨테이너의 메트릭 데이터 (Map<containerId, MetricDetail>) */
    metricsMap,
    /** WebSocket 연결 여부 */
    isConnected: stompClient.isConnected(),
  };
}
