import type { AlertLevel, MetricType } from './types';

export const ALERT_LEVELS: AlertLevel[] = ['Critical', 'High', 'Warning', 'Info'];
export const METRIC_TYPES: MetricType[] = ['CPU', 'Memory', 'Storage', 'Network'];

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  Critical: 'text-state-error',
  High: 'text-state-high',
  Warning: 'text-state-warning',
  Info: 'text-state-running',
};
