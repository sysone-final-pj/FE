import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { LogData } from '@/shared/types/metrics';
import { LogRow } from '@/entities/events/ui/EventRow';
import { containerApi, type LogSource } from '@/shared/api/container';
import type { ContainerLogEntryDTO } from '@/shared/api/container';
import { useLogWebSocket } from '@/features/event/hooks/useEventWebSocket';
import { TimeFilter, type TimeFilterValue } from '@/shared/ui/TimeFilter/TimeFilter';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';

interface LogsTabProps {
  selectedContainers: ContainerData[];
}

const LogsTab: React.FC<LogsTabProps> = ({ selectedContainers }) => {
  // 현재 조회 중인 단일 컨테이너 ID
  const [activeContainerId, setActiveContainerId] = useState<number | null>(null);
  const [restLogs, setRestLogs] = useState<ContainerLogEntryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 실시간 모드 (기본값 false)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  // 무한 스크롤 관련 상태
  const [hasMore, setHasMore] = useState(false);
  const [lastLogId, setLastLogId] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 필터 상태
  const [logSourceFilter, setLogSourceFilter] = useState<LogSource | 'ALL'>('ALL');
  const [agentNameFilter, setAgentNameFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue | null>(null);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingFilterAction, setPendingFilterAction] = useState<(() => void) | null>(null);

  // 완료 모달 상태 (무한 스크롤 완료 시)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // 스크롤 영역 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 첫 진입 시 첫 번째 컨테이너 자동 선택
  useEffect(() => {
    if (selectedContainers.length > 0 && activeContainerId === null) {
      const firstContainerId = Number(selectedContainers[0].id);
      console.log('[LogsTab] 첫 번째 컨테이너 자동 선택:', firstContainerId);
      setActiveContainerId(firstContainerId);
    }
    // 선택된 컨테이너가 없으면 초기화
    if (selectedContainers.length === 0) {
      setActiveContainerId(null);
      setRestLogs([]);
      setLastLogId(null);
      setHasMore(false);
    }
  }, [selectedContainers, activeContainerId]);

  // activeContainerId가 selectedContainers에 없으면 첫 번째로 리셋
  useEffect(() => {
    if (activeContainerId !== null && selectedContainers.length > 0) {
      const exists = selectedContainers.some((c) => Number(c.id) === activeContainerId);
      if (!exists) {
        const firstContainerId = Number(selectedContainers[0].id);
        console.log('[LogsTab] 선택된 컨테이너가 목록에 없음, 첫 번째로 리셋:', firstContainerId);
        setActiveContainerId(firstContainerId);
      }
    }
  }, [selectedContainers, activeContainerId]);

  // WebSocket 실시간 로그 구독
  const { logs: wsLogs, isConnected, clearLogs } = useLogWebSocket(
    activeContainerId ? [activeContainerId] : [],
    isRealTimeEnabled
  );

  // 실시간 모드가 꺼질 때 WebSocket 로그 초기화
  useEffect(() => {
    if (!isRealTimeEnabled) {
      clearLogs();
    }
  }, [isRealTimeEnabled, clearLogs]);

  // Agent Name 목록 추출 (중복 제거)
  const agentNames = useMemo(() => {
    const names = new Set<string>();
    selectedContainers.forEach((container) => {
      if (container.agentName) {
        names.add(container.agentName);
      }
    });
    return Array.from(names).sort();
  }, [selectedContainers]);

  // 로그 조회 함수
  const fetchLogs = useCallback(async (containerId: number, isInitial: boolean = true) => {
    if (isInitial) {
      setIsLoading(true);
      setRestLogs([]);
      setLastLogId(null);
      setHasMore(false);
    }
    setError(null);

    try {
      const hasFilters = logSourceFilter !== 'ALL' || agentNameFilter !== 'ALL' || timeFilter !== null;

      console.log('[LogsTab] REST API 호출:', {
        containerIds: containerId,
        size: 50,
        direction: 'DESC',
        ...(hasFilters && {
          logSource: logSourceFilter !== 'ALL' ? logSourceFilter : undefined,
          agentName: agentNameFilter !== 'ALL' ? agentNameFilter : undefined,
          startTime: timeFilter?.collectedAtFrom,
          endTime: timeFilter?.collectedAtTo,
        }),
      });

      const response = await containerApi.getLogs({
        containerIds: containerId,
        size: 50,
        direction: 'DESC',
        logSource: logSourceFilter !== 'ALL' ? logSourceFilter : undefined,
        agentName: agentNameFilter !== 'ALL' ? agentNameFilter : undefined,
        startTime: timeFilter?.collectedAtFrom,
        endTime: timeFilter?.collectedAtTo,
      });

      console.log('[LogsTab] REST API 응답:', response);

      if (response.logs && response.logs.length > 0) {
        setRestLogs(response.logs);
        setLastLogId(response.lastLogId);
        setHasMore(response.hasMore);
      } else {
        setRestLogs([]);
        setLastLogId(null);
        setHasMore(false);
      }
    } catch (err) {
      console.error('[LogsTab] Failed to fetch logs:', err);
      setError('로그를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [logSourceFilter, agentNameFilter, timeFilter]);

  // activeContainerId 변경 시 로그 조회
  useEffect(() => {
    if (activeContainerId !== null) {
      fetchLogs(activeContainerId);
    }
  }, [activeContainerId, fetchLogs]);

  // 컨테이너 태그 클릭 핸들러
  const handleContainerClick = (containerId: number) => {
    if (containerId !== activeContainerId) {
      console.log('[LogsTab] 컨테이너 선택 변경:', containerId);
      setActiveContainerId(containerId);
    }
  };

  // 실시간 모드와 REST 로그 결합
  const logs = useMemo(() => {
    if (isRealTimeEnabled) {
      return [...wsLogs, ...restLogs];
    }
    return restLogs;
  }, [isRealTimeEnabled, wsLogs, restLogs]);

  // ContainerLogEntryDTO를 LogData로 변환
  const formattedLogs = useMemo<LogData[]>(() => {
    return logs.map((log) => ({
      timestamp: log.loggedAt,
      level: log.source,
      containerName: log.containerName,
      message: log.logMessage,
      agentName: log.agentName,
      duration: '',
    }));
  }, [logs]);

  // 다음 페이지 로드 (무한 스크롤)
  const loadMoreLogs = useCallback(async () => {
    if (isLoadingMore || !hasMore || isRealTimeEnabled || activeContainerId === null || lastLogId === null) {
      return;
    }

    setIsLoadingMore(true);
    try {
      console.log('[LogsTab] 무한 스크롤: 다음 페이지 로드', {
        containerIds: activeContainerId,
        lastLogId,
      });

      const response = await containerApi.getLogs({
        containerIds: activeContainerId,
        lastLogId: [lastLogId],
        size: 50,
        direction: 'DESC',
        logSource: logSourceFilter !== 'ALL' ? logSourceFilter : undefined,
        agentName: agentNameFilter !== 'ALL' ? agentNameFilter : undefined,
        startTime: timeFilter?.collectedAtFrom,
        endTime: timeFilter?.collectedAtTo,
      });

      console.log('[LogsTab] 무한 스크롤 응답:', response);

      if (response.logs && response.logs.length > 0) {
        setRestLogs((prev) => [...prev, ...response.logs]);
        setLastLogId(response.lastLogId);
        setHasMore(response.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[LogsTab] Failed to load more logs:', err);
      setHasMore(false);
      setIsCompleteModalOpen(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isRealTimeEnabled, activeContainerId, lastLogId, logSourceFilter, agentNameFilter, timeFilter]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = ((scrollTop + clientHeight) / scrollHeight) * 100;

    if (scrollPercentage >= 90 && hasMore && !isLoadingMore && !isRealTimeEnabled) {
      loadMoreLogs();
    }
  }, [hasMore, isLoadingMore, isRealTimeEnabled, loadMoreLogs]);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 실시간 모드 비활성화
  const disableRealTime = useCallback(() => {
    setIsRealTimeEnabled(false);
  }, []);

  // 모달 확인 핸들러
  const handleModalConfirm = () => {
    disableRealTime();
    if (pendingFilterAction) {
      pendingFilterAction();
    }
    setIsModalOpen(false);
    setPendingFilterAction(null);
  };

  // 모달 취소 핸들러
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setPendingFilterAction(null);
  };

  if (selectedContainers.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-text-secondary mb-2">컨테이너를 선택해주세요</h3>
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
            const containerId = Number(container.id);
            const isActive = containerId === activeContainerId;
            return (
              <button
                key={container.id}
                onClick={() => handleContainerClick(containerId)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                  font-pretendard text-sm font-medium tracking-tight
                  ${isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
              >
                <span>{container.containerName}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* WebSocket 연결 상태 표시 */}
      <div className="flex justify-end items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected && isRealTimeEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-text-secondary font-pretendard">
            {isRealTimeEnabled
              ? (isConnected ? '실시간 로그 스트리밍 중' : 'WebSocket 연결 중...')
              : '실시간 로그 일시정지'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-3 items-center flex-wrap">
        {/* Log Source 필터 */}
        <select
          value={logSourceFilter}
          onChange={(e) => {
            const newValue = e.target.value as LogSource | 'ALL';
            if (newValue !== 'ALL' && isRealTimeEnabled) {
              setPendingFilterAction(() => () => setLogSourceFilter(newValue));
              setIsModalOpen(true);
            } else {
              setLogSourceFilter(newValue);
            }
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-pretendard font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Log Source : ALL</option>
          <option value="STDOUT">STDOUT</option>
          <option value="STDERR">STDERR</option>
          <option value="RAW">RAW</option>
        </select>

        {/* Agent Name 필터 (동적 생성) */}
        <select
          value={agentNameFilter}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue !== 'ALL' && isRealTimeEnabled) {
              setPendingFilterAction(() => () => setAgentNameFilter(newValue));
              setIsModalOpen(true);
            } else {
              setAgentNameFilter(newValue);
            }
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-pretendard font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Agent Name : ALL</option>
          {agentNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {/* Time Filter */}
        <TimeFilter
          onSearch={(value) => {
            if (isRealTimeEnabled) {
              setPendingFilterAction(() => () => setTimeFilter(value));
              setIsModalOpen(true);
            } else {
              setTimeFilter(value);
            }
          }}
        />
      </div>

      {/* Logs Table */}
      <section className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <div ref={scrollContainerRef} className="max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300">
              <tr>
                {['Timestamp', 'Level', 'Container Name', 'Message', 'Agent Name', 'Duration'].map((header) => (
                  <th key={header} className="px-2 py-3 text-left">
                    <div className="text-text-secondary font-pretendard text-xs font-semibold uppercase tracking-wider">
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
              ) : formattedLogs.length > 0 ? (
                <>
                  {formattedLogs.map((log, index) => <LogRow key={`log-${index}`} log={log} />)}
                  {/* 무한 스크롤 로딩 표시 */}
                  {isLoadingMore && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-500 font-pretendard">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>추가 로그를 불러오는 중...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {/* 더 이상 로그가 없을 때 */}
                  {!hasMore && !isRealTimeEnabled && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-400 font-pretendard text-sm">
                        {timeFilter
                          ? '선택한 시간 범위의 모든 로그를 불러왔습니다.'
                          : '모든 로그를 불러왔습니다.'}
                      </td>
                    </tr>
                  )}
                </>
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

      {/* 필터 확인 모달 */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        header="실시간 로그 일시정지"
        content="정렬, 필터링 기능 이용 시 실시간으로 로그를 불러올 수 없습니다.\n필터를 적용하시겠습니까?"
        type="complete"
      />

      {/* 무한 스크롤 완료 모달 */}
      <ConfirmModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={() => setIsCompleteModalOpen(false)}
        header="로그 조회 완료"
        content="모든 로그를 불러왔습니다."
        type="confirm"
      />
    </div>
  );
};

export default LogsTab;
