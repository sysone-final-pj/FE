/**
 * 공통 API 타입 정의
 * 모든 API Response에서 공유하는 타입들
 */

// 컨테이너 상태 enum
export type ContainerState =
  | 'RUNNING'
  | 'RESTARTING'
  | 'DEAD'
  | 'CREATED'
  | 'EXITED'
  | 'PAUSED'
  | 'DELETED'
  | 'UNKNOWN';

// 컨테이너 헬스 상태 enum
export type ContainerHealth =
  | 'HEALTHY'
  | 'UNHEALTHY'
  | 'STARTING'
  | 'NONE'
  | 'UNKNOWN';

// 공통 API Response 래퍼
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// 시계열 데이터 포인트
export interface TimeSeriesDataPoint {
  timestamp: string;  // ISO 8601 format
  value: number;
}

// 컨테이너 기본 정보
export interface ContainerBaseInfo {
  containerId: number;
  containerHash: string;
  containerName: string;
  agentName: string;
  state: ContainerState;
  health: ContainerHealth;
}
