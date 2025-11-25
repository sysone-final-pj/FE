import { api } from '@/shared/api/axiosInstance';

/**
 * History Data Entry DTO (백엔드 응답과 일치시키기)
 */
export interface HistoryDataDTO {
  collectedAt: string; // ISO 8601
  containerName: string;
  containerHash: string;
  agentName: string;
  imgNameTag: string;
  state: string;
  health: string;
  containerCreatedAt: string;
  isDeleted: number;
  cpuPercent: number;
  cpuCoreUsage: number;
  hostCpuUsageTotal: number;
  cpuUsageTotal: number;
  cpuUser: number;
  cpuSystem: number;
  cpuQuota: number;
  cpuPeriod: number;
  onlineCpus: number;
  throttlingPeriods: number;
  throttledPeriods: number;
  throttledTime: number;
  cpuLimitCores: number;
  isCpuUnlimited: boolean;
  memPercent: number;
  memUsage: number;
  memMaxUsage: number;
  memLimit: number;
  isMemoryUnlimited: boolean;
  lastOomKilledAt: string | null;
  blkRead: number;
  blkWrite: number;
  blkReadPerSec: number;
  blkWritePerSec: number;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  networkTotalBytes: number;
  rxBytesPerSec: number;
  txBytesPerSec: number;
  rxPps: number;
  txPps: number;
  rxFailureRate: number;
  txFailureRate: number;
  rxErrors: number;
  txErrors: number;
  rxDropped: number;
  txDropped: number;
  sizeRw: number;
  sizeRootFs: number;
  storageLimit: number;
  isStorageUnlimited: boolean;
}

/**
 * 페이지네이션
 */
export interface HistoryResponseDTO {
  content: HistoryDataDTO[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

/**
 * History 요청 파라미터
 */
export interface HistoryParams {
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  containerId?: number;
  isDeleted?: number; // 0 = live, 1 = deleted
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * Container List DTO
 */
export interface ContainerListDTO {
  id: number;
  containerName: string;
  containerHash: string;
  isDeleted: number;
}

/**
 * API 응답 래퍼
 */
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * History API Client
 */
export const historyApi = {
  /**
   * 컨테이너 히스토리 데이터 조회
   * GET /api/history/containers
   */
  async getHistory(params: HistoryParams): Promise<HistoryResponseDTO> {
    const queryParams = {
      startTime: params.startTime,
      endTime: params.endTime,
      containerId: params.containerId,
      isDeleted: params.isDeleted,
      page: params.page ?? 0,
      size: params.size ?? 100,
      sortBy: params.sortBy ?? 'collectedAt',
      sortDirection: params.sortDirection ?? 'DESC',
    };

    // console.log('History API Request Params:', queryParams);

    const response = await api.get<ApiResponse<HistoryResponseDTO>>('/history/containers', {
      params: queryParams,
    });
    return response.data.data;
  },

  /**
   * 컨테이너 목록 조회(live, deleted)
   * GET /api/history/containers/list
   */
  async getContainerList(isDeleted: number): Promise<ContainerListDTO[]> {
    const response = await api.get<ApiResponse<ContainerListDTO[]>>('/history/containers/list', {
      params: {
        isDeleted,
      },
    });
    return response.data.data;
  },
};
