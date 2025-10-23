import { useState } from 'react';

interface AddAgentModalProps {
  onClose: () => void;
  onAddAgent: (agent: {
    agentName: string;
    apiEndpoint: string;
    authToken: string;
    description: string;
  }) => void;
}

export const AddAgentModal = ({ onClose, onAddAgent }: AddAgentModalProps) => {
  const [formData, setFormData] = useState({
    agentName: '',
    apiEndpoint: '',
    authToken: '',
    connectionTest: '',
    description: '',
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');

  const handleTest = () => {
    setTestStatus('testing');
    // 실제로는 API 호출
    setTimeout(() => {
      setTestStatus(Math.random() > 0.5 ? 'success' : 'fail');
    }, 1000);
  };

  const handleSubmit = () => {
    if (!formData.agentName || !formData.apiEndpoint || !formData.authToken) {
      alert('Please fill in all required fields');
      return;
    }

    onAddAgent({
      agentName: formData.agentName,
      apiEndpoint: formData.apiEndpoint,
      authToken: formData.authToken,
      description: formData.description,
    });

    onClose();
  };

  return (
    <div className="bg-white rounded-lg px-5 flex flex-col items-start w-[460px]">
      <div className="flex flex-col gap-0 items-start self-stretch">
        {/* Header */}
        <div className="border-b border-[#EBEBF1] self-stretch h-[60px] flex items-center overflow-hidden">
          <h2 className="text-[#767676] font-semibold text-xl ml-2.5 mt-[25px]">Add Agent</h2>
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
              placeholder="Enter auth token"
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
                className="bg-[#EBEBF1] rounded-lg self-stretch h-20 px-3 py-2 text-sm outline-none resize-none"
                placeholder="Add notes about this agent..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="border-t border-[#EBEBF1] pt-5 pb-3 flex gap-[11px] justify-end self-stretch h-[70px]">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#EBEBF1] px-4 py-2.5"
            >
              <span className="text-[#767676] font-semibold text-xs">Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-lg border border-[#EBEBF1] px-4 py-2.5"
            >
              <span className="text-[#505050] font-semibold text-xs">Register Agent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
