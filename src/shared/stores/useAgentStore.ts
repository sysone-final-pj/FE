import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AgentStatusResponseDTO } from '@/shared/types/websocket';

/**
 * 에이전트 상태 정보
 * WebSocket DTO를 기반으로 한 확장 타입
 */
export interface AgentState extends AgentStatusResponseDTO {
  // WebSocket DTO 필드 포함
  // 추가 UI 전용 필드가 필요하면 여기에 추가
}

/**
 * 에이전트 상태 관리 Store
 * - 실시간 에이전트 상태 수신 및 관리
 * - WebSocket으로부터 ON/OFF 상태 업데이트
 * - localStorage 저장 없음 (실시간 데이터이므로)
 */
interface AgentStore {
  // 상태
  agents: AgentState[];

  // 액션
  setAgents: (agents: AgentState[]) => void;
  updateAgent: (agent: AgentStatusResponseDTO) => void;
  updateAgentStatus: (agentId: number, status: 'ON' | 'OFF') => void;
  removeAgent: (agentId: number) => void;
  clearAgents: () => void;

  // 헬퍼
  getAgent: (agentId: number) => AgentState | undefined;
  getOnlineAgents: () => AgentState[];
  getOfflineAgents: () => AgentState[];
}

export const useAgentStore = create<AgentStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      agents: [],

      // 전체 에이전트 목록 설정 (REST 초기 로드)
      setAgents: (agents) => set({ agents }),

      // 단일 에이전트 업데이트 또는 추가 (WebSocket 실시간)
      updateAgent: (agentData) =>
        set((state) => {
          const index = state.agents.findIndex(
            (a) => a.agentId === agentData.agentId
          );

          if (index >= 0) {
            // 기존 에이전트 업데이트
            const updated = [...state.agents];
            updated[index] = {
              ...updated[index],
              ...agentData,
            };
            return { agents: updated };
          } else {
            // 새 에이전트 추가
            return { agents: [...state.agents, agentData as AgentState] };
          }
        }),

      // 에이전트 상태만 업데이트 (간편 메서드)
      updateAgentStatus: (agentId, status) =>
        set((state) => {
          const index = state.agents.findIndex((a) => a.agentId === agentId);

          if (index >= 0) {
            const updated = [...state.agents];
            updated[index] = {
              ...updated[index],
              status,
            };
            return { agents: updated };
          }
          return state;
        }),

      // 에이전트 제거
      removeAgent: (agentId) =>
        set((state) => ({
          agents: state.agents.filter((a) => a.agentId !== agentId),
        })),

      // 전체 초기화
      clearAgents: () => set({ agents: [] }),

      // 특정 에이전트 조회
      getAgent: (agentId) => {
        const state = get();
        return state.agents.find((a) => a.agentId === agentId);
      },

      // 온라인 에이전트 목록
      getOnlineAgents: () => {
        const state = get();
        return state.agents.filter((a) => a.status === 'ON');
      },

      // 오프라인 에이전트 목록
      getOfflineAgents: () => {
        const state = get();
        return state.agents.filter((a) => a.status === 'OFF');
      },
    }),
    { name: 'AgentStore' }
  )
);
