/**
 작성자: 김슬기
 */
import type { Agent } from '@/entities/agent/model/types';

interface InfoAgentModalProps {
  agent: Agent;
  onClose: () => void;
}

export const InfoAgentModal = ({ agent, onClose }: InfoAgentModalProps) => {
  return (
    <div className="bg-white rounded-lg px-5 flex flex-col items-start w-[460px]">
      <div className="flex flex-col gap-0 items-start self-stretch">
        {/* Header */}
        <div className="border-b border-border-light self-stretch h-[60px] flex items-center overflow-hidden">
          <h2 className="text-text-secondary font-semibold text-xl ml-2.5 mt-[25px]">
            Agent Information
          </h2>
        </div>

        {/* Content */}
        <div className="py-2.5 flex flex-col gap-3 items-start self-stretch">
          {/* Agent Name */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 flex items-center w-[130px]">
              <span className="text-text-secondary font-medium text-sm">Agent Name</span>
            </div>
            <div className="bg-[#F8F8FA] rounded-lg w-[260px] h-[35px] px-3 flex items-center">
              <span className="text-text-primary text-sm">{agent.agentName}</span>
            </div>
          </div>

          {/* Active */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 flex items-center w-[130px]">
              <span className="text-text-secondary font-medium text-sm">Active</span>
            </div>
            <div className="bg-[#F8F8FA] rounded-lg w-[260px] h-[35px] px-3 flex items-center">
              <span className="text-text-primary text-sm">{agent.active}</span>
            </div>
          </div>

          {/* Hashcode */}
          <div className="px-2.5 flex flex-col gap-2.5 self-stretch">
            <div className="flex flex-col gap-0 self-stretch">
              <div className="p-2.5 flex items-center w-[130px]">
                <span className="text-text-secondary font-medium text-sm">Hashcode</span>
              </div>
              <div className="bg-[#F8F8FA] rounded-lg self-stretch min-h-20 px-3 py-2">
                <p className="text-sm text-text-primary">{agent.hashcode}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-2.5 flex flex-col gap-2.5 self-stretch">
            <div className="flex flex-col gap-0 self-stretch">
              <div className="p-2.5 flex items-center w-[130px]">
                <span className="text-text-secondary font-medium text-sm">Description</span>
              </div>
              <div className="bg-[#F8F8FA] rounded-lg self-stretch min-h-20 px-3 py-2">
                <p className="text-sm text-text-primary">{agent.description}</p>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="border-t border-border-light pt-5 pb-3 flex justify-end self-stretch h-[70px]">
            <button
              onClick={onClose}
              className="rounded-lg border border-border-light px-4 py-2.5"
            >
              <span className="text-text-secondary font-semibold text-xs">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};