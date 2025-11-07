import { api } from './axiosInstance';
import type { ContainerState, ContainerHealth } from '@/shared/types/websocket';

/**
 * Container Sort Fields
 */
export type ContainerSortField =
  | 'AGENT_NAME'
  | 'CONTAINER_NAME'
  | 'CPU_PERCENT'
  | 'MEM_USAGE'
  | 'RX_BYTES_PER_SEC'
  | 'TX_BYTES_PER_SEC';

/**
 * Log Sort Fields
 */
export type LogSortField =
  | 'LOGGED_AT'
  | 'CONTAINER_NAME'
  | 'AGENT_NAME'
  | 'LOG_MESSAGE';

/**
 * Log Source Types
 */
export type LogSource = 'STDOUT' | 'STDERR' | 'RAW';

/**
 * Quick Range Types (백엔드와 동일)
 */
export type QuickRangeType =
  | 'LAST_5_MINUTES'
  | 'LAST_10_MINUTES'
  | 'LAST_30_MINUTES'
  | 'LAST_1_HOUR'
  | 'LAST_3_HOURS'
  | 'LAST_6_HOURS'
  | 'LAST_12_HOURS'
  | 'LAST_24_HOURS';

/**
 * Time Bucket for OOM TimeSeries
 */
export type TimeBucket = 'MINUTES' | 'HOURS' | 'DAYS';

/**
 * Container Summary DTO (GET /api/containers 응답)
 */
export interface ContainerSummaryDTO {
  agentName: string;
  containerHash: string;
  containerName: string;
  cpuPercent: number;
  memUsage: number;
  memLimit: number;
  rxBytesPerSec: number;
  txBytesPerSec: number;
  state: ContainerState;
  health: ContainerHealth;
  imageSize: number;
  sizeRootFs: number;
  storageLimit: number;
}

/**
 * Container Log Entry DTO
 */
export interface ContainerLogEntryDTO {
  id: number;
  containerId: number;
  containerName: string;
  agentName: string;
  logMessage: string;
  loggedAt: string; // ISO 8601
  logSource: LogSource;
}

/**
 * Container Logs Response DTO
 */
export interface ContainerLogsResponseDTO {
  logs: ContainerLogEntryDTO[];
  lastLogId: number | null;
  lastLoggedAt: string | null;
  hasMore: boolean;
  returnedCount: number;
  requestedSize: number;
}

/**
 * OOM TimeSeries Response DTO
 */
export interface OomTimeSeriesResponseDTO {
  containerId: number;
  containerName: string;
  startTime: string;
  endTime: string;
  bucketSize: string;
  timeSeries: Record<string, number>; // timestamp -> count
  totalCount: number;
  totalOomKills: number;
  lastOomKilledAt: string | null;
}

/**
 * API Response Wrapper
 */
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Container List Request Parameters
 */
export interface ContainerListParams {
  keyword?: string;
  states?: ContainerState[];
  healths?: ContainerHealth[];
  sortBy?: ContainerSortField;
  direction?: 'ASC' | 'DESC';
}

/**
 * Container Logs Request Parameters
 */
export interface ContainerLogsParams {
  containerIds?: number[];
  lastLogId?: number;
  lastLoggedAt?: string; // ISO 8601
  size?: number;
  quickRange?: QuickRangeType;
  startTime?: string; // ISO 8601
  endTime?: string; // ISO 8601
  logSource?: LogSource;
  agentName?: string;
  sortBy?: LogSortField;
  direction?: 'ASC' | 'DESC';
}

/**
 * Container Metrics Request Parameters
 */
export interface ContainerMetricsParams {
  quickRange?: QuickRangeType;
  startTime?: string; // ISO 8601
  endTime?: string; // ISO 8601
}

/**
 * OOM TimeSeries Request Parameters
 */
export interface OomTimeSeriesParams {
  startTime?: string; // ISO 8601
  endTime?: string; // ISO 8601
  timeBucket?: TimeBucket;
}

/**
 * Container API Client
 */
export const containerApi = {
  /**
   * 컨테이너 목록 조회 (검색/필터/정렬)
   * GET /api/containers
   */
  async getContainers(params?: ContainerListParams): Promise<ContainerSummaryDTO[]> {
    const response = await api.get<ApiResponse<ContainerSummaryDTO[]>>('/containers', {
      params: {
        keyword: params?.keyword,
        states: params?.states,
        healths: params?.healths,
        sortBy: params?.sortBy,
        direction: params?.direction || 'DESC',
      },
    });
    return response.data.data;
  },

  /**
   * 컨테이너 로그 조회 (커서 기반 무한 스크롤)
   * GET /api/logs
   */
  async getLogs(params?: ContainerLogsParams): Promise<ContainerLogsResponseDTO> {
    const response = await api.get<ApiResponse<ContainerLogsResponseDTO>>('/logs', {
      params: {
        containerIds: params?.containerIds,
        lastLogId: params?.lastLogId,
        lastLoggedAt: params?.lastLoggedAt,
        size: params?.size || 50,
        quickRange: params?.quickRange,
        startTime: params?.startTime,
        endTime: params?.endTime,
        logSource: params?.logSource,
        agentName: params?.agentName,
        sortBy: params?.sortBy,
        direction: params?.direction || 'DESC',
      },
    });
    return response.data.data;
  },

  /**
   * OOM 시계열 데이터 조회 (선택사항)
   * GET /api/containers/{id}/oom-timeseries
   */
  async getOomTimeSeries(
    containerId: number,
    params?: OomTimeSeriesParams
  ): Promise<OomTimeSeriesResponseDTO> {
    const response = await api.get<ApiResponse<OomTimeSeriesResponseDTO>>(
      `/containers/${containerId}/oom-timeseries`,
      {
        params: {
          startTime: params?.startTime,
          endTime: params?.endTime,
          timeBucket: params?.timeBucket || 'HOURS',
        },
      }
    );
    return response.data.data;
  },
};
