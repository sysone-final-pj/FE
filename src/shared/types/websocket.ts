import type { IMessage } from '@stomp/stompjs';

/**
 * 웹소켓 연결 상태
 */
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * 웹소켓 구독 정보
 */
export interface WebSocketSubscription {
  id: string;
  destination: string;
  callback: (message: IMessage) => void;
}

/**
 * 웹소켓 구독 경로 설정
 * TODO: 백엔드에서 실제 경로 확인 후 수정 필요
 */
export const WS_DESTINATIONS = {
  // Dashboard 관련
  DASHBOARD: '/topic/dashboard',
  DASHBOARD_METRICS: '/topic/dashboard/metrics',

  // Alert 관련
  ALERTS: '/topic/alerts',
  USER_ALERTS: '/user/queue/alerts',

  // Container 관련
  CONTAINERS: '/topic/containers',
  CONTAINER_STATUS: '/topic/containers/status',
} as const;

/**
 * 웹소켓 발행 경로 설정
 * TODO: 백엔드에서 실제 경로 확인 후 수정 필요
 */
export const WS_SEND_DESTINATIONS = {
  SUBSCRIBE_DASHBOARD: '/app/dashboard/subscribe',
  SUBSCRIBE_ALERTS: '/app/alerts/subscribe',
  SUBSCRIBE_CONTAINERS: '/app/containers/subscribe',
} as const;

/**
 * 웹소켓 에러 타입
 */
export interface WebSocketError {
  type: 'connection' | 'subscription' | 'message' | 'auth';
  message: string;
  timestamp: number;
}

/**
 * 웹소켓 메시지 기본 구조
 * TODO: 백엔드에서 실제 메시지 포맷 확인 후 수정 필요
 */
export interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}
