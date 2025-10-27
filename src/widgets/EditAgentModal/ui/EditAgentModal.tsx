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
    apiEndpoint: string;
    authToken: string;
    description: string;
  }) => void;
}

export const EditAgentModal = ({ agent, onClose, onEditAgent }: EditAgentModalProps) => {
  const [formData, setFormData] = useState({
    agentName: agent.agentName,
    apiEndpoint: agent.apiEndpoint,
    authToken: agent.authToken || '',
    description: agent.description,
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
    type: 'confirm' as ConfirmModalType,
    onConfirm: undefined as (() => void) | undefined
  });

  const handleTest = () => {
    setTestStatus('testing');
    // TODO: API 호출하여 연결 테스트 기능 구현
    setTimeout(() => {
      setTestStatus(Math.random() > 0.5 ? 'success' : 'fail');
    }, 1000);
  };

  const submitAgent = () => {
    onEditAgent(agent.id, {
      agentName: formData.agentName,
      apiEndpoint: formData.apiEndpoint,
      authToken: formData.authToken,
      description: formData.description,
    });
    onClose();
  };

  const handleSubmit = () => {
    // 1. 필수 필드 검증 (agentName, apiEndpoint만)
    if (!formData.agentName || !formData.apiEndpoint) {
      setConfirmModalState({
        isOpen: true,
        ...MODAL_MESSAGES.AGENT.REQUIRED_FIELDS,
        onConfirm: undefined
      });
      return;
    }

    // 2. authToken 미입력 시 확인 (취소/완료)
    if (!formData.authToken) {
      setConfirmModalState({
        isOpen: true,
        ...MODAL_MESSAGES.AGENT.TOKEN_CONFIRM,
        onConfirm: () => submitAgent()
      });
      return;
    }

    // 3. 정상 진행
    submitAgent();
  };

  return (
    <>
      <div className="bg-white rounded-lg px-5 flex flex-col items-start w-[460px]">
        <div className="flex flex-col gap-0 items-start self-stretch">
          {/* Header */}
          <div className="border-b border-[#EBEBF1] self-stretch h-[60px] flex items-center overflow-hidden">
            <h2 className="text-[#767676] font-semibold text-xl ml-2.5 mt-[25px]">
              Edit Agent
            </h2>
          </div>

          {/* Form */}
          <div className="py-2.5 flex flex-col gap-3 items-start self-stretch">
            {/* Agent Name */}
            <div className="px-2.5 flex items-center gap-2.5 self-stretch">
              <div className="p-2.5 flex items-center w-[130px]">
                <span className="text-[#767676] font-medium text-sm">Agent Name</span>
              </div>
              <input
                type="text"
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                className="bg-[#EBEBF1] rounded-lg w-[260px] h-[35px] px-3 text-sm outline-none"
                placeholder="Enter agent name"
              />
            </div>

            {/* API Endpoint */}
            <div className="px-2.5 flex items-center gap-2.5 self-stretch">
              <div className="p-2.5 flex items-center w-[130px]">
                <span className="text-[#767676] font-medium text-sm">API Endpoint</span>
              </div>
              <input
                type="text"
                value={formData.apiEndpoint}
                onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                className="bg-[#EBEBF1] rounded-lg w-[260px] h-[35px] px-3 text-sm outline-none"
                placeholder="http://example.com:8080"
              />
            </div>

            {/* Auth Token / API Key */}
            <div className="px-2.5 flex items-center gap-2.5 self-stretch">
              <div className="pt-1.5 px-2.5 pb-1.5 flex items-center w-[130px]">
                <span className="text-[#767676] font-medium text-sm">
                  Auth Token<br />/API Key
                </span>
              </div>
              <input
                type="password"
                value={formData.authToken}
                onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                className="bg-[#EBEBF1] rounded-lg w-[260px] h-[35px] px-3 text-sm outline-none"
                placeholder="Enter auth token (optional)"
              />
            </div>

            {/* Connection Test */}
            <div className="px-2.5 flex items-center gap-2.5 self-stretch">
              <div className="p-2.5 flex items-center w-[130px]">
                <span className="text-[#767676] font-medium text-sm">Connection Test</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#EBEBF1] rounded-lg w-[180px] h-[35px] px-3 flex items-center">
                  <span className="text-sm text-[#505050]">
                    {testStatus === 'idle' && 'Not tested'}
                    {testStatus === 'testing' && 'Testing...'}
                    {testStatus === 'success' && '✓ Connection successful'}
                    {testStatus === 'fail' && '✗ Connection failed'}
                  </span>
                </div>
                <button
                  onClick={handleTest}
                  disabled={testStatus === 'testing'}
                  className="bg-white rounded-lg border border-[#EAECF0] px-[5px] flex items-center justify-center w-[71px] h-[35px]"
                >
                  <span className="text-[#767676] font-semibold text-xs">Test</span>
                </button>
              </div>
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
                  className="bg-[#EBEBF1] rounded-lg h-20 px-3 py-2 text-sm outline-none resize-none"
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