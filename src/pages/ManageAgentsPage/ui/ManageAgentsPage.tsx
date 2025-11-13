import { useState, useEffect } from 'react';
import { AgentTable } from '@/widgets/AgentTable';
import { AddAgentModal } from '@/widgets/AddAgentModal';
import { InfoAgentModal } from '@/widgets/InfoAgentModal/ui/InfoAgentModal';
import { EditAgentModal } from '@/widgets/EditAgentModal/ui/EditAgentModal';
import type { Agent } from '@/entities/agent/model/types';
import { agentApi } from '@/shared/api/agent';
import type { AgentListItem, AgentStatus } from '@/shared/api/agent';

type ModalType = 'add' | 'info' | 'edit' | null;

// API 타입을 프론트엔드 타입으로 변환
const mapAgentStatus = (status: AgentStatus): 'ON' | 'OFF' => {
  return status === 'REGISTERED' ? 'ON' : 'OFF';
};

export const ManageAgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // 에이전트 목록 조회
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await agentApi.getAgents();
        const mappedAgents: Agent[] = response.data.map((agent: AgentListItem) => ({
          id: String(agent.id),
          agentName: agent.agentName,
          active: mapAgentStatus(agent.agentStatus),
          hashcode: agent.agentKey || '', // 백엔드에서 agentKey를 제공하면 사용, 없으면 빈 문자열
          description: agent.description,
          created: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).replace(/\. /g, '.').replace('.', ''),
        }));
        setAgents(mappedAgents);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };

    fetchAgents();
  }, []);

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
      // 목록 새로고침
      const response = await agentApi.getAgents();
      const mappedAgents: Agent[] = response.data.map((agent: AgentListItem) => ({
        id: String(agent.id),
        agentName: agent.agentName,
        active: mapAgentStatus(agent.agentStatus),
        hashcode: agent.agentKey || '', // 백엔드에서 agentKey를 제공하면 사용, 없으면 빈 문자열
        description: agent.description,
        created: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).replace(/\. /g, '.').replace('.', ''),
      }));
      setAgents(mappedAgents);
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
      // 목록 새로고침
      const response = await agentApi.getAgents();
      const mappedAgents: Agent[] = response.data.map((agent: AgentListItem) => ({
        id: String(agent.id),
        agentName: agent.agentName,
        active: mapAgentStatus(agent.agentStatus),
        hashcode: agent.agentKey || '', // 백엔드에서 agentKey를 제공하면 사용, 없으면 빈 문자열
        description: agent.description,
        created: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).replace(/\. /g, '.').replace('.', ''),
      }));
      setAgents(mappedAgents);
    } catch (error) {
      console.error('Failed to edit agent:', error);
    }
  };

  const handleInfoClick = async (agent: Agent) => {
    try {
      // 상세 정보 조회
      const response = await agentApi.getAgent(Number(agent.id));
      const detailedAgent: Agent = {
        id: String(response.data.id),
        agentName: response.data.agentName,
        active: mapAgentStatus(response.data.agentStatus),
        hashcode: response.data.agentKey,
        description: response.data.description,
        created: agent.created,
      };
      setSelectedAgent(detailedAgent);
      setModalType('info');
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
    }
  };

  const handleEditClick = async (agent: Agent) => {
    try {
      // 상세 정보 조회
      const response = await agentApi.getAgent(Number(agent.id));
      const detailedAgent: Agent = {
        id: String(response.data.id),
        agentName: response.data.agentName,
        active: mapAgentStatus(response.data.agentStatus),
        hashcode: response.data.agentKey,
        description: response.data.description,
        created: agent.created,
      };
      setSelectedAgent(detailedAgent);
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
        <h1 className="text-[#000000] font-semibold text-xl">Agents</h1>

        {/* Agent Table */}
        <div className="px-8 pb-10">
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