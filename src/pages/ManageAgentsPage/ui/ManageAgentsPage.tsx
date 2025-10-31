import { useState } from 'react';
import { AgentTable } from '@/widgets/AgentTable';
import { AddAgentModal } from '@/widgets/AddAgentModal';
import { InfoAgentModal } from '@/widgets/InfoAgentModal/ui/InfoAgentModal';
import { EditAgentModal } from '@/widgets/EditAgentModal/ui/EditAgentModal';
import { agentsData } from '@/shared/mocks/agentsData';
import type { Agent } from '@/entities/agent/model/types';

type ModalType = 'add' | 'info' | 'edit' | null;

export const ManageAgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>(agentsData);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAddAgent = (newAgent: {
    agentName: string;
    hashcode: string;
    description: string;
  }) => {
    // TODO: API 호출하여 에이전트 추가 기능 구현
    const agent: Agent = {
      id: String(agents.length + 1),
      ...newAgent,
      isActive: 'ON',
      created: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\. /g, '.').replace('.', ''),
    };
    setAgents([...agents, agent]);
  };

  const handleEditAgent = (
    id: string,
    updatedAgent: {
      agentName: string;
      hashcode: string;
      description: string;
    }
  ) => {
    // TODO: API 호출하여 에이전트 수정 기능 구현
    setAgents(
      agents.map((agent) =>
        agent.id === id ? { ...agent, ...updatedAgent } : agent
      )
    );
  };

  const handleInfoClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setModalType('info');
  };

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setModalType('edit');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedAgent(null);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Background */}
      <div className="bg-[#F7F7F7] min-h-[calc(100vh-80px)] pt-0">
        {/* Page Title */}
        <div className="py-8 px-10">
          <h1 className="text-[#000000] font-semibold text-xl">Agents</h1>
        </div>

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