/**
 작성자: 김슬기
 */
import { api } from './axiosInstance';
import type { AlertListItemDTO, AlertLevel, MetricType } from '@/shared/types/websocket';

/**
 * Alert API 응답 타입
 */
export interface GetAlertsResponse {
  statusCode: number;
  message: string;
  data: AlertListItemDTO[];
}

export interface GetUnreadCountResponse {
  statusCode: number;
  message: string;
  data: number;
}

export interface AlertDetailResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    ruleId: number;
    ruleName: string;
    containerId: number;
    containerName: string;
    message: string;
    createdAt: string;
    metricType: MetricType;
    metricValue: number;
    isRead: boolean;
    alertLevel: AlertLevel;
  };
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: object;
}

/**
 * Alert 필터 파라미터
 */
export interface AlertFilterParams {
  alertLevel?: AlertLevel;
  metricType?: MetricType;
  agentName?: string;
  containerName?: string;
  quickRangeType?: 'LAST_5_MINUTES' | 'LAST_10_MINUTES' | 'LAST_30_MINUTES' | 'LAST_1_HOUR' | 'LAST_3_HOURS' | 'LAST_6_HOURS' | 'LAST_12_HOURS' | 'LAST_24_HOURS';
  collectedAtFrom?: string; // ISO 8601
  collectedAtTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  isRead?: boolean;
  sortBy?: 'ALERT_LEVEL' | 'METRIC_TYPE' | 'CONTAINER_NAME' | 'METRIC_VALUE' | 'COLLECTED_AT';
}

/**
 * Alert API 클라이언트
 */
export const alertApi = {
  /**
   * 모든 알림 조회
   */
  async getAllAlerts(): Promise<GetAlertsResponse> {
    const response = await api.get<GetAlertsResponse>('/alerts');
    return response.data;
  },

  /**
   * 읽지 않은 알림 조회
   */
  async getUnreadAlerts(): Promise<GetAlertsResponse> {
    const response = await api.get<GetAlertsResponse>('/alerts/unread');
    return response.data;
  },

  /**
   * 읽지 않은 알림 개수 조회 (배지용)
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<GetUnreadCountResponse>('/alerts/unread/count');
    return response.data.data;
  },

  /**
   * 필터링된 알림 조회
   */
  async getAlertsWithFilter(params: AlertFilterParams): Promise<GetAlertsResponse> {
    const response = await api.get<GetAlertsResponse>('/alerts/filter', { params });
    return response.data;
  },

  /**
   * 특정 알림 상세 조회
   */
  async getAlertDetail(alertId: number): Promise<AlertDetailResponse> {
    const response = await api.get<AlertDetailResponse>(`/alerts/${alertId}`);
    return response.data;
  },

  /**
   * 특정 알림 읽음 처리
   */
  async markAsRead(alertId: number): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>(`/alerts/${alertId}/read`);
    return response.data;
  },

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>('/alerts/read-all');
    return response.data;
  },

  /**
   * 특정 알림 삭제
   */
  async deleteAlert(alertId: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/alerts/${alertId}`);
    return response.data;
  },

  /**
   * 모든 알림 삭제
   */
  async deleteAllAlerts(): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>('/alerts/all');
    return response.data;
  },

  /**
   * 읽은 알림만 삭제
   */
  async deleteReadAlerts(): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>('/alerts/read');
    return response.data;
  },
};
