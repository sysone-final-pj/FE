import { useState } from 'react';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';

interface AddAgentModalProps {
  onClose: () => void;
  onAddAgent: (agent: {
    agentName: string;
    hashcode: string;
    description: string;
  }) => void;
}

export const AddAgentModal = ({ onClose, onAddAgent }: AddAgentModalProps) => {
  const [formData, setFormData] = useState({
    agentName: '',
    hashcode: '',
    description: '',
  });


  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
    type: 'confirm' as ConfirmModalType,
    onConfirm: undefined as (() => void) | undefined
  });

  const submitAgent = () => {
    onAddAgent({
      agentName: formData.agentName,
      hashcode: formData.hashcode,
      description: formData.description,
    });
    onClose();
  };

  const handleSubmit = () => {
    // 1. 필수 필드 검증 (agentName)
    if (!formData.agentName ) {
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
          <div className="flex items-center justify-between py-6 self-stretch">
            <span className="text-[#505050] font-pretendard font-semibold text-lgP">Add Agent</span>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="#767676" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Form Fields */}
          <div className="border-t border-[#D1D5DC] py-5 flex flex-col gap-2.5 self-stretch">
            {/* Agent Name */}
            <div className="px-2.5 flex items-center gap-2.5 self-stretch">
              <div className="p-2.5 flex items-center w-[130px]">
                <span className="text-[#767676] font-medium text-sm">Agent Name</span>
              </div>
              <input
                type="text"
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                className="bg-[#F8F8FA] rounded-lg w-[260px] h-[35px] px-3 text-sm outline-none"
                placeholder="My Agent"
              />
            </div>

            {/* Description */}
            <div className="px-2.5 flex flex-col gap-2.5 self-stretch">
              <div className="flex flex-col gap-0 self-stretch">
                <div className="p-2.5 flex items-center w-[130px]">
                  <span className="text-[#767676] font-medium text-sm">Description</span>
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
              <span className="text-[#767676] font-semibold text-sm">Close</span>
            </button>
            <button
              onClick={handleSubmit}
              className="bg-[#0492F4] rounded-lg px-4 py-2 flex items-center justify-center h-[42px]"
            >
              <span className="text-white font-semibold text-sm">Add Agent</span>
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