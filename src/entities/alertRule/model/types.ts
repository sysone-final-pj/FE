export type MetricType = 'CPU' | 'MEMORY' | 'NETWORK';

export interface AlertRule {
  id: string;
  ruleName: string;
  metricType: MetricType;
  infoThreshold: number | undefined;
  warningThreshold: number | undefined;
  highThreshold: number | undefined;
  criticalThreshold: number | undefined;
  cooldownSeconds: number;
  enabled: boolean;
}

export type SortField = keyof AlertRule;
export type SortDirection = 'asc' | 'desc';
