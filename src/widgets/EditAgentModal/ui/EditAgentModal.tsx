import { useState } from 'react';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import type { Agent } from '@/entities/agent/model/types';

interface EditAgentModalProps {
  agent: Agent;
  onClose: () => void;
  onEditAgent: (id: string, updatedAgent: {
    agentName: string;
    hashcode: string,
    description: string;
  }) => void;
}

export const EditAgentModal = ({ agent, onClose, onEditAgent }: EditAgentModalProps) => {
  const [formData, setFormData] = useState({
    agentName: agent.agentName,
    hashcode: agent.hashcode,
    description: agent.description,
  });

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
    type: 'confirm' as ConfirmModalType,
    onConfirm: undefined as (() => void) | undefined
  });

  const submitAgent = () => {
    onEditAgent(agent.id, {
      agentName: formData.agentName,
      hashcode: formData.hashcode,
      description: formData.description,
    });
    onClose();
  };

  const handleSubmit = () => {
    // 1. 필수 필드 검증 (agentName)
    if (!formData.agentName) {
      setConfirmModalState({
        isOpen: true,
        ...MODAL_MESSAGES.AGENT.REQUIRED_FIELDS,
        onConfirm: undefined
      });
      return;
    }

    submitAgent();
  };

  return (
    <>
      <div className="bg-white rounded-lg px-5 flex flex-col items-start w-[460px]">
        <div className="flex flex-col gap-0 items-start self-stretch">
          {/* Header */}
          <div className="border-b border-border-light self-stretch h-[60px] flex items-center overflow-hidden">
            <h2 className="text-text-secondary font-semibold text-xl ml-2.5 mt-[25px]">
              Edit Agent
            </h2>
          </div>

          {/* Form */}
          <div className="py-2.5 flex flex-col gap-3 items-start self-stretch">
            {/* Agent Name */}
            <div className="px-2.5 flex items-center gap-2.5 self-stretch">
              <div className="p-2.5 flex items-center w-[130px]">
                <span className="text-text-secondary font-medium text-sm">Agent Name</span>
              </div>
              <input
                type="text"
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                className="bg-[#F8F8FA] rounded-lg w-[260px] h-[35px] px-3 text-sm outline-none"
                placeholder="Enter agent name"
              />
            </div>
            
            {/* Hashcode */}
            <div className="px-2.5 flex flex-col gap-2.5 self-stretch">
              <div className="flex flex-col gap-0 self-stretch">
                <div className="p-2.5 flex items-center w-[130px]">
                  <span className="text-text-secondary font-medium text-sm">Hashcode</span>
                </div>
                <textarea
                  value={formData.hashcode}
                  onChange={(e) => setFormData({ ...formData, hashcode: e.target.value })}
                  className="bg-[#F8F8FA] rounded-lg h-20 px-3 py-2 text-sm outline-none resize-none"
                  readOnly
                />
              </div>
            </div>

            {/* Description */}
            <div className="px-2.5 flex flex-col gap-2.5 self-stretch">
              <div className="flex flex-col gap-0 self-stretch">
                <div className="p-2.5 flex items-center w-[130px]">
                  <span className="text-text-secondary font-medium text-sm">Description</span>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#F8F8FA] rounded-lg h-20 px-3 py-2 text-sm outline-none resize-none"
                  placeholder="Enter description"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-[#D1D5DC] py-5 flex items-center justify-end gap-2.5 self-stretch">
            <button
              onClick={onClose}
              className="bg-[#F3F4F6] rounded-lg px-4 py-2 flex items-center justify-center h-[42px]"
            >
              <span className="text-text-secondary font-semibold text-sm">Close</span>
            </button>
            <button
              onClick={handleSubmit}
              className="bg-[#0492F4] rounded-lg px-4 py-2 flex items-center justify-center h-[42px]"
            >
              <span className="text-white font-semibold text-sm">Save Changes</span>
            </button>
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