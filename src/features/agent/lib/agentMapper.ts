import type { Agent } from '@/entities/agent/model/types';
import type { AgentStatusResponseDTO } from '@/shared/types/websocket';

/**
 * WebSocket DTO → UI Agent 변환
 *
 * WebSocket으로부터 받은 에이전트 상태 데이터를 UI에서 사용하는 형식으로 변환
 *
 * @param dto WebSocket에서 받은 AgentStatusResponseDTO
 * @returns UI에서 사용할 Agent 객체
 *
 * @example
 * ```ts
 * const dto = {
 *   agentId: 1,
 *   agentKey: 'abc123',
 *   agentName: 'Production Server',
 *   status: 'ON',
 *   description: 'Main production server',
 *   createdAt: '2024-01-01T00:00:00Z'
 * };
 *
 * const agent = mapWebSocketDTOToAgent(dto);
 * // {
 * //   id: '1',
 * //   agentName: 'Production Server',
 * //   active: 'ON',
 * //   hashcode: 'abc123',
 * //   description: 'Main production server',
 * //   createdAt: '2024-01-01T00:00:00Z'
 * // }
 * ```
 */
export function mapWebSocketDTOToAgent(dto: AgentStatusResponseDTO): Agent {
  return {
    id: String(dto.agentId),
    agentName: dto.agentName || '',
    active: dto.currentStatus || dto.status || 'OFFLINE', // WebSocket: currentStatus/status → UI: active
    hashcode: dto.agentKey || dto.hashcode || '', // WebSocket: agentKey or hashcode → UI: hashcode
    description: dto.description || '',
    createdAt: dto.createdAt || new Date().toISOString(),
  };
}

/**
 * WebSocket DTO 배열 → UI Agent 배열 변환
 *
 * @param dtos WebSocket DTO 배열
 * @returns UI Agent 배열
 */
export function mapWebSocketDTOsToAgents(dtos: AgentStatusResponseDTO[]): Agent[] {
  return dtos.map(mapWebSocketDTOToAgent);
}

/**
 * 에이전트 상태 업데이트 병합
 *
 * 기존 Agent 객체에 WebSocket으로 받은 상태 업데이트를 병합
 * 주로 상태(active)만 변경되는 경우 사용
 *
 * @param existingAgent 기존 Agent 객체
 * @param statusUpdate WebSocket 상태 업데이트
 * @returns 업데이트된 Agent 객체
 *
 * @example
 * ```ts
 * const existing = {
 *   id: '1',
 *   agentName: 'Server',
 *   active: 'ON',
 *   hashcode: 'abc123',
 *   description: 'Main server',
 *   createdAt: '2024-01-01'
 * };
 *
 * const update = { agentId: 1, status: 'OFF' };
 * const updated = mergeAgentStatus(existing, update);
 * // { ...existing, active: 'OFF' }
 * ```
 */
export function mergeAgentStatus(
  existingAgent: Agent,
  statusUpdate: AgentStatusResponseDTO
): Agent {
  return {
    ...existingAgent,
    active: statusUpdate.currentStatus || statusUpdate.status || existingAgent.active,
    // 다른 필드도 업데이트가 있으면 병합
    ...(statusUpdate.agentName && { agentName: statusUpdate.agentName }),
    ...(statusUpdate.description && { description: statusUpdate.description }),
    ...(statusUpdate.agentKey && { hashcode: statusUpdate.agentKey }),
    ...(statusUpdate.hashcode && { hashcode: statusUpdate.hashcode }),
  };
}
