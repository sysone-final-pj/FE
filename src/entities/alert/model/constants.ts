import type { AlertLevel, MetricType } from './types';

export const ALERT_LEVELS: AlertLevel[] = ['Critical', 'Warning', 'Info'];
export const METRIC_TYPES: MetricType[] = ['CPU', 'Memory', 'Disk', 'Network'];

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  Critical: 'text-[#FF6C5E]',
  Warning: 'text-[#F0A100]',
  Info: 'text-[#0492F4]',
};
