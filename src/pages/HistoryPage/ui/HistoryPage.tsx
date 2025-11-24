import { useState } from 'react';
import { useHistoryData } from '../hooks/useHistoryData';
import { ContainerTypeFilter } from './ContainerTypeFilter';
import { PeriodFilter } from './PeriodFilter';
import { HistoryTable } from './HistoryTable';
import { Pagination } from './Pagination';
import { getColumnTitles, getColumnData, PAGE_SIZE } from '../lib/constants';
import { generateCSVFilename, downloadCSV } from '../lib/utils';

export const HistoryPage = () => {
  const [containerType, setContainerType] = useState<'live' | 'deleted'>('live');

  const {
    selectedContainer,
    startDate,
    endDate,
    tableData,
    loading,
    error,
    containers,
    currentPage,
    totalPages,
    totalElements,
    hasSearched,
    setSelectedContainer,
    setStartDate,
    setEndDate,
    handleSearch,
    fetchAllData,
    handlePageChange,
  } = useHistoryData(containerType);

  // CSV 다운로드 처리
  const handleDownload = async () => {
    if (!selectedContainer || !startDate || !endDate) {
      alert('컨테이너와 기간을 모두 선택해주세요.');
      return;
    }

    const originalLoading = loading;
    if (!originalLoading) {
      // 로딩 상태는 hook 내부에서 관리하므로 별도 처리 불필요
    }

    try {
      const allData = await fetchAllData();

      if (!allData || allData.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }

      // 선택된 컨테이너 정보 찾기
      const selectedContainerInfo = containers.find(c => c.id === parseInt(selectedContainer));
      const selectedContainerName = selectedContainerInfo?.containerName || 'unknown';
      const selectedContainerHash = selectedContainerInfo?.containerHash.substring(0, 12) || 'unknown';

      // CSV 내용 생성
      const headers = getColumnTitles().join(',');
      const rows = allData.map(row => getColumnData(row).join(','));
      const csvContent = [headers, ...rows].join('\n');

      // 파일명 생성 및 다운로드
      const filename = generateCSVFilename(
        selectedContainerName,
        selectedContainerHash,
        startDate,
        endDate
      );
      downloadCSV(csvContent, filename);
    } catch (err) {
      console.error('Failed to download history:', err);
      alert('데이터 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="w-full min-h-screen px-[60px] pt-6 pb-10">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-6">Containers History</h1>

      {/* White container */}
      <div className="bg-white rounded-lg border border-border-light p-6">
        {/* 필터 */}
        <div className="flex flex-col gap-4 mb-6">
          {/* 컨테이너 타입 선택 */}
          <ContainerTypeFilter
            containerType={containerType}
            selectedContainer={selectedContainer}
            containers={containers}
            onContainerTypeChange={setContainerType}
            onSelectedContainerChange={setSelectedContainer}
          />

          {/* 조회 기간 */}
          <PeriodFilter
            startDate={startDate}
            endDate={endDate}
            loading={loading}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSearch={() => handleSearch()}
            onDownload={handleDownload}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* Handsontable */}
        <div className="w-full overflow-x-auto">
          <HistoryTable
            data={tableData}
            loading={loading}
            hasSearched={hasSearched}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
          />

          {/* 페이지네이션 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
