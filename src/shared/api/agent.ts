import { api } from './axiosInstance';

export type AgentStatus = 'REGISTERED';

export interface Agent {
  id: number;
  agentKey: string;
  agentName: string;
  description: string;
  agentStatus: AgentStatus;
}

export interface AgentListItem {
  id: number;
  agentName: string;
  description: string;
  agentStatus: AgentStatus;
  agentKey?: string; // 백엔드에서 목록 조회에 agentKey를 포함할 경우를 대비
}

export interface CreateAgentRequest {
  agentName: string;
  agentStatus: AgentStatus;
  description: string;
}

export interface UpdateAgentRequest {
  agentName: string;
  description: string;
}

interface GetAgentResponse {
  statusCode: number;
  message: string;
  data: Agent;
}

interface GetAgentsResponse {
  statusCode: number;
  message: string;
  data: AgentListItem[];
}

interface UpdateAgentResponse {
  statusCode: number;
  message: string;
  data: {
    agentName: string;
    description: string;
  };
}

export const agentApi = {
  /**
   * 에이전트 전체 조회
   */
  async getAgents(): Promise<GetAgentsResponse> {
    const response = await api.get<GetAgentsResponse>('/agents');
    return response.data;
  },

  /**
   * 에이전트 단일 조회
   */
  async getAgent(id: number): Promise<GetAgentResponse> {
    const response = await api.get<GetAgentResponse>(`/agents/${id}`);
    return response.data;
  },

  /**
   * 에이전트 생성
   */
  async createAgent(data: CreateAgentRequest): Promise<void> {
    await api.post('/agents', data);
  },

  /**
   * 에이전트 수정
   */
  async updateAgent(id: number, data: UpdateAgentRequest): Promise<UpdateAgentResponse> {
    const response = await api.put<UpdateAgentResponse>(`/agents/${id}`, data);
    return response.data;
  },

  /**
   * 에이전트 삭제
   */
  async deleteAgent(id: number): Promise<void> {
    await api.delete(`/agents/${id}`);
  },
};
