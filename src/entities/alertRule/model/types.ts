export type MetricType = 'CPU' | 'Memory' | 'Storage' | 'Network';

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
  enabled: boolean;
}

export type SortField = keyof AlertRule;
export type SortDirection = 'asc' | 'desc';
