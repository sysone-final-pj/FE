import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { LogData } from '@/shared/types/metrics';
import { LogRow } from '@/entities/events/ui/EventRow';
import { containerApi, type LogSource } from '@/shared/api/container';
import type { ContainerLogEntryDTO } from '@/shared/api/container';
import { useLogWebSocket } from '@/features/log/hooks/useLogWebSocket';
import { TimeFilter, type TimeFilterValue } from '@/shared/ui/TimeFilter/TimeFilter';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';

/**
 * LogSource를 LogData의 level로 매핑
 */
function mapLogSourceToLevel(source: LogSource): LogData['level'] {
  switch (source) {
    case 'STDOUT':
      return 'INFO';
    case 'STDERR':
      return 'ERROR';
    case 'RAW':
      return 'DEBUG';
    default:
      return 'INFO';
  }
}

interface LogsTabProps {
  selectedContainers: ContainerData[];
  isRealTimeEnabled: boolean;
  onDisableRealTime: () => void; // 실시간 모드 비활성화 콜백
}

const LogsTab: React.FC<LogsTabProps> = ({ selectedContainers, isRealTimeEnabled, onDisableRealTime }) => {
  const [selectedContainerForLogs, setSelectedContainerForLogs] = useState<string[]>([]);
  const [restLogs, setRestLogs] = useState<ContainerLogEntryDTO[]>([]); // REST API로 가져온 로그
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 무한 스크롤 관련 상태
  const [hasMore, setHasMore] = useState(false);
  const [lastLogId, setLastLogId] = useState<number | null>(null);
  const [lastLoggedAt, setLastLoggedAt] = useState<string | null>(null);
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

  // 이미 로드된 컨테이너 ID 추적 (중복 로드 방지)
  const loadedContainerIdsRef = useRef<Set<number>>(new Set());

  // 스크롤 영역 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 선택된 컨테이너 ID 목록 (안정화된 참조)
  const prevContainerIdsRef = useRef<number[]>([]);
  const prevIdsKeyRef = useRef<string>('');

  const selectedContainerIds = useMemo(() => {
    const ids = selectedContainers.map((c) => Number(c.id)).sort((a, b) => a - b);
    const idsKey = ids.join(',');

    // ID가 실제로 변경되지 않았으면 이전 배열 참조 반환
    if (idsKey === prevIdsKeyRef.current) {
      return prevContainerIdsRef.current;
    }

    // ID가 변경되었을 때만 새 배열 생성
    console.log('[LogsTab] 컨테이너 선택 변경:', ids);
    prevIdsKeyRef.current = idsKey;
    prevContainerIdsRef.current = ids;
    return ids;
  }, [selectedContainers]);

  // WebSocket 실시간 로그 구독 (상위 컴포넌트의 실시간 모드 따름)
  const { logs: wsLogs, isConnected, clearLogs } = useLogWebSocket(
    selectedContainerIds,
    isRealTimeEnabled
  );

  // 실시간 모드가 꺼질 때 WebSocket 로그 초기화 + loadedContainerIds 초기화
  useEffect(() => {
    if (!isRealTimeEnabled) {
      clearLogs();
      // 필터 모드로 전환 시 이전에 로드된 컨테이너 정보 초기화
      loadedContainerIdsRef.current.clear();
      console.log('[LogsTab] 필터 모드로 전환 - loadedContainerIds 초기화');
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

  // REST API로 로그 데이터 로드
  useEffect(() => {
    if (selectedContainerIds.length === 0) {
      setRestLogs([]);
      loadedContainerIdsRef.current.clear();
      return;
    }

    // 필터가 하나라도 설정되어 있는지 확인
    const hasFilters = (
      logSourceFilter !== 'ALL' ||
      agentNameFilter !== 'ALL' ||
      timeFilter !== null
    );

    // 실시간 모드 + 필터 없음: 초기 로드만 (새로운 컨테이너만)
    // 필터가 있으면 실시간 모드여도 필터 로드를 수행 (state 업데이트 타이밍 문제 해결)
    if (isRealTimeEnabled && !hasFilters) {
      const newContainerIds = selectedContainerIds.filter(
        (id) => !loadedContainerIdsRef.current.has(id)
      );

      if (newContainerIds.length === 0) {
        console.log('[LogsTab] 이미 로드된 컨테이너들 - API 호출 스킵');
        return;
      }

      const fetchInitialLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const allLogs: ContainerLogEntryDTO[] = [];

          // 각 컨테이너마다 개별 API 호출
          for (const containerId of newContainerIds) {
            console.log('[LogsTab] REST API 초기 로드 (신규 컨테이너):', {
              lastLogId: containerId,
              size: 50,
            });

            const response = await containerApi.getLogs({
              lastLogId: containerId,
              size: 50,
            });

            console.log(`[LogsTab] 컨테이너 ${containerId} REST API 응답:`, response);

            if (response.logs && response.logs.length > 0) {
              allLogs.push(...response.logs);
              console.log(`[LogsTab] 컨테이너 ${containerId} 로그 ${response.logs.length}개 추가`);
            }

            // 로드 완료된 컨테이너 기록
            loadedContainerIdsRef.current.add(containerId);
          }

          console.log('[LogsTab] REST API 전체 로그 개수:', allLogs.length);

          // 기존 로그와 합치기
          setRestLogs((prev) => [...prev, ...allLogs]);
        } catch (err) {
          console.error('[LogsTab] Failed to fetch logs:', err);
          setError('로그를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchInitialLogs();
    } else {
      // 필터 모드이거나 필터가 있을 때: 필터를 적용해서 로드
      const fetchFilteredLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const allLogs: ContainerLogEntryDTO[] = [];
          let combinedHasMore = false;

          // 각 컨테이너마다 개별 API 호출 (필터 적용)
          for (const containerId of selectedContainerIds) {
            console.log('[LogsTab] REST API 필터 적용 로드:', {
              lastLogId: containerId,
              logSource: logSourceFilter !== 'ALL' ? logSourceFilter : undefined,
              agentName: agentNameFilter !== 'ALL' ? agentNameFilter : undefined,
              startTime: timeFilter?.collectedAtFrom,
              endTime: timeFilter?.collectedAtTo,
              size: 100,
            });

            const response = await containerApi.getLogs({
              lastLogId: containerId,
              logSource: logSourceFilter !== 'ALL' ? logSourceFilter : undefined,
              agentName: agentNameFilter !== 'ALL' ? agentNameFilter : undefined,
              // Quick Range는 이미 절대 시간으로 변환됨
              startTime: timeFilter?.collectedAtFrom,
              endTime: timeFilter?.collectedAtTo,
              size: 100,
            });

            console.log(`[LogsTab] 컨테이너 ${containerId} 필터 적용 응답:`, response);

            if (response.logs && response.logs.length > 0) {
              allLogs.push(...response.logs);
            }

            // 하나라도 hasMore가 true면 전체도 true
            if (response.hasMore) {
              combinedHasMore = true;
            }
          }

          console.log('[LogsTab] 필터 적용 전체 로그 개수:', allLogs.length);
          console.log('[LogsTab] 적용된 필터:', {
            logSourceFilter,
            agentNameFilter,
            timeFilter: timeFilter ? {
              from: timeFilter.collectedAtFrom,
              to: timeFilter.collectedAtTo,
            } : null,
          });

          // 필터 적용 시 기존 로그 대체 (빈 결과도 반영)
          setRestLogs(allLogs);

          if (allLogs.length === 0) {
            console.log('[LogsTab] ⚠️ 필터 조건에 맞는 로그가 없습니다.');
          }

          // 무한 스크롤 메타데이터 업데이트
          setHasMore(combinedHasMore);
          // 마지막 로그의 ID와 시간 저장 (무한 스크롤용)
          if (allLogs.length > 0) {
            const lastLog = allLogs[allLogs.length - 1];
            setLastLogId(lastLog.id);
            setLastLoggedAt(lastLog.loggedAt);
          } else {
            // 빈 결과일 때는 커서 초기화
            setLastLogId(null);
            setLastLoggedAt(null);
          }
        } catch (err) {
          console.error('[LogsTab] Failed to fetch filtered logs:', err);
          setError('로그를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchFilteredLogs();
    }
  }, [selectedContainerIds, isRealTimeEnabled, logSourceFilter, agentNameFilter, timeFilter]);

  // 실시간 모드와 REST 로그 결합
  const logs = useMemo(() => {
    if (isRealTimeEnabled) {
      // 실시간 모드: WebSocket 로그 + REST 로그 합침
      return [...wsLogs, ...restLogs];
    } else {
      // 일시정지 모드: REST 로그만 사용
      return restLogs;
    }
  }, [isRealTimeEnabled, wsLogs, restLogs]);

  // ContainerLogEntryDTO를 LogData로 변환
  const formattedLogs = useMemo<LogData[]>(() => {
    return logs.map((log) => ({
      timestamp: log.loggedAt,
      level: mapLogSourceToLevel(log.source),
      containerName: log.containerName,
      message: log.logMessage,
      agentName: log.agentName,
      duration: '', // TODO: 추후 계산
    }));
  }, [logs]);

  // 선택된 컨테이너 필터링
  const filteredLogs = useMemo<LogData[]>(() => {
    if (selectedContainerForLogs.length === 0) {
      return formattedLogs;
    }

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

  // 다음 페이지 로드 (무한 스크롤)
  const loadMoreLogs = useCallback(async () => {
    if (isLoadingMore || !hasMore || isRealTimeEnabled) {
      console.log('[LogsTab] 무한 스크롤 스킵:', { isLoadingMore, hasMore, isRealTimeEnabled });
      return;
    }

    setIsLoadingMore(true);
    try {
      console.log('[LogsTab] 무한 스크롤: 다음 페이지 로드', {
        lastLogId,
        lastLoggedAt,
      });

      const allLogs: ContainerLogEntryDTO[] = [];
      let combinedHasMore = false;

      // 각 컨테이너마다 개별 API 호출 (무한 스크롤)
      // 시간 필터 + 커서를 함께 사용하여 시간 범위 내에서 페이지네이션
      for (const containerId of selectedContainerIds) {
        const response = await containerApi.getLogs({
          lastLogId: lastLogId ?? containerId,
          lastLoggedAt: lastLoggedAt ?? undefined,
          logSource: logSourceFilter !== 'ALL' ? logSourceFilter : undefined,
          agentName: agentNameFilter !== 'ALL' ? agentNameFilter : undefined,
          // Quick Range는 이미 절대 시간으로 변환됨
          startTime: timeFilter?.collectedAtFrom,
          endTime: timeFilter?.collectedAtTo,
          size: 50,
        });

        console.log(`[LogsTab] 컨테이너 ${containerId} 다음 페이지 응답:`, response);

        if (response.logs && response.logs.length > 0) {
          allLogs.push(...response.logs);
        }

        if (response.hasMore) {
          combinedHasMore = true;
        }
      }

      if (allLogs.length > 0) {
        setRestLogs((prev) => [...prev, ...allLogs]);

        // 마지막 로그의 ID와 시간 업데이트
        const lastLog = allLogs[allLogs.length - 1];
        setLastLogId(lastLog.id);
        setLastLoggedAt(lastLog.loggedAt);
      }

      setHasMore(combinedHasMore);
    } catch (err) {
      console.error('[LogsTab] Failed to load more logs:', err);

      // 서버 에러 발생 시 더 이상 로그가 없는 것으로 처리
      setHasMore(false);

      // 완료 모달 표시
      setIsCompleteModalOpen(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isRealTimeEnabled, timeFilter, lastLogId, lastLoggedAt, selectedContainerIds, logSourceFilter, agentNameFilter]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = ((scrollTop + clientHeight) / scrollHeight) * 100;

    // 하단 90% 도달 시 다음 페이지 로드
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

  // 모달 확인 핸들러
  const handleModalConfirm = () => {
    // 실시간 모드 비활성화
    onDisableRealTime();
    // 대기 중인 필터 액션 실행
    if (pendingFilterAction) {
      pendingFilterAction();
    }
    // 상태 초기화
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

      {/* WebSocket 연결 상태 표시 */}
      <div className="flex justify-end items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected && isRealTimeEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600 font-pretendard">
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
              // 실시간 모드일 때 모달 표시
              setPendingFilterAction(() => () => setLogSourceFilter(newValue));
              setIsModalOpen(true);
            } else {
              // 실시간 모드가 아니거나 ALL 선택 시 바로 적용
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
              // 실시간 모드일 때 모달 표시
              setPendingFilterAction(() => () => setAgentNameFilter(newValue));
              setIsModalOpen(true);
            } else {
              // 실시간 모드가 아니거나 ALL 선택 시 바로 적용
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
              // 실시간 모드일 때 모달 표시
              setPendingFilterAction(() => () => setTimeFilter(value));
              setIsModalOpen(true);
            } else {
              // 실시간 모드가 아닐 때 바로 적용
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
                <>
                  {filteredLogs.map((log, index) => <LogRow key={`log-${index}`} log={log} />)}
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
