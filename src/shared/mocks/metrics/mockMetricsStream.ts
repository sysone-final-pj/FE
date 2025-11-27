/**
 작성자: 김슬기
 */
// src/shared/mocks/metrics/mockMetricsStream.ts
export interface MockMetric {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  rx: number;
  tx: number;
}

/**
 * 실시간 Mock 메트릭 스트림
 * @param containerIds 선택된 컨테이너 ID 리스트
 * @param onData 데이터 업데이트 콜백
 */
export const startMockMetricsStream = (
  containerIds: string[],
  onData: (metrics: MockMetric[]) => void
): (() => void) => {
  const currentValues: Record<string, MockMetric> = {};

  // 초기값 세팅
  containerIds.forEach((id, i) => {
    currentValues[id] = {
      id,
      name: `Container-${i + 1}`,
      cpu: Math.random() * 50,
      memory: Math.random() * 50,
      rx: Math.random() * 200,
      tx: Math.random() * 200,
    };
  });

  const interval = setInterval(() => {
    const updated: MockMetric[] = containerIds.map((id) => {
      const prev = currentValues[id];
      const next = {
        ...prev,
        cpu: clamp(prev.cpu + (Math.random() * 20 - 10), 0, 100),
        memory: clamp(prev.memory + (Math.random() * 10 - 5), 0, 100),
        rx: clamp(prev.rx + (Math.random() * 50 - 25), 0, 500),
        tx: clamp(prev.tx + (Math.random() * 50 - 25), 0, 500),
      };
      currentValues[id] = next;
      return next;
    });

    onData(updated);
  }, 1000);

  // 정리(cleanup) 함수 반환
  return () => clearInterval(interval);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
