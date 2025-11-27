/**
 작성자: 김슬기
 */
import type { HistoryDataDTO } from '@/entities/history/api';

export const PAGE_SIZE = 100;

// Handsontable columns 설정
export const HISTORY_TABLE_COLUMNS = [
  { data: 'collectedAt', title: 'Collected At', readOnly: true, width: 130 },
  { data: 'containerName', title: 'Container Name', readOnly: true, width: 120, maxLength: 15 },
  { data: 'containerHash', title: 'Container Hash', readOnly: true, width: 120, maxLength: 12 },
  { data: 'agentName', title: 'Agent Name', readOnly: true, width: 120, maxLength: 15 },
  { data: 'state', title: 'State', readOnly: true, width: 100 },
  { data: 'health', title: 'Health', readOnly: true, width: 100 },
  { data: 'cpuPercent', title: 'CPU %', readOnly: true, width: 80 },
  { data: 'cpuCoreUsage', title: 'CPU Core Usage', readOnly: true, width: 100 },
  { data: 'memPercent', title: 'Memory %', readOnly: true, width: 80 },
  { data: 'memUsage', title: 'Memory Usage', readOnly: true, width: 100 },
  { data: 'blkReadPerSec', title: 'IO Read/s', readOnly: true, width: 90 },
  { data: 'blkWritePerSec', title: 'IO Write/s', readOnly: true, width: 90 },
  { data: 'rxBytesPerSec', title: 'RX Bytes/s', readOnly: true, width: 80 },
  { data: 'txBytesPerSec', title: 'TX Bytes/s', readOnly: true, width: 80 },
  { data: 'networkTotalBytes', title: 'Network Total', readOnly: true, width: 100 },
] as const;

export type HistoryTableColumn = typeof HISTORY_TABLE_COLUMNS[number];

// CSV 생성을 위한 컬럼 정보 추출
export const getColumnTitles = () => HISTORY_TABLE_COLUMNS.map(col => col.title);

export const getColumnData = (row: HistoryDataDTO) =>
  HISTORY_TABLE_COLUMNS.map(col => {
    const value = row[col.data as keyof HistoryDataDTO];

    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value ?? '';
  });
