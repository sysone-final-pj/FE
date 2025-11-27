/**
 작성자: 김슬기
 */
import { api } from './axiosInstance';
import type { MetricType } from '@/entities/alertRule/model/types';

/**
 * API 응답 타입
 */
export interface AlertRuleResponse {
  id: number;
  memberId: number;
  ruleName: string;
  metricType: MetricType;
  isEnabled: boolean;
  infoThreshold: number;
  warningThreshold: number;
  highThreshold: number;
  criticalThreshold: number;
  cooldownSeconds: number;
  createdAt: string;
  updatedAt: string;

  memberUsername: string;
}

export interface GetAlertRulesResponse {
  statusCode: number;
  message: string;
  data: AlertRuleResponse[];
}

export interface GetAlertRuleResponse {
  statusCode: number;
  message: string;
  data: AlertRuleResponse;
}

export interface DeleteAlertRuleResponse {
  statusCode: number;
  message: string;
  data: Record<string, never>;
}

export interface ToggleAlertRuleResponse {
  statusCode: number;
  message: string;
  data: AlertRuleResponse;
}

/**
 * API 요청 타입
 */
export interface CreateAlertRuleRequest {
  ruleName: string;
  metricType: MetricType;
  infoThreshold: number | null;
  warningThreshold: number | null;
  highThreshold: number | null;
  criticalThreshold: number | null;
  cooldownSeconds: number;
}

export interface UpdateAlertRuleRequest {
  ruleName: string;
  infoThreshold: number | null;
  warningThreshold: number | null;
  highThreshold: number | null;
  criticalThreshold: number | null;
  cooldownSeconds: number;
  enabled: boolean;
}

export const alertRuleApi = {
  /**
   * 모든 규칙 조회
   */
  async getAllRules(): Promise<GetAlertRulesResponse> {
    const response = await api.get<GetAlertRulesResponse>('/alert-rules');
    return response.data;
  },

  /**
   * 규칙 생성
   */
  async createRule(data: CreateAlertRuleRequest): Promise<GetAlertRuleResponse> {
    const response = await api.post<GetAlertRuleResponse>('/alert-rules', data);
    return response.data;
  },

  /**
   * 규칙 조회
   */
  async getRule(ruleId: number): Promise<GetAlertRuleResponse> {
    const response = await api.get<GetAlertRuleResponse>(`/alert-rules/${ruleId}`);
    return response.data;
  },

  /**
   * 규칙 삭제
   */
  async deleteRule(ruleId: number): Promise<DeleteAlertRuleResponse> {
    const response = await api.delete<DeleteAlertRuleResponse>(`/alert-rules/${ruleId}`);
    return response.data;
  },

  /**
   * 규칙 수정
   */
  async updateRule(
    ruleId: number,
    data: UpdateAlertRuleRequest
  ): Promise<GetAlertRuleResponse> {
    const response = await api.patch<GetAlertRuleResponse>(`/alert-rules/${ruleId}`, data);
    return response.data;
  },

  /**
   * 규칙 활성화/비활성화 토글
   */
  async toggleRule(ruleId: number, enabled: boolean): Promise<ToggleAlertRuleResponse> {
    const response = await api.patch<ToggleAlertRuleResponse>(
    `/alert-rules/${ruleId}/toggle`,
    null,                      
    { params: { enabled } }   
  );
    return response.data;
  },
}