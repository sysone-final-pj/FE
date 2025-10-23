export type MetricType = 'CPU' | 'Memory' | 'Disk' | 'Network';

export interface AlertRule {
  id: string;
  ruleName: string;
  metricType: MetricType;
  infoThreshold: number;
  warningThreshold: number;
  highThreshold: number;
  criticalThreshold: number;
  cooldownSeconds: number;
  checkInterval: number;
  isEnabled: boolean;
}

export type SortField = keyof AlertRule;
export type SortDirection = 'asc' | 'desc';
