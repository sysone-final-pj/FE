import { useState, useEffect, useMemo } from 'react';
import { containerApi } from '@/shared/api/container';
import type { MetricDetail } from '@/shared/types/api/manage.types';
import { formatLocalToISOString } from '@/shared/lib/timeUtils';

/**
 * Container 초기 메트릭 데이터 로딩 훅 (REST API)
 * - 선택된 컨테이너들의 최근 1분 데이터를 로드
 * - WebSocket 연결 전 또는 차트 초기 데이터로 사용
 *
 * @param containerIds - 컨테이너 ID 배열
 * @param activeTab - 현재 활성화된 탭 (logs 탭에서는 API 호출하지 않음)
 */
export function useContainerInitialMetrics(
  containerIds: number[],
  activeTab?: string
) {
  const [initialMetricsMap, setInitialMetricsMap] = useState<Map<number, MetricDetail>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 배열의 실제 내용이 변경되었을 때만 useEffect를 트리거하기 위해 문자열로 변환
  const containerIdsKey = useMemo(() => containerIds.join(','), [containerIds]);

  useEffect(() => {
    // Logs 탭에서는 메트릭 데이터가 필요 없으므로 로드하지 않음
    if (activeTab === 'logs') {
      console.log('[useContainerInitialMetrics] Skipping load - Logs tab active');
      setInitialMetricsMap(new Map());
      setError(null);
      return;
    }

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

            // 전체 응답 데이터 로그
            console.log(`[useContainerInitialMetrics] ===== FULL REST API RESPONSE for container ${containerId} =====`);
            console.log('Full MetricDetail:', result.value);
            console.log('CPU data:', result.value.cpu);
            console.log('CPU cpuPercent array:', result.value.cpu.cpuPercent);
            console.log('Memory data:', result.value.memory);
            console.log('Memory memoryUsage array:', result.value.memory.memoryUsage);
            console.log('Network data:', result.value.network);
            console.log('Network rxBytesPerSec array:', result.value.network.rxBytesPerSec);
            console.log('===========================================');

            console.log(`[useContainerInitialMetrics] Summary for container ${containerId}:`, {
              startTime: result.value.startTime,
              endTime: result.value.endTime,
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
  }, [containerIdsKey, activeTab]); // containerIdsKey, activeTab 변경 시 재로드

  return {
    initialMetricsMap,
    isLoading,
    error,
  };
}
