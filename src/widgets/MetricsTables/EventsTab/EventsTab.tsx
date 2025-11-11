import React, { useMemo, useState, useEffect } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { LogData } from '@/shared/types/metrics';
import { LogRow } from '@/entities/events/ui/EventRow';
import { containerApi } from '@/shared/api/container';
import type { ContainerLogEntryDTO } from '@/shared/api/container';

const LogsTab: React.FC<{ selectedContainers: ContainerData[] }> = ({ selectedContainers }) => {
  const [selectedContainerForLogs, setSelectedContainerForLogs] = useState<string[]>([]);
  const [logs, setLogs] = useState<ContainerLogEntryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 선택된 컨테이너 ID 목록
  const selectedContainerIds = useMemo(() => {
    return selectedContainers.map((c) => Number(c.id));
  }, [selectedContainers]);

  // 로그 데이터 로드
  useEffect(() => {
    if (selectedContainerIds.length === 0) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await containerApi.getLogs({
          containerIds: selectedContainerIds,
          size: 100,
        });
        setLogs(response.logs);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError('로그를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [selectedContainerIds]);

  // ContainerLogEntryDTO를 LogData로 변환
  const formattedLogs = useMemo<LogData[]>(() => {
    return logs.map((log) => ({
      timestamp: log.loggedAt,
      level: 'INFO', // LogSource를 level로 매핑 (또는 파싱)
      containerName: log.containerName,
      message: log.logMessage,
      agentName: log.agentName,
      duration: '', // 계산 필요
    }));
  }, [logs]);

  // 선택된 컨테이너 필터링
  const filteredLogs = useMemo<LogData[]>(() => {
    if (selectedContainerForLogs.length === 0) return formattedLogs;
    return formattedLogs.filter((log) =>
      selectedContainerForLogs.some((name) => log.containerName.includes(name))
    );
  }, [formattedLogs, selectedContainerForLogs]);

  const toggleContainerSelection = (containerName: string) => {
    setSelectedContainerForLogs(prev =>
      prev.includes(containerName)
        ? prev.filter(name => name !== containerName)
        : [...prev, containerName]
    );
  };

  if (selectedContainers.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">컨테이너를 선택해주세요</h3>
        <p className="text-gray-500">상단 테이블에서 체크박스를 선택하면 로그가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="py-2.5">
      {/* Container Logs Overview */}
      <section className="bg-gray-100 rounded-xl border border-gray-300 p-5 mb-3">
        <h2 className="text-gray-700 font-pretendard text-base font-medium border-b-2 border-gray-300 pb-1.5 pl-2.5 pt-2.5 mb-3">
          Container Logs Overview
        </h2>

        {/* Container Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedContainers.map((container) => {
            const isSelected = selectedContainerForLogs.includes(container.containerName);
            return (
              <button
                key={container.id}
                onClick={() => toggleContainerSelection(container.containerName)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                  font-pretendard text-sm font-medium tracking-tight
                  ${isSelected
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
              >
                <span>{container.containerName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filters */}
      <div className="flex gap-3 mb-3 items-center flex-wrap">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-pretendard font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Log Level : ALL</option>
          <option>INFO</option>
          <option>ERROR</option>
          <option>WARN</option>
          <option>DEBUG</option>
          <option>SUCCESS</option>
        </select>

        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-pretendard font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Agent Name : ALL</option>
          <option>container-01</option>
          <option>container-02</option>
        </select>

        <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg bg-white">
          <span className="text-sm font-pretendard font-medium text-gray-700">Time Filter :</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <span className="text-sm font-pretendard text-gray-700">Quick Range</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
            <span className="text-sm font-pretendard text-gray-700">Custom Range (Start / End)</span>
          </label>
        </div>

        <input
          type="text"
          placeholder="🔍 Search Logs..."
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm font-pretendard placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Logs Table */}
      <section className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300">
              <tr>
                {['Timestamp', 'Level', 'Container Name', 'Message', 'Agent Name', 'Duration'].map((header) => (
                  <th key={header} className="px-2 py-3 text-left">
                    <div className="text-gray-600 font-pretendard text-xs font-semibold uppercase tracking-wider">
                      {header}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-pretendard">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>로그를 불러오는 중...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-red-500 font-pretendard">
                    {error}
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => <LogRow key={`log-${index}`} log={log} />)
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-pretendard">
                    선택된 컨테이너에 대한 로그가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LogsTab;
