/**
 작성자: 이지민
 */
import { useState, useEffect } from 'react';
import { historyApi, type HistoryDataDTO, type ContainerListDTO } from '@/entities/history/api';
import { formatDateTime } from '../lib/utils';
import { PAGE_SIZE } from '../lib/constants';

export const useHistoryData = (containerType: 'live' | 'deleted') => {
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [tableData, setTableData] = useState<HistoryDataDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containers, setContainers] = useState<ContainerListDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // 컨테이너 목록 조회
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const data = await historyApi.getContainerList(containerType === 'deleted' ? 1 : 0);
        setContainers(data);
      } catch (err) {
        console.error('Failed to fetch containers:', err);
      }
    };

    fetchContainers();
  }, [containerType]);

  // 히스토리 조회
  const handleSearch = async (page: number = 0) => {
    if (!selectedContainer || !startDate || !endDate) {
      alert('컨테이너와 기간을 모두 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await historyApi.getHistory({
        containerId: parseInt(selectedContainer),
        isDeleted: containerType === 'deleted' ? 1 : 0,
        startTime: formatDateTime(startDate),
        endTime: formatDateTime(endDate),
        page,
        size: PAGE_SIZE,
        sortBy: 'collectedAt',
        sortDirection: 'DESC',
      });

      setTableData(response.content);
      setCurrentPage(page);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setHasSearched(true);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as { message?: string })?.message
        || '알 수 없는 오류';
      setError(`데이터를 불러오는데 실패했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 전체 데이터 조회 (다운로드용)
  const fetchAllData = async () => {
    if (!selectedContainer || !startDate || !endDate) {
      return null;
    }

    try {
      const response = await historyApi.getHistory({
        containerId: parseInt(selectedContainer),
        isDeleted: containerType === 'deleted' ? 1 : 0,
        startTime: formatDateTime(startDate),
        endTime: formatDateTime(endDate),
        page: 0,
        size: 999999,
        sortBy: 'collectedAt',
        sortDirection: 'DESC',
      });

      return response.content;
    } catch (err) {
      console.error('Failed to fetch all data:', err);
      throw err;
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    handleSearch(newPage);
  };

  return {
    // State
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

    // Setters
    setSelectedContainer,
    setStartDate,
    setEndDate,

    // Actions
    handleSearch,
    fetchAllData,
    handlePageChange,
  };
};
