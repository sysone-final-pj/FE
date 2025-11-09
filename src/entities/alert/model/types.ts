// 백엔드 API와 일치하는 타입 (대문자)
export type AlertLevel = 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
export type MetricType = 'CPU' | 'MEMORY' | 'NETWORK';

export interface Alert {
  id: number;  // 백엔드는 Long
  alertLevel: AlertLevel;  // 백엔드 필드명: alertLevel
  metricType: MetricType;
  agentName: string;
  containerName: string;
  message: string;
  metricValue: number;  // 백엔드에서 제공
  collectedAt: string;  // 백엔드 필드명: collectedAt
  createdAt: string;  // 백엔드 필드명: createdAt
  read: boolean;  // 백엔드 필드명: isRead
  duration?: string;  // 프론트엔드에서 계산
  checked?: boolean;  // UI용
}

export type SortField = 'alertLevel' | 'metricType' | 'agentName' | 'containerName' |'message' | 'collectedAt' | 'createdAt' | 'read' | 'duration';
export type SortDirection = 'asc' | 'desc';
