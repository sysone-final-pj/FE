/**
 작성자: 김슬기
 */
/**
 * Type for a single row of history data
 * Includes timestamp and all metrics defined in HISTORY_FIELDS
 */
export interface HistoryRowData {
  시간: string; // Timestamp
  Agent_Name: string;
  CONTAINER_ID: string;
  CONTAINER_HASH: string;
  STATE: string;
  HEALTH: string;
  CPU_PERCENT: number;
  CPU_CORE_USAGE: number;
  HOST_CPU_USAGE_TOTAL: number;
  CPU_USAGE_TOTAL: number;
  CPU_USER: number;
  CPU_SYSTEM: number;
  CPU_QUOTA: number;
  CPU_PERIOD: number;
  ONLINE_CPUS: number;
  THROTTLING_PERIODS: number;
  THROTTLED_PERIODS: number;
  THROTTLED_TIME: number;
  MEM_PERCENT: number;
  MEM_USAGE: number;
  MEM_MAX_USAGE: number;
  BLK_READ: number;
  BLK_WRITE: number;
  BLK_READ_PER_SEC: number;
  BLK_WRITE_PER_SEC: number;
  RX_BYTES: number;
  TX_BYTES: number;
  RX_PACKETS: number;
  TX_PACKETS: number;
  NETWORK_TOTAL_BYTES: number;
  RX_BYTES_PER_SEC: number;
  TX_BYTES_PER_SEC: number;
  RX_PPS: number;
  TX_PPS: number;
  RX_FAILURE_RATE: number;
  TX_FAILURE_RATE: number;
  RX_ERRORS: number;
  TX_ERRORS: number;
  RX_DROPPED: number;
  TX_DROPPED: number;
  SIZE_RW: number;
  SIZE_ROOT_FS: number;
}

/**
 * Partial version of HistoryRowData for flexible data structures
 */
export type PartialHistoryRowData = Partial<HistoryRowData>;
