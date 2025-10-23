export type AlertLevel = 'Critical' | 'Warning' | 'Info';
export type MetricType = 'CPU' | 'Memory' | 'Disk' | 'Network';

export interface Alert {
  id: string;
  level: AlertLevel;
  metricType: MetricType;
  agentName: string;
  containerName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  duration: string;
  checked?: boolean;
}

export type SortField = 'level' | 'agentName' | 'containerName' | 'timestamp' | 'isRead' | 'duration';
export type SortDirection = 'asc' | 'desc';
