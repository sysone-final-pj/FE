import { useState, useRef, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import type { HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Download } from 'lucide-react';
import { historyApi, type HistoryDataDTO, type ContainerListDTO } from '@/entities/history/api';

// Handsontable 모듈 등록
registerAllModules();

export const HistoryPage = () => {
  const hotTableRef = useRef<HotTableClass | null>(null); 
  const [containerType, setContainerType] = useState<'live' | 'deleted'>('live');
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [tableData, setTableData] = useState<HistoryDataDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containers, setContainers] = useState<ContainerListDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const pageSize = 100;

  // YYYY-MM-DDTHH:mm:ss
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // 컨테이너 종류 구분(live & deleted)
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
        size: pageSize,
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

  // 페이지 처리
  const handlePageChange = (newPage: number) => {
    handleSearch(newPage);
  };

  // 데이터 renderer 생성 함수(특정 글자수 이상넘어가면 ... 처리 + hover시 full String 출력)
  const createTruncateRenderer = (maxLength: number) => {
    return (_instance: unknown, td: HTMLTableCellElement, _row: number, _col: number, _prop: string | number, value: unknown) => {
      const stringValue = typeof value === 'string' ? value : '';
      if (stringValue && stringValue.length > maxLength) {
        td.textContent = stringValue.substring(0, maxLength) + '...';
        td.title = stringValue;
        td.style.cursor = 'help';
      } else {
        td.textContent = stringValue;
      }
      td.style.textAlign = 'center';
    };
  };

  // Handsontable columns 설정
  const columns = [
    { data: 'collectedAt', title: 'Collected At', readOnly: true, width: 130 },
    { data: 'containerName', title: 'Container Name', readOnly: true, width: 120, renderer: createTruncateRenderer(15) },
    { data: 'containerHash', title: 'Container Hash', readOnly: true, width: 120, renderer: createTruncateRenderer(12) },
    { data: 'agentName', title: 'Agent Name', readOnly: true, width: 120, renderer: createTruncateRenderer(15) },
    { data: 'state', title: 'State', readOnly: true, width: 100 },
    { data: 'health', title: 'Health', readOnly: true, width: 100 },
    { data: 'cpuPercent', title: 'CPU %', readOnly: true, width: 80 },
    { data: 'cpuCoreUsage', title: 'CPU Core Usage', readOnly: true, width: 100 },
    { data: 'memPercent', title: 'Memory %', readOnly: true, width: 80 },
    { data: 'memUsage', title: 'Memory Usage', readOnly: true, width: 100 },
    { data: 'blkRead', title: 'Block Read', readOnly: true, width: 90 },
    { data: 'blkWrite', title: 'Block Write', readOnly: true, width: 90 },
    { data: 'rxBytesPerSec', title: 'RX Bytes/s', readOnly: true, width: 80 },
    { data: 'txBytesPerSec', title: 'TX Bytes/s', readOnly: true, width: 80 },
    { data: 'networkTotalBytes', title: 'Network Total', readOnly: true, width: 100 },
  ];

  const handleDownload = async () => {
    if (!selectedContainer || !startDate || !endDate) {
      alert('컨테이너와 기간을 모두 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 모든 데이터 조회
      const response = await historyApi.getHistory({
        containerId: parseInt(selectedContainer),
        isDeleted: containerType === 'deleted' ? 1 : 0,
        startTime: formatDateTime(startDate),
        endTime: formatDateTime(endDate),
        page: 0,
        size: 999999, // Number.MAX_SAFE_INTEGER
        sortBy: 'collectedAt',
        sortDirection: 'DESC',
      });

      // CSV 변환
      const allData = response.content;
      if (allData.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }

      // 선택된 컨테이너 정보 찾기
      const selectedContainerInfo = containers.find(c => c.id === parseInt(selectedContainer));
      const selectedContainerName = selectedContainerInfo?.containerName || 'unknown';
      const selectedContainerHash = selectedContainerInfo?.containerHash.substring(0, 12) || 'unknown';

      // CSV 내용 생성
      const headers = columns.map(col => col.title).join(',');
      const rows = allData.map(row =>
        columns.map(col => {
          const value = row[col.data as keyof HistoryDataDTO];

          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      // 조회 기간 포맷팅 (YYYY-MM-DD)
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedContainerName}_${selectedContainerHash}_${startDateStr}_to_${endDateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download history:', err);
      alert('데이터 다운로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f8fa] px-[60px] pt-6 pb-10">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-6">Containers History</h1>

      {/* White container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* 필터 */}
        <div className="flex flex-col gap-4 mb-6">
          {/* 컨테이너 라디오 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Container :
            </label>

            {/* 라디오 옵션 - Live */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="containerType"
                value="live"
                checked={containerType === 'live'}
                onChange={() => {
                  setContainerType('live');
                  setSelectedContainer('');
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Live</span>
              <select
                value={selectedContainer}
                onChange={(e) => {
                  setContainerType('live');
                  setSelectedContainer(e.target.value);
                }}
                onClick={() => setContainerType('live')}
                className={
                  `px-3 py-2 border rounded-md min-w-[250px] text-sm 
                  ${containerType !== 'live' 
                      ? 'bg-gray-100 text-gray-400 cursor-pointer' 
                      : 'bg-white text-gray-700'}`
                }
              >
                <option value="">-- 컨테이너 이름 --</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.containerName} ({c.containerHash.slice(0, 12)})
                  </option>
                ))}
              </select>
            </label>

            {/* 라디오 옵션 - Deleted */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="containerType"
                value="deleted"
                checked={containerType === 'deleted'}
                onChange={() => {
                  setContainerType('deleted');
                  setSelectedContainer('');
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Deleted</span>
              <select
                value={selectedContainer}
                onChange={(e) => {
                  setContainerType('deleted');
                  setSelectedContainer(e.target.value);
                }}
                onClick={() => setContainerType('deleted')}
                className={
                  `px-3 py-2 border rounded-md min-w-[250px] text-sm 
                  ${containerType !== 'deleted' 
                      ? 'bg-gray-100 text-gray-400 cursor-pointer' 
                      : 'bg-white text-gray-700'}`
                }
              >
                <option value="">-- 컨테이너 이름 --</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.containerName} ({c.containerHash.slice(0, 12)})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* 조회 기간 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Period :
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Custom Range... [Start]"
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500 min-w-[180px]"
                popperClassName="z-[9999]"
              />
              <span className="text-gray-400">~</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                maxDate={new Date()}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Custom Range... [End]"
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500 min-w-[180px]"
                popperClassName="z-[9999]"
              />

              {/* 조회 */}
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '조회 중...' : '조회'}
              </button>
            </div>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md flex items-center gap-2 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        {/* 에러 메세지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* Handsontable */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-[650px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : tableData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {hasSearched ? '조회 결과가 없습니다.' : '조회 정보를 입력하세요'}
              </p>
            </div>
          ) : (
            <>
              <HotTable
                ref={hotTableRef}
                data={tableData}
                columns={columns}
                colHeaders={true}
                rowHeaders={true}
                width="100%"
                height={Math.min(600, Math.max(200, tableData.length * 23 + 50))}
                licenseKey="non-commercial-and-evaluation"
                stretchH="all"
                className="htCenter"
              />

              {/* 페이지네이션 */}
              {totalPages > 0 && (
                <div className="flex items-center justify-between mt-4 px-4">
                  <div className="text-sm text-gray-600">
                    Total: {totalElements} records (Page {currentPage + 1} of {totalPages})
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(0)}
                      disabled={currentPage === 0}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {/* Page */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (currentPage < 3) {
                          pageNum = i;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 border rounded-md text-sm ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages - 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
