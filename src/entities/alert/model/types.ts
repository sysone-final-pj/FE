export type AlertLevel = 'Critical' | 'Warning' | 'High' | 'Info';
export type MetricType = 'CPU' | 'Memory' | 'Storage' | 'Network';

export interface Alert {
  id: string;
  level: AlertLevel;
  metricType: MetricType;
  agentName: string;
  containerName: string;
  message: string;
  collectionTime: string;
  sentAt: string;
  read: boolean;
  duration: string;
  checked?: boolean;
}

export type SortField = 'level' | 'metricType' | 'agentName' | 'containerName' |'message' | 'collectionTime' | 'sentAt' | 'read' | 'duration';
export type SortDirection = 'asc' | 'desc';
