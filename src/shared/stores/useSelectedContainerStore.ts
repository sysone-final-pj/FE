/********************************************************************************************
 * useSelectedContainerStore.ts
 * ────────────────────────────────────────────────────────────────────────────────
 * 선택된 컨테이너의 상세 데이터 관리 Store
 * - Dashboard Detail WebSocket 전용
 * - List WebSocket과 독립적으로 동작
 * - 단일 컨테이너 상태만 관리하여 깜빡임 방지
 ********************************************************************************************/
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';

/**
 * 선택된 컨테이너 상세 정보 Store
 * - Detail WebSocket으로부터 받은 데이터만 저장
 * - List WebSocket의 업데이트와 완전히 독립적
 */
interface SelectedContainerStore {
  // 상태
  selectedContainer: ContainerDashboardResponseDTO | null;

  // 액션
  setSelectedContainer: (container: ContainerDashboardResponseDTO) => void;
  clearSelectedContainer: () => void;
}

export const useSelectedContainerStore = create<SelectedContainerStore>()(
  devtools(
    (set) => ({
      // 초기 상태
      selectedContainer: null,

      // 선택된 컨테이너 설정 (Detail WebSocket에서 호출)
      setSelectedContainer: (container) =>
        set(
          { selectedContainer: container },
          false,
          'setSelectedContainer'
        ),

      // 선택된 컨테이너 클리어 (선택 해제 시)
      clearSelectedContainer: () =>
        set(
          { selectedContainer: null },
          false,
          'clearSelectedContainer'
        ),
    }),
    { name: 'SelectedContainerStore' }
  )
);
