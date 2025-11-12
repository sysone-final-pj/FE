import { useState, useEffect } from 'react';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import type { Agent } from '@/entities/agent/model/types';
import { AgentRow } from '@/entities/agent/ui/AgentRow';
import { AgentTableHeader } from '@/features/agent/ui/AgentTableHeader';
import { agentApi } from '@/shared/api/agent';

interface AgentTableProps {
  agents: Agent[];
  onAddAgent: () => void;
  onInfoClick: (agent: Agent) => void;
  onEditClick: (agent: Agent) => void;
  onAgentDeleted?: () => void;
}

export const AgentTable = ({
  agents: initialAgents,
  onAddAgent,
  onInfoClick,
  onEditClick,
  onAgentDeleted
}: AgentTableProps) => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [searchTerm, setSearchTerm] = useState('');

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
    type: 'confirm' as ConfirmModalType,
    onConfirm: undefined as (() => void) | undefined
  });

  // agents prop이 변경되면 로컬 state 업데이트
  useEffect(() => {
    setAgents(initialAgents);
  }, [initialAgents]);

  const handleInfo = (id: string) => {
    const agent = agents.find((a) => a.id === id);
    if (agent) {
      onInfoClick(agent);
    }
  };

  const handleEdit = (id: string) => {
    const agent = agents.find((a) => a.id === id);
    if (agent) {
      onEditClick(agent);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmModalState({
      isOpen: true,
      ...MODAL_MESSAGES.AGENT.DELETE_CONFIRM,
      onConfirm: async () => {
        try {
          await agentApi.deleteAgent(Number(id));
          setAgents((prev) => prev.filter((agent) => agent.id !== id));
          if (onAgentDeleted) {
            onAgentDeleted();
          }
        } catch (error) {
          console.error('Failed to delete agent:', error);
        }
      }
    });
  };

  const filteredAgents = agents.filter((agent) =>
    agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.active.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="w-full flex flex-col gap-5 items-center">
        {/* Search and Add Button */}
        <div className="flex items-center justify-end gap-3 w-[1775px]">
          <div className="bg-[#EBEBF1] rounded-xl px-4 py-2.5 flex items-center gap-1.5 w-[260px] shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.25)]">
            <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="none">
              <path
                d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
                stroke="#505050"
                strokeWidth="1.5"
              />
              <path d="M11.5 11.5L15 15" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-[#505050] font-medium text-xs opacity-60 outline-none w-full"
            />
          </div>

          <button
            onClick={onAddAgent}
            className="bg-white rounded-lg border border-transparent px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4.16667V15.8333M4.16667 10H15.8333"
                stroke="#0492f4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[#344054] font-medium text-sm">Add New Agent</span>
          </button>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-2 w-[1775px]">
          <AgentTableHeader />
          <div className="flex flex-col">
            {filteredAgents.map((agent) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                onInfo={handleInfo}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        header={confirmModalState.header}
        content={confirmModalState.content}
        type={confirmModalState.type}
      />
    </>
  );
};
