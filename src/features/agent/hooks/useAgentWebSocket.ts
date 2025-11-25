import { useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { WS_DESTINATIONS, type AgentStatusResponseDTO } from '@/shared/types/websocket';
import { useAgentStore } from '@/shared/stores/useAgentStore';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

/**
 * Agent 전용 웹소켓 훅
 * - /topic/agents/status 구독
 * - 실시간 에이전트 상태 (ON/OFF) 수신
 * - Agent Store 자동 업데이트
 *
 * @example
 * ```tsx
 * const { isConnected, agents, onlineAgents, offlineAgents } = useAgentWebSocket();
 *
 * return (
 *   <div>
 *     <h3>Online Agents: {onlineAgents.length}</h3>
 *     <h3>Offline Agents: {offlineAgents.length}</h3>
 *     <AgentList agents={agents} />
 *   </div>
 * );
 * ```
 */
export function useAgentWebSocket() {
  // Store에서 상태 가져오기
  const updateAgent = useAgentStore((state) => state.updateAgent);
  const agents = useAgentStore((state) => state.agents);
  const getOnlineAgents = useAgentStore((state) => state.getOnlineAgents);
  const getOfflineAgents = useAgentStore((state) => state.getOfflineAgents);
  const status = useWebSocketStore((state) => state.status);
  const error = useWebSocketStore((state) => state.error);

  /**
   * 메시지 처리 콜백
   * - AgentStatusResponseDTO 파싱
   * - 여러 가능한 데이터 형식 지원:
   *   1. 단일 에이전트: { agentId: 1, status: 'ON', ... }
   *   2. 에이전트 배열: [{ agentId: 1, status: 'ON' }, ...]
   *   3. Response wrapper: { data: {...} } or { data: [...] }
   * - Store에 자동 업데이트
   */
  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        // 메시지 파싱
        const parsed = JSON.parse(message.body);
        // 메시지 형식 감지 및 처리
        let items: AgentStatusResponseDTO[] = [];

        if (Array.isArray(parsed)) {
          // 케이스 1: 배열 형식 [{ agentId, status, ... }, ...]
          items = parsed;
        } else if (parsed.data && Array.isArray(parsed.data)) {
          // 케이스 2: Response wrapper with array { data: [...] }
          items = parsed.data;
        } else if (parsed.data && !Array.isArray(parsed.data)) {
          // 케이스 3: Response wrapper with single item { data: {...} }
          items = [parsed.data];
        } else if (parsed.agentId !== undefined) {
          // 케이스 4: 단일 에이전트 객체 { agentId, status, ... }
          items = [parsed];
        } else {
          // 알 수 없는 형식
          // console.warn('[Agent WebSocket] ⚠️ Unknown message format:', parsed);
          // console.warn('[Agent WebSocket] ⚠️ Expected formats:');
          // console.warn('  1. Single agent: { agentId: 1, status: "ON", ... }');
          // console.warn('  2. Array: [{ agentId: 1, status: "ON" }, ...]');
          // console.warn('  3. Wrapper: { data: {...} } or { data: [...] }');
          return;
        }

        // 각 아이템을 Store에 업데이트
        items.forEach((item) => {
          // currentStatus를 status로 정규화
          const normalizedItem: AgentStatusResponseDTO = {
            ...item,
            status: item.currentStatus || item.status,
          };

          updateAgent(normalizedItem);
        });

      } catch (error) {
        console.error('[Agent WebSocket] ❌ Failed to parse message:', error);
        console.error('[Agent WebSocket] ❌ Raw body:', message.body);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    },
    [updateAgent, agents]
  );

  // WebSocket 구독
  const { isConnected } = useWebSocket({
    destination: WS_DESTINATIONS.AGENTS_STATUS,
    onMessage: handleMessage,
    autoConnect: true,
    autoDisconnect: false,
  });

  return {
    /** 현재 연결 상태 */
    status,
    /** 발생한 에러 */
    error,
    /** 연결되어 있는지 여부 */
    isConnected,
    /** 모든 에이전트 목록 */
    agents,
    /** 온라인 에이전트 목록 */
    onlineAgents: getOnlineAgents(),
    /** 오프라인 에이전트 목록 */
    offlineAgents: getOfflineAgents(),
  };
}
