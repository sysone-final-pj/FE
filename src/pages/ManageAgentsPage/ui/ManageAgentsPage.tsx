import { useState, useEffect, useCallback } from 'react';
import { AgentTable } from '@/widgets/AgentTable';
import { AddAgentModal } from '@/widgets/AddAgentModal';
import { InfoAgentModal } from '@/widgets/InfoAgentModal/ui/InfoAgentModal';
import { EditAgentModal } from '@/widgets/EditAgentModal/ui/EditAgentModal';
import type { Agent } from '@/entities/agent/model/types';
import { agentApi } from '@/shared/api/agent';
import type { AgentListItem, AgentStatus } from '@/shared/api/agent';
import { format } from 'date-fns';


type ModalType = 'add' | 'info' | 'edit' | null;

// API 타입을 프론트엔드 타입으로 변환
const mapAgentStatus = (status: AgentStatus): 'ON' | 'OFF' => {
  return status === 'REGISTERED' ? 'ON' : 'OFF';
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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const loadAgents = useCallback(async () => {
    const response = await agentApi.getAgents();
    // createdAt 기준 최신순 정렬 (최근 데이터가 위로)
    const sortedAgents = response.data.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // 내림차순
    });
    setAgents(sortedAgents.map(mapAgent));
  }, []);



  // 에이전트 목록 조회
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

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
            agents={agents}
            onAddAgent={() => setModalType('add')}
            onInfoClick={handleInfoClick}
            onEditClick={handleEditClick}
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