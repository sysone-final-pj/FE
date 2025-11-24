/********************************************************************************************
 * useContainerStore.ts
 * ────────────────────────────────────────────────────────────────────────────────
 * Container 상태 관리 Store (백엔드 DTO 구조 대응)
 * - /topic/dashboard WebSocket의 중첩 DTO 구조 (container, cpu, memory, network, oom)에 맞춤
 * - 실시간 병합 및 일시정지 기능 포함
 * - 프론트엔드 우선 정렬/필터 기능 포함
 ********************************************************************************************/
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';
import type { FilterState } from '@/shared/types/container';

/** 정렬 옵션 타입 */
export type SortOption = 'favorite' | 'name' | 'cpu' | 'memory';

/**
 * 컨테이너 상태 관리 Store
 * - 실시간 컨테이너 목록 관리
 * - 일시정지 기능 (실시간 보기 중지)
 * - 프론트엔드 우선 정렬/필터 기능
 */
interface ContainerStore {
  // 상태
  containers: ContainerDashboardResponseDTO[];
  isPaused: boolean;
  pausedData: ContainerDashboardResponseDTO[];

  // 액션
  setContainers: (containers: ContainerDashboardResponseDTO[]) => void;
  updateContainer: (data: ContainerDashboardResponseDTO) => void;
  removeContainer: (containerId: number) => void;
  clearContainers: () => void;

  // 일시정지 기능
  togglePause: () => void;
  setPaused: (paused: boolean) => void;

  // 헬퍼
  getDisplayData: () => ContainerDashboardResponseDTO[];
  getContainer: (containerId: number) => ContainerDashboardResponseDTO | undefined;

  // 프론트엔드 정렬/필터
  getSortedAndFilteredData: (
    sortBy: SortOption,
    filters: FilterState
  ) => ContainerDashboardResponseDTO[];
}

/**
 * time-series 병합 헬퍼 함수
 * - Detail WebSocket: time-series 배열이 있으면 완전 교체
 * - List WebSocket: 현재값만 있으면 기존 time-series에 추가
 * - 그 외: 기존 데이터 유지
 */
function mergeTimeSeries<T extends { timestamp: string; value: number }>(
  incomingTimeSeries: T[] | undefined,
  currentValue: number | undefined,
  existingTimeSeries: T[] | undefined,
  maxPoints = 60  // 최대 60개 (1분, 1초마다 업데이트 가정)
): T[] {
  // 케이스 1: Detail WebSocket - time-series 배열이 있으면 완전 교체
  if ((incomingTimeSeries?.length ?? 0) > 0) {
    return incomingTimeSeries!;
  }

  // 케이스 2: List WebSocket - 현재값만 있으면 기존 time-series에 추가
  if (currentValue !== undefined && !isNaN(currentValue)) {
    const now = new Date().toISOString();
    const existing = existingTimeSeries ?? [];
    const newPoint = { timestamp: now, value: currentValue } as T;

    // 최대 개수 유지 (오래된 데이터 제거)
    const updated = [...existing, newPoint];
    return updated.slice(-maxPoints);
  }

  // 케이스 3: 그 외 - 기존 데이터 유지
  return existingTimeSeries ?? [];
}

export const useContainerStore = create<ContainerStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      containers: [],
      isPaused: false,
      pausedData: [],

      /*******************************************************
       * 전체 목록 설정 (REST 초기 로드)
       * - 완전 교체 방식: WebSocket 데이터와 병합하지 않음
       * - REST API는 초기 전체 데이터 로드용이므로 완전 교체가 맞음
       * - 실시간 업데이트는 updateContainer 사용
       *******************************************************/
      setContainers: (newContainers) => set({ containers: newContainers }),

      /*******************************************************
       * 단일 컨테이너 업데이트 (WebSocket 실시간)
       *******************************************************/
      updateContainer: (data) =>
        set((state) => {
          if (state.isPaused) return state; // 일시정지 시 업데이트 중단

          // containerId로 검색
          const index = state.containers.findIndex(
            (c) => c.container.containerId === data.container.containerId
          );


          if (index >= 0) {
            const updated = [...state.containers];
            const existing = updated[index];

            updated[index] = {
              ...existing,
              container: { ...existing.container, ...data.container },
              cpu: {
                ...existing.cpu,
                ...data.cpu,
                // Smart merge: Detail WebSocket (배열) or List WebSocket (현재값 추가)
                cpuPercent: mergeTimeSeries(
                  data.cpu?.cpuPercent,
                  data.cpu?.currentCpuPercent,
                  existing.cpu?.cpuPercent
                ),
                cpuCoreUsage: mergeTimeSeries(
                  data.cpu?.cpuCoreUsage,
                  data.cpu?.currentCpuCoreUsage,
                  existing.cpu?.cpuCoreUsage
                ),
                // ⚠️ List가 source of truth: percent는 List 값만 사용 (Detail이 보내면 업데이트, 안 보내면 유지)
                currentCpuPercent: data.cpu?.currentCpuPercent !== undefined
                  ? data.cpu.currentCpuPercent
                  : existing.cpu?.currentCpuPercent,
              },
              memory: {
                ...existing.memory,
                ...data.memory,
                // Smart merge: Detail WebSocket (배열) or List WebSocket (현재값 추가)
                memoryUsage: mergeTimeSeries(
                  data.memory?.memoryUsage,
                  data.memory?.currentMemoryUsage,
                  existing.memory?.memoryUsage
                ),
                memoryPercent: mergeTimeSeries(
                  data.memory?.memoryPercent,
                  data.memory?.currentMemoryPercent,
                  existing.memory?.memoryPercent
                ),
                // ⚠️ List가 source of truth: percent는 List 값만 사용 (Detail이 보내면 업데이트, 안 보내면 유지)
                currentMemoryPercent: data.memory?.currentMemoryPercent !== undefined
                  ? data.memory.currentMemoryPercent
                  : existing.memory?.currentMemoryPercent,
              },
              network: {
                ...existing.network,
                ...data.network,
                // Smart merge: Detail WebSocket (배열) or List WebSocket (현재값 추가)
                rxBytesPerSec: mergeTimeSeries(
                  data.network?.rxBytesPerSec,
                  data.network?.currentRxBytesPerSec,
                  existing.network?.rxBytesPerSec
                ),
                txBytesPerSec: mergeTimeSeries(
                  data.network?.txBytesPerSec,
                  data.network?.currentTxBytesPerSec,
                  existing.network?.txBytesPerSec
                ),
                rxPacketsPerSec: mergeTimeSeries(
                  data.network?.rxPacketsPerSec,
                  undefined,  // List WebSocket에서 제공하지 않음
                  existing.network?.rxPacketsPerSec
                ),
                txPacketsPerSec: mergeTimeSeries(
                  data.network?.txPacketsPerSec,
                  undefined,  // List WebSocket에서 제공하지 않음
                  existing.network?.txPacketsPerSec
                ),
              },
              blockIO: data.blockIO ? {
                ...existing.blockIO,
                ...data.blockIO,
                // Smart merge: Detail WebSocket (배열) or List WebSocket (현재값 추가)
                blkReadPerSec: mergeTimeSeries(
                  data.blockIO.blkReadPerSec,
                  data.blockIO.currentBlkReadPerSec,
                  existing.blockIO?.blkReadPerSec
                ),
                blkWritePerSec: mergeTimeSeries(
                  data.blockIO.blkWritePerSec,
                  data.blockIO.currentBlkWritePerSec,
                  existing.blockIO?.blkWritePerSec
                ),
              } : existing.blockIO,
              oom: { ...existing.oom, ...data.oom },
              storage: data.storage ? { ...data.storage } : existing.storage,
            };

            return { containers: updated };
          } else {
            // 새 컨테이너 추가
            return { containers: [...state.containers, data] };
          }
        }),

      /*******************************************************
       * 컨테이너 제거
       *******************************************************/
      removeContainer: (containerId) =>
        set((state) => ({
          containers: state.containers.filter(
            (c) => c.container.containerId !== containerId
          ),
        })),

      /*******************************************************
       * 전체 초기화
       *******************************************************/
      clearContainers: () => set({ containers: [], pausedData: [], isPaused: false }),

      /*******************************************************
       * 일시정지 토글
       *******************************************************/
      togglePause: () =>
        set((state) => {
          if (!state.isPaused) {
            return {
              isPaused: true,
              pausedData: [...state.containers],
            };
          } else {
            return {
              isPaused: false,
              pausedData: [],
            };
          }
        }),

      /*******************************************************
       * 일시정지 상태 직접 설정
       *******************************************************/
      setPaused: (paused) =>
        set((state) => {
          if (paused && !state.isPaused) {
            return { isPaused: true, pausedData: [...state.containers] };
          } else if (!paused && state.isPaused) {
            return { isPaused: false, pausedData: [] };
          }
          return state;
        }),

      /*******************************************************
       * 헬퍼: 화면 표시용 데이터
       *******************************************************/
      getDisplayData: () => {
        const state = get();
        return state.isPaused ? state.pausedData : state.containers;
      },

      /*******************************************************
       * 헬퍼: 개별 컨테이너 조회
       *******************************************************/
      getContainer: (containerId) => {
        const state = get();
        const data = state.isPaused ? state.pausedData : state.containers;
        return data.find((c) => c.container.containerId === containerId);
      },

      /*******************************************************
       * 헬퍼: 프론트엔드 정렬 및 필터 적용
       * - WebSocket 데이터를 프론트엔드에서 정렬/필터
       * - 백엔드 의존 없이 즉시 반영
       *******************************************************/
      getSortedAndFilteredData: (sortBy, filters) => {
        const state = get();
        const data = state.isPaused ? state.pausedData : state.containers;

        // 1. DELETED/UNKNOWN 필터링
        let result = data.filter(c => {
          const containerState = c.container.state?.toUpperCase();
          return containerState !== 'DELETED' && containerState !== 'UNKNOWN';
        });

        // 2. Favorite 필터
        const favoriteFilter = filters.quickFilters.find(f => f.id === 'favorite');
        if (favoriteFilter?.checked) {
          result = result.filter(c => {
            // isFavorite 필드가 있는 경우 (REST API에서 변환된 데이터)
            const dto = c as ContainerDashboardResponseDTO & { isFavorite?: boolean };
            return dto.isFavorite === true;
          });
        }

        // 3. Agent Name 필터
        if (filters.agentName.length > 0) {
          result = result.filter(c =>
            filters.agentName.includes(c.container.agentName)
          );
        }

        // 4. State 필터
        if (filters.state.length > 0) {
          result = result.filter(c =>
            filters.state.some(s => s.toLowerCase() === c.container.state?.toLowerCase())
          );
        }

        // 5. Health 필터
        if (filters.health.length > 0) {
          result = result.filter(c =>
            filters.health.some(h => h.toLowerCase() === c.container.health?.toLowerCase())
          );
        }

        // 6. 정렬 적용
        result = [...result].sort((a, b) => {
          switch (sortBy) {
            case 'favorite': {
              // isFavorite 필드로 정렬 (true가 상위)
              const aFav = (a as ContainerDashboardResponseDTO & { isFavorite?: boolean }).isFavorite ? 1 : 0;
              const bFav = (b as ContainerDashboardResponseDTO & { isFavorite?: boolean }).isFavorite ? 1 : 0;
              if (bFav !== aFav) return bFav - aFav;
              // 같으면 이름순
              return (a.container.containerName || '').localeCompare(b.container.containerName || '');
            }
            case 'name':
              return (a.container.containerName || '').localeCompare(b.container.containerName || '');
            case 'cpu': {
              const aCpu = a.cpu?.currentCpuPercent ?? 0;
              const bCpu = b.cpu?.currentCpuPercent ?? 0;
              return bCpu - aCpu; // 높은 순
            }
            case 'memory': {
              const aMem = a.memory?.currentMemoryPercent ?? 0;
              const bMem = b.memory?.currentMemoryPercent ?? 0;
              return bMem - aMem; // 높은 순
            }
            default:
              return 0;
          }
        });

        return result;
      },
    }),
    { name: 'ContainerStore' }
  )
);