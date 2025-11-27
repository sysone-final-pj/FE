/**
 작성자: 김슬기
 */
import { useRef } from 'react';
import { HotTable } from '@handsontable/react';
import type { HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import type { HistoryDataDTO } from '@/entities/history/api';
import { HISTORY_TABLE_COLUMNS } from '../lib/constants';
import { createTruncateRenderer } from '../lib/utils';

// Handsontable 모듈 등록
registerAllModules();

interface HistoryTableProps {
  data: HistoryDataDTO[];
  loading: boolean;
  hasSearched: boolean;
  currentPage: number;
  pageSize: number;
}

export const HistoryTable = ({
  data,
  loading,
  hasSearched,
  currentPage,
  pageSize,
}: HistoryTableProps) => {
  const hotTableRef = useRef<HotTableClass | null>(null);

  // 컬럼 설정에 renderer 추가
  const columns = HISTORY_TABLE_COLUMNS.map(col => ({
    ...col,
    renderer: 'maxLength' in col ? createTruncateRenderer(col.maxLength) : undefined,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[650px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-state-running border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-gray-50 rounded-lg">
        <p className="text-text-secondary">
          {hasSearched ? '조회 결과가 없습니다.' : '조회 정보를 입력하세요'}
        </p>
      </div>
    );
  }

  return (
    <HotTable
      ref={hotTableRef}
      data={data}
      columns={columns}
      colHeaders={true}
      rowHeaders={(row) => `${currentPage * pageSize + row + 1}`}
      width="100%"
      height={Math.min(600, Math.max(200, data.length * 23 + 50))}
      licenseKey="non-commercial-and-evaluation"
      stretchH="all"
      className="htCenter"
    />
  );
};
