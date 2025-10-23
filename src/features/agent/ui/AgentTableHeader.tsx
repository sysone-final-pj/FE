export const AgentTableHeader = () => {
  return (
    <div className="bg-[#E8E8E8] rounded-lg py-2.5 px-4 flex items-center">
      <div className="p-2.5 flex items-center w-[246px]">
        <span className="text-[#767676] font-medium text-sm">Agent Name</span>
      </div>

      <div className="p-2.5 flex items-center w-[230px]">
        <span className="text-[#767676] font-medium text-sm">API Endpoint</span>
      </div>

      <div className="p-2.5 flex items-center w-[130px]">
        <span className="text-[#767676] font-medium text-sm">Connection Test</span>
      </div>

      <div className="p-2.5 flex items-center w-[650px]">
        <span className="text-[#767676] font-medium text-sm">Description</span>
      </div>

      <div className="p-2.5 flex items-center justify-center w-[150px]">
        <span className="text-[#767676] font-medium text-sm">Created</span>
      </div>

      <div className="p-2.5 flex items-center justify-center w-[353px]">
        <span className="text-[#767676] font-medium text-sm">Operation</span>
      </div>
    </div>
  );
};
