import { useState, useEffect, useCallback, useMemo } from 'react';
import { AgentTable } from '@/widgets/AgentTable';
import { AddAgentModal } from '@/widgets/AddAgentModal';
import { InfoAgentModal } from '@/widgets/InfoAgentModal/ui/InfoAgentModal';
import { EditAgentModal } from '@/widgets/EditAgentModal/ui/EditAgentModal';
import type { Agent, ConnectionStatus } from '@/entities/agent/model/types';
import { agentApi } from '@/shared/api/agent';
import type { AgentListItem, AgentStatus } from '@/shared/api/agent';
import { format } from 'date-fns';
import { useAgentWebSocket } from '@/features/agent/hooks/useAgentWebSocket';
import { useAgentStore } from '@/shared/stores/useAgentStore';
import { getCurrentUser } from '@/shared/lib/jwtUtils';


type ModalType = 'add' | 'info' | 'edit' | null;

// API 타입을 프론트엔드 타입으로 변환
const mapAgentStatus = (status: AgentStatus): ConnectionStatus => {
  // AgentStatus를 ConnectionStatus로 직접 매핑
  return status as ConnectionStatus;
};

  const mapAgent = (agent: AgentListItem): Agent => ({
  id: String(agent.id),
  agentName: agent.agentName,
  active: mapAgentStatus(agent.agentStatus),
  hashcode: agent.agentKey || '',
  description: agent.description,
  createdAt: agent.createdAt
    ? format(new Date(agent.createdAt), 'yyyy.MM.dd HH:mm')
    : '-',
});

export const ManageAgentsPage = () => {
  // 현재 사용자 role 가져오기
  const currentUser = getCurrentUser();
  const currentUserRole = currentUser?.role;

  // REST API로 로드한 에이전트 (기본 정보)
  const [restAgents, setRestAgents] = useState<Agent[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // WebSocket 연결 및 실시간 상태 업데이트
  const { isConnected, agents: wsAgents } = useAgentWebSocket();
  const setAgentsInStore = useAgentStore((state) => state.setAgents);

  // REST API로 에이전트 목록 로드
  const loadAgents = useCallback(async () => {
    const response = await agentApi.getAgents();
    // createdAt 기준 최신순 정렬 (최근 데이터가 위로)
    const sortedAgents = response.data.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // 내림차순
    });
    const mappedAgents = sortedAgents.map(mapAgent);
    setRestAgents(mappedAgents);

    // Store에도 초기 데이터 설정 (WebSocket 상태 업데이트 준비)
    // REST API는 상세 정보를 가지고 있지만, 실시간 상태는 WebSocket에서 업데이트됨
    const wsFormat = sortedAgents.map((agent) => ({
      agentId: agent.id,
      agentKey: agent.agentKey,
      agentName: agent.agentName,
      currentStatus: mapAgentStatus(agent.agentStatus),
      status: mapAgentStatus(agent.agentStatus),
      description: agent.description,
      createdAt: agent.createdAt,
    }));
    setAgentsInStore(wsFormat);
  }, [setAgentsInStore]);

  // 초기 에이전트 목록 조회
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  /**
   * REST API 데이터 + WebSocket 실시간 상태 병합
   * - REST API: 전체 상세 정보 (agentName, hashcode, description, createdAt 등)
   * - WebSocket: 실시간 상태 업데이트 (status: ON/OFF)
   * - 병합 전략: REST 기본 데이터 + WebSocket 상태로 최신화
   */
  const displayAgents = useMemo(() => {
    if (wsAgents.length === 0) {
      // WebSocket 데이터가 없으면 REST API 데이터만 표시
      return restAgents;
    }

    // REST API 데이터를 기반으로 WebSocket 상태 업데이트 병합
    return restAgents.map((restAgent) => {
      const wsAgent = wsAgents.find((ws) => ws.agentId === Number(restAgent.id));
      if (wsAgent) {
        // WebSocket에서 실시간 상태 업데이트가 있으면 병합
        // currentStatus 또는 status 사용, 없으면 기존 값 유지
        const updatedStatus = wsAgent.currentStatus || wsAgent.status || restAgent.active;
        return {
          ...restAgent,
          active: updatedStatus, // 실시간 상태로 업데이트
        };
      }
      return restAgent;
    });
  }, [restAgents, wsAgents]);

  // ============================================
  // 🐛 디버깅: WebSocket 연결 및 데이터 변경 추적
  // ============================================
  useEffect(() => {
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // console.log('[ManageAgentsPage] 🔌 WebSocket Connection Status:', isConnected ? 'CONNECTED' : '❌ DISCONNECTED');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [isConnected]);

  useEffect(() => {
    if (wsAgents.length > 0) {
      // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      // console.log('[ManageAgentsPage] 📊 WebSocket Agents Updated:');
      // console.log(`Total agents from WebSocket: ${wsAgents.length}`);
      // console.table(
      //   wsAgents.map((agent) => ({
      //     ID: agent.agentId,
      //     Name: agent.agentName || 'N/A',
      //     Status: agent.status,
      //     Key: agent.agentKey || 'N/A',
      //   }))
      // );
      // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }, [wsAgents]);

  useEffect(() => {
    if (displayAgents.length > 0) {
      // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      // console.log('[ManageAgentsPage] 🎨 Display Agents (REST + WebSocket merged):');
      // console.log(`Total display agents: ${displayAgents.length}`);
      // console.table(
      //   displayAgents.map((agent) => ({
      //     ID: agent.id,
      //     Name: agent.agentName,
      //     Status: agent.active,
      //     Hashcode: agent.hashcode,
      //     Description: agent.description?.substring(0, 30) || '',
      //     CreatedAt: agent.createdAt,
      //   }))
      // );
      // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  }, [displayAgents]);

  const handleAddAgent = async (newAgent: {
    agentName: string;
    hashcode: string;
    description: string;
  }) => {
    try {
      await agentApi.createAgent({
      agentName: newAgent.agentName,
      agentStatus: 'REGISTERED',
      description: newAgent.description,
    });
    await loadAgents();
    } catch (error) {
      console.error('Failed to add agent:', error);
    }
  };

  const handleEditAgent = async (
    id: string,
    updatedAgent: {
      agentName: string;  
      hashcode: string;
      description: string;
    }
  ) => {
    try {
     await agentApi.updateAgent(Number(id), {
      agentName: updatedAgent.agentName,
      description: updatedAgent.description,
    });
    await loadAgents();
    } catch (error) {
      console.error('Failed to edit agent:', error);
    }
  };

  const loadAgentDetail = async (id: string) => {
    const response = await agentApi.getAgent(Number(id));
    return mapAgent(response.data);
  };

  const handleInfoClick = async (agent: Agent) => {
    try {
      // 상세 정보 조회
      const detail = await loadAgentDetail(agent.id);
    setSelectedAgent(detail);
    setModalType('info');
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
    }
  };

  const handleEditClick = async (agent: Agent) => {
    try {
      const detail = await loadAgentDetail(agent.id);
    setSelectedAgent(detail);
    setModalType('edit');
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedAgent(null);
  };

  return (
    <div>
      {/* Page Title */}
      <div className="py-8 px-[132px]">
        <h1 className="text-[#000000] font-semibold text-xl pl-2">Agents</h1>

        {/* Agent Table */}
        <div className="pb-10">
          <AgentTable
            agents={displayAgents}
            onAddAgent={() => setModalType('add')}
            onInfoClick={handleInfoClick}
            onEditClick={handleEditClick}
            currentUserRole={currentUserRole}
          />
        </div>
      </div>

      {/* Modals */}
      {modalType === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AddAgentModal onClose={handleCloseModal} onAddAgent={handleAddAgent} />
        </div>
      )}

      {modalType === 'info' && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <InfoAgentModal agent={selectedAgent} onClose={handleCloseModal} />
        </div>
      )}

      {modalType === 'edit' && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <EditAgentModal
            agent={selectedAgent}
            onClose={handleCloseModal}
            onEditAgent={handleEditAgent}
          />
        </div>
      )}
    </div>
  );
};