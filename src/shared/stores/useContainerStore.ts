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

      // 전체 목록 설정 (초기 로드)
      setContainers: (containers) => set({ containers }),

      // 개별 컨테이너 업데이트 (WebSocket 실시간)
      updateContainer: (data) =>
        set((state) => {
          // 일시정지 중이면 업데이트 안함
          if (state.isPaused) {
            return state;
          }

          const index = state.containers.findIndex(
            (c) => c.containerId === data.containerId
          );

          if (index >= 0) {
            // 기존 컨테이너 업데이트
            const newContainers = [...state.containers];
            newContainers[index] = data;
            return { containers: newContainers };
          } else {
            // 새 컨테이너 추가
            return { containers: [...state.containers, data] };
          }
        }),

      // 컨테이너 제거
      removeContainer: (containerId) =>
        set((state) => ({
          containers: state.containers.filter((c) => c.containerId !== containerId),
        })),

      // 전체 초기화
      clearContainers: () => set({ containers: [], pausedData: [], isPaused: false }),

      // 일시정지 토글
      togglePause: () =>
        set((state) => {
          if (!state.isPaused) {
            // 정지: 현재 데이터를 스냅샷으로 저장
            return {
              isPaused: true,
              pausedData: [...state.containers],
            };
          } else {
            // 재개: pausedData 버림
            return {
              isPaused: false,
              pausedData: [],
            };
          }
        }),

      // 일시정지 상태 직접 설정
      setPaused: (paused) =>
        set((state) => {
          if (paused && !state.isPaused) {
            // 정지
            return {
              isPaused: true,
              pausedData: [...state.containers],
            };
          } else if (!paused && state.isPaused) {
            // 재개
            return {
              isPaused: false,
              pausedData: [],
            };
          }
          return state;
        }),

      // 화면에 표시할 데이터 반환
      getDisplayData: () => {
        const state = get();
        return state.isPaused ? state.pausedData : state.containers;
      },

      // 특정 컨테이너 조회
      getContainer: (containerId) => {
        const state = get();
        const data = state.isPaused ? state.pausedData : state.containers;
        return data.find((c) => c.containerId === containerId);
      },
    }),
    { name: 'ContainerStore' }
  )
);
