export const AgentTableHeader = () => {
  return (
    <div className="bg-[#EBEBF1] rounded-lg py-2.5 px-4 flex items-center">
      <div className="p-2.5 flex items-center w-[246px]">
        <span className="text-[#767676] font-medium text-sm">Agent Name</span>
      </div>

      <div className="p-2.5 flex items-center w-[100px]">
        <span className="text-[#767676] font-medium text-sm">Is Active</span>
      </div>

      <div className="p-2.5 flex items-center w-[400px]">
        <span className="text-[#767676] font-medium text-sm">Hashcode</span>
      </div>

      <div className="p-2.5 flex items-center w-[540px]">
        <span className="text-[#767676] font-medium text-sm">Description</span>
      </div>

      <div className="p-2.5 flex items-center justify-center w-[150px]">
        <span className="text-[#767676] font-medium text-sm">Created</span>
      </div>

      <div className="p-2.5 flex items-center justify-center w-[307px]">
        <span className="text-[#767676] font-medium text-sm">Operation</span>
      </div>
    </div>
  );
};
