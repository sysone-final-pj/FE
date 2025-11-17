import { api } from './axiosInstance';
import type {
  DashboardContainerListItemDTO,
  DashboardContainerListParams,
  DashboardContainerMetricsDTO,
  NetworkStatsDTO,
  BlockIOStatsDTO,
} from '@/shared/types/api/dashboard.types';

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

  /**
   * Container Detail Metrics 조회
   * GET /api/dashboard/containers/{containerId}/metrics
   * @param containerId 컨테이너 ID
   * @returns 컨테이너 상세 메트릭
   */
  async getContainerMetrics(containerId: number): Promise<DashboardContainerMetricsDTO> {
    const response = await api.get<ApiResponse<DashboardContainerMetricsDTO>>(
      `/dashboard/containers/${containerId}/metrics`
    );
    return response.data.data;
  },

  /**
   * Network Time-Series 조회
   * GET /api/dashboard/containers/{containerId}/network-stats
   * @param containerId 컨테이너 ID
   * @param timeRange 시간 범위 (ONE_MINUTE, FIVE_MINUTES, THIRTY_MINUTES 등)
   * @returns 네트워크 시계열 데이터
   */
  async getNetworkStats(containerId: number, timeRange?: string): Promise<NetworkStatsDTO> {
    const response = await api.get<ApiResponse<NetworkStatsDTO>>(
      `/dashboard/containers/${containerId}/network-stats`,
      {
        params: timeRange ? { timeRange } : 'THREE_MINUTES',
      }
    );
    return response.data.data;
  },

  /**
   * Block I/O Time-Series 조회
   * GET /api/dashboard/containers/{containerId}/blockio-stats
   * @param containerId 컨테이너 ID
   * @param timeRange 시간 범위 (ONE_MINUTE, FIVE_MINUTES, THIRTY_MINUTES 등)
   * @returns Block I/O 시계열 데이터
   */
  async getBlockIOStats(containerId: number, timeRange?: string): Promise<BlockIOStatsDTO> {
    const response = await api.get<ApiResponse<BlockIOStatsDTO>>(
      `/dashboard/containers/${containerId}/blockio-stats`,
      {
        params: timeRange ? { timeRange } : undefined,
      }
    );
    return response.data.data;
  },
};
