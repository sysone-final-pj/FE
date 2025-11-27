/**
 작성자: 이지민
 */
import { useState } from 'react';
import { useHistoryData } from '../hooks/useHistoryData';
import { ContainerTypeFilter } from './ContainerTypeFilter';
import { PeriodFilter } from './PeriodFilter';
import { HistoryTable } from './HistoryTable';
import { Pagination } from './Pagination';
import { getColumnTitles, getColumnData, PAGE_SIZE } from '../lib/constants';
import { generateCSVFilename, downloadCSV } from '../lib/utils';
import { CPUHistoryChartForHistory } from '@/widgets/HistoryCharts/ui/CPUHistoryChartForHistory';
import { MemoryHistoryChartForHistory } from '@/widgets/HistoryCharts/ui/MemoryHistoryChartForHistory';
import { NetworkHistoryChartForHistory } from '@/widgets/HistoryCharts/ui/NetworkHistoryChartForHistory';
// import { BlockIOHistoryChartForHistory } from '@/widgets/HistoryCharts/ui/BlockIOHistoryChartForHistory';

export const HistoryPage = () => {
  const [containerType, setContainerType] = useState<'live' | 'deleted'>('live');
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');

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

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6 border-b border-border-light">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'table'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'charts'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Charts
          </button>
        </div>

        {/* 테이블 뷰 */}
        {activeTab === 'table' && (
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
        )}

        {/* 차트 뷰 */}
        {activeTab === 'charts' && (
          <div className="w-full space-y-6">
            {!selectedContainer ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-base">
                  Select a container to view historical charts
                </p>
              </div>
            ) : (
              <>
                <CPUHistoryChartForHistory
                  containerId={selectedContainer ? parseInt(selectedContainer) : null}
                  containerName={
                    containers.find((c) => c.id === parseInt(selectedContainer))?.containerName
                  }
                />
                <MemoryHistoryChartForHistory
                  containerId={selectedContainer ? parseInt(selectedContainer) : null}
                  containerName={
                    containers.find((c) => c.id === parseInt(selectedContainer))?.containerName
                  }
                />
                <NetworkHistoryChartForHistory
                  containerId={selectedContainer ? parseInt(selectedContainer) : null}
                  containerName={
                    containers.find((c) => c.id === parseInt(selectedContainer))?.containerName
                  }
                />
                {/* <BlockIOHistoryChartForHistory
                  containerId={selectedContainer ? parseInt(selectedContainer) : null}
                  containerName={
                    containers.find((c) => c.id === parseInt(selectedContainer))?.containerName
                  }
                /> */}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
