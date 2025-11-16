import { api } from './axiosInstance';
import type { DashboardContainerListItemDTO, DashboardContainerListParams } from '@/shared/types/api/dashboard.types';

/**
 * Dashboard API
 * /api/dashboard/* 엔드포인트 관리
 */

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const dashboardApi = {
  /**
   * Dashboard Container List 조회
   * GET /api/dashboard/containers
   * @param params 필터링/정렬 파라미터 (optional)
   * @returns 컨테이너 목록
   */
  async getContainers(params?: DashboardContainerListParams): Promise<DashboardContainerListItemDTO[]> {
    const response = await api.get<ApiResponse<DashboardContainerListItemDTO[]>>('/dashboard/containers', {
      params: {
        sortBy: params?.sortBy,
        favoriteOnly: params?.favoriteOnly,
        states: params?.states,
        healths: params?.healths,
        agentIds: params?.agentIds,
      },
    });
    return response.data.data;
  },
};
