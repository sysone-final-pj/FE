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

          console.log('[ContainerStore] updateContainer:', {
            incomingContainerId: data.container.containerId,
            incomingContainerHash: data.container.containerHash,
            foundIndex: index,
            rxTimeSeriesLength: data.network?.rxBytesPerSec?.length,
            txTimeSeriesLength: data.network?.txBytesPerSec?.length,
          });

          if (index >= 0) {
            const updated = [...state.containers];
            const existing = updated[index];

            updated[index] = {
              ...existing,
              container: { ...existing.container, ...data.container },
              cpu: {
                ...existing.cpu,
                ...data.cpu,
                // Preserve time-series if incoming data has empty arrays (WebSocket snapshot)
                cpuPercent: data.cpu?.cpuPercent?.length > 0 ? data.cpu.cpuPercent : existing.cpu?.cpuPercent,
                cpuCoreUsage: data.cpu?.cpuCoreUsage?.length > 0 ? data.cpu.cpuCoreUsage : existing.cpu?.cpuCoreUsage,
              },
              memory: {
                ...existing.memory,
                ...data.memory,
                // Preserve time-series if incoming data has empty arrays (WebSocket snapshot)
                memoryUsage: data.memory?.memoryUsage?.length > 0 ? data.memory.memoryUsage : existing.memory?.memoryUsage,
                memoryPercent: data.memory?.memoryPercent?.length > 0 ? data.memory.memoryPercent : existing.memory?.memoryPercent,
              },
              network: {
                ...existing.network,
                ...data.network,
                // Preserve time-series if incoming data has empty arrays (WebSocket snapshot)
                rxBytesPerSec: data.network?.rxBytesPerSec?.length > 0 ? data.network.rxBytesPerSec : existing.network?.rxBytesPerSec,
                txBytesPerSec: data.network?.txBytesPerSec?.length > 0 ? data.network.txBytesPerSec : existing.network?.txBytesPerSec,
                rxPacketsPerSec: data.network?.rxPacketsPerSec?.length > 0 ? data.network.rxPacketsPerSec : existing.network?.rxPacketsPerSec,
                txPacketsPerSec: data.network?.txPacketsPerSec?.length > 0 ? data.network.txPacketsPerSec : existing.network?.txPacketsPerSec,
              },
              blockIO: data.blockIO ? {
                ...existing.blockIO,
                ...data.blockIO,
                // Preserve time-series if incoming data has empty arrays (WebSocket snapshot)
                blkReadPerSec: (data.blockIO.blkReadPerSec?.length ?? 0) > 0 ? data.blockIO.blkReadPerSec : (existing.blockIO?.blkReadPerSec ?? []),
                blkWritePerSec: (data.blockIO.blkWritePerSec?.length ?? 0) > 0 ? data.blockIO.blkWritePerSec : (existing.blockIO?.blkWritePerSec ?? []),
              } : existing.blockIO,
              oom: { ...existing.oom, ...data.oom },
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
