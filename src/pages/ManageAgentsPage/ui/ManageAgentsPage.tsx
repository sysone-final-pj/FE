import { useState } from 'react';
import { AgentTable } from '@/widgets/AgentTable';
import { AddAgentModal } from '@/widgets/AddAgentModal';
import { agentsData } from '@/shared/mocks/agentsData';

export const AgentsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddAgent = (agent: {
    agentName: string;
    apiEndpoint: string;
    authToken: string;
    description: string;
  }) => {
    // TODO: API 호출하여 에이전트 추가 기능 구현
    // - POST /api/agents
    // - agent 객체를 서버로 전송
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
            agents={agentsData}
            onAddAgent={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AddAgentModal
            onClose={() => setIsAddModalOpen(false)}
            onAddAgent={handleAddAgent}
          />
        </div>
      )}
    </div>
  );
};