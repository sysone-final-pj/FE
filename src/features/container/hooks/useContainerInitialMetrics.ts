import { useState, useEffect } from 'react';
import { containerApi } from '@/shared/api/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { formatLocalToISOString } from '@/shared/lib/timeUtils';

/**
 * Container 초기 메트릭 데이터 로딩 훅 (REST API)
 * - 선택된 컨테이너들의 최근 1분 데이터를 로드
 * - WebSocket 연결 전 또는 차트 초기 데이터로 사용
 */
export function useContainerInitialMetrics(containerIds: number[]) {
  const [initialMetricsMap, setInitialMetricsMap] = useState<Map<number, MetricDetail>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 선택된 컨테이너가 없으면 초기화
    if (containerIds.length === 0) {
      setInitialMetricsMap(new Map());
      setError(null);
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 60 * 1000); // 1분 전

        console.log('[useContainerInitialMetrics] Loading initial data:', {
          containerIds,
          timeRange: {
            from: formatLocalToISOString(startTime),
            to: formatLocalToISOString(endTime),
          },
        });

        // 병렬로 모든 컨테이너 데이터 요청
        const promises = containerIds.map((id) =>
          containerApi.getContainerMetrics(id, {
            startTime: formatLocalToISOString(startTime),
            endTime: formatLocalToISOString(endTime),
          })
        );

        const results = await Promise.allSettled(promises);

        // 성공한 데이터만 Map에 저장
        const newMap = new Map<number, MetricDetail>();
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const containerId = containerIds[index];
            newMap.set(containerId, result.value);
            console.log(`[useContainerInitialMetrics] Loaded data for container ${containerId}:`, {
              dataPoints: result.value.dataPoints,
              cpuPoints: result.value.cpu.cpuPercent.length,
              memoryPoints: result.value.memory.memoryUsage.length,
              networkPoints: result.value.network.rxBytesPerSec.length,
            });
          } else {
            console.error(
              `[useContainerInitialMetrics] Failed to load container ${containerIds[index]}:`,
              result.reason
            );
          }
        });

        setInitialMetricsMap(newMap);
        console.log('[useContainerInitialMetrics] Initial data loaded:', {
          total: containerIds.length,
          success: newMap.size,
          failed: containerIds.length - newMap.size,
        });
      } catch (err) {
        console.error('[useContainerInitialMetrics] Unexpected error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [containerIds]); // containerIds 배열이 변경될 때마다 재로드

  return {
    initialMetricsMap,
    isLoading,
    error,
  };
}
