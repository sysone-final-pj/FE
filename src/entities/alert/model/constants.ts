/**
 작성자: 김슬기
 */
import type { AlertLevel, MetricType } from './types';

// 백엔드 API와 일치 (대문자)
export const ALERT_LEVELS: AlertLevel[] = ['CRITICAL', 'HIGH', 'WARNING', 'INFO'];
export const METRIC_TYPES: MetricType[] = ['CPU', 'MEMORY', 'NETWORK'];

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  CRITICAL: 'text-state-error',
  HIGH: 'text-state-high',
  WARNING: 'text-state-warning',
  INFO: 'text-state-running',
};
