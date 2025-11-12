/********************************************************************************************
 * useContainerStore.ts
 * ────────────────────────────────────────────────────────────────────────────────
 * Container 상태 관리 Store (백엔드 DTO 구조 대응)
 * - /topic/dashboard WebSocket의 중첩 DTO 구조 (container, cpu, memory, network, oom)에 맞춤
 * - 실시간 병합 및 일시정지 기능 포함
 ********************************************************************************************/
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';

/**
 * 컨테이너 상태 관리 Store
 * - 실시간 컨테이너 목록 관리
 * - 일시정지 기능 (실시간 보기 중지)
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
       *******************************************************/
      setContainers: (newContainers) =>
        set((state) => {
          const merged = [...state.containers];

          newContainers.forEach((newC) => {
            const idx = merged.findIndex(
              (c) => c.container.containerHash === newC.container.containerHash
            );

            if (idx >= 0) {
              // 기존 데이터 병합 (깊은 병합)
              merged[idx] = {
                ...merged[idx],
                container: { ...merged[idx].container, ...newC.container },
                cpu: { ...merged[idx].cpu, ...newC.cpu },
                memory: { ...merged[idx].memory, ...newC.memory },
                network: { ...merged[idx].network, ...newC.network },
                oom: { ...merged[idx].oom, ...newC.oom },
              };
            } else {
              // 새 컨테이너 추가
              merged.push(newC);
            }
          });

          return { containers: merged };
        }),

      /*******************************************************
       * 단일 컨테이너 업데이트 (WebSocket 실시간)
       *******************************************************/
      updateContainer: (data) =>
        set((state) => {
          if (state.isPaused) return state; // 일시정지 시 업데이트 중단

          const index = state.containers.findIndex(
            (c) => c.container.containerHash === data.container.containerHash
          );

          if (index >= 0) {
            const updated = [...state.containers];
            updated[index] = {
              ...updated[index],
              container: { ...updated[index].container, ...data.container },
              cpu: { ...updated[index].cpu, ...data.cpu },
              memory: { ...updated[index].memory, ...data.memory },
              network: { ...updated[index].network, ...data.network },
              oom: { ...updated[index].oom, ...data.oom },
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
    }),
    { name: 'ContainerStore' }
  )
);
