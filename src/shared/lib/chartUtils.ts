/**
 작성자: 김슬기
 */
/**
 * 차트 데이터 변환 유틸리티
 * 시계열 데이터를 차트에 적합한 형태로 변환
 */

import type { TimeSeriesDataPoint } from '@/shared/types/api/common.types';
import {
  convertBytesToMB,
  convertToMbps,
  convertToKbps,
  convertToGbps,
  convertNetworkSpeedAuto
} from './formatters';

/**
 * 메모리 데이터를 MB로 변환
 * timestamp는 유지하면서 value만 MB로 변환
 * @param data - 시계열 데이터 배열
 * @returns MB 단위로 변환된 시계열 데이터
 */
export function convertMemoryDataToMB(data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] {
  return data.map(point => ({
    timestamp: point.timestamp,
    value: convertBytesToMB(point.value),
  }));
}

/**
 * 네트워크 데이터를 Mbps로 변환
 * timestamp는 유지하면서 value만 Mbps로 변환
 * @param data - 시계열 데이터 배열 (bytes/sec 단위)
 * @returns Mbps 단위로 변환된 시계열 데이터
 */
export function convertNetworkDataToMbps(data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] {
  return data.map(point => ({
    timestamp: point.timestamp,
    value: convertToMbps(point.value),
  }));
}

/**
 * 네트워크 데이터를 Kbps로 변환
 * @param data - 시계열 데이터 배열 (bytes/sec 단위)
 * @returns Kbps 단위로 변환된 시계열 데이터
 */
export function convertNetworkDataToKbps(data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] {
  return data.map(point => ({
    timestamp: point.timestamp,
    value: convertToKbps(point.value),
  }));
}

/**
 * 네트워크 데이터를 Gbps로 변환
 * @param data - 시계열 데이터 배열 (bytes/sec 단위)
 * @returns Gbps 단위로 변환된 시계열 데이터
 */
export function convertNetworkDataToGbps(data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] {
  return data.map(point => ({
    timestamp: point.timestamp,
    value: convertToGbps(point.value),
  }));
}

/**
 * 네트워크 데이터의 최대값을 기준으로 적절한 단위 선택
 * @param data - 시계열 데이터 배열 (bytes/sec 단위)
 * @returns 적절한 단위 ('Kbps' | 'Mbps' | 'Gbps')
 */
export function determineNetworkUnit(data: TimeSeriesDataPoint[]): 'Kbps' | 'Mbps' | 'Gbps' {
  if (data.length === 0) return 'Kbps';

  const maxValue = Math.max(...data.map(d => d.value));
  const { unit } = convertNetworkSpeedAuto(maxValue);
  return unit;
}

/**
 * 시계열 데이터를 지정된 네트워크 단위로 변환
 * @param data - 시계열 데이터 배열 (bytes/sec 단위)
 * @param unit - 목표 단위
 * @returns 지정된 단위로 변환된 시계열 데이터
 */
export function convertNetworkDataToUnit(
  data: TimeSeriesDataPoint[],
  unit: 'Kbps' | 'Mbps' | 'Gbps'
): TimeSeriesDataPoint[] {
  const converters = {
    Kbps: convertNetworkDataToKbps,
    Mbps: convertNetworkDataToMbps,
    Gbps: convertNetworkDataToGbps,
  };

  const converter = converters[unit];
  return converter(data);
}

/**
 * Chart.js용 데이터 포인트로 변환
 * timestamp를 x좌표, value를 y좌표로 변환
 * @param data - 시계열 데이터 배열
 * @returns Chart.js {x, y} 형식 배열
 */
export function convertToChartData(data: TimeSeriesDataPoint[]): Array<{ x: string | number; y: number }> {
  return data.map(point => ({
    x: point.timestamp,
    y: point.value,
  }));
}

/**
 * 시계열 데이터 병합 (중복 제거 + 정렬)
 * @param existing - 기존 데이터
 * @param incoming - 새로 들어온 데이터
 * @param maxPoints - 최대 보관할 데이터 포인트 수 (기본: 100)
 * @returns 병합 및 정렬된 데이터
 */
export function mergeTimeSeries(
  existing: TimeSeriesDataPoint[],
  incoming: TimeSeriesDataPoint[],
  maxPoints = 100
): TimeSeriesDataPoint[] {
  // 기존 데이터와 새 데이터 결합
  const combined = [...existing, ...incoming];

  // timestamp 기준으로 중복 제거 (Map 사용)
  const uniqueMap = new Map<string, TimeSeriesDataPoint>();
  combined.forEach(point => {
    uniqueMap.set(point.timestamp, point);
  });

  // Map을 배열로 변환하고 timestamp 기준 정렬
  const sorted = Array.from(uniqueMap.values()).sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 최대 개수 제한 (최신 데이터만 유지)
  if (sorted.length > maxPoints) {
    return sorted.slice(sorted.length - maxPoints);
  }

  return sorted;
}
