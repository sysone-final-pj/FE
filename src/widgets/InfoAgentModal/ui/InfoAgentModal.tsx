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
        <div className="border-b border-[#EBEBF1] self-stretch h-[60px] flex items-center overflow-hidden">
          <h2 className="text-[#767676] font-semibold text-xl ml-2.5 mt-[25px]">
            Agent Information
          </h2>
        </div>

        {/* Content */}
        <div className="py-2.5 flex flex-col gap-3 items-start self-stretch">
          {/* Agent Name */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 flex items-center w-[130px]">
              <span className="text-[#767676] font-medium text-sm">Agent Name</span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg w-[260px] h-[35px] px-3 flex items-center">
              <span className="text-[#505050] text-sm">{agent.agentName}</span>
            </div>
          </div>

          {/* API Endpoint */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 flex items-center w-[130px]">
              <span className="text-[#767676] font-medium text-sm">API Endpoint</span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg w-[260px] h-[35px] px-3 flex items-center">
              <span className="text-[#505050] text-sm">{agent.apiEndpoint}</span>
            </div>
          </div>

          {/* Auth Token / API Key */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="pt-1.5 px-2.5 pb-1.5 flex items-center w-[130px]">
              <span className="text-[#767676] font-medium text-sm">
                Auth Token
                <br />
                /API Key
              </span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg w-[260px] h-[35px] px-3 flex items-center">
              <span className="text-[#505050] text-sm">
                {agent.authToken ? '••••••••••••' : 'Not set'}
              </span>
            </div>
          </div>

          {/* Connection Test */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 flex items-center w-[130px]">
              <span className="text-[#767676] font-medium text-sm">Connection Test</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#EBEBF1] rounded-lg w-[180px] h-[35px] px-3 flex items-center">
                <span className="text-sm text-[#505050]">
                  {agent.connectionStatus === 'Success'
                    ? '✓ Connection successful'
                    : '✗ Connection failed'}
                </span>
              </div>
              <button className="bg-white rounded-lg border border-[#EAECF0] px-[5px] flex items-center justify-center w-[71px] h-[35px]">
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
              <div className="bg-[#EBEBF1] rounded-lg self-stretch min-h-20 px-3 py-2">
                <p className="text-sm text-[#505050]">{agent.description}</p>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="border-t border-[#EBEBF1] pt-5 pb-3 flex justify-end self-stretch h-[70px]">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#EBEBF1] px-4 py-2.5"
            >
              <span className="text-[#767676] font-semibold text-xs">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};