export const AgentTableHeader = () => {
  return (
    <thead className="bg-[#EBEBF1] border-b-[20px] border-[#f7f7f7]">
      <tr className="py-2.5">
        <th className="p-2.5 px-4 text-left align-middle w-[14.12%]">
          <span className="text-[#767676] font-medium text-sm">Agent Name</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[5.74%]">
          <span className="text-[#767676] font-medium text-sm">Active</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[22.95%]">
          <span className="text-[#767676] font-medium text-sm">Hashcode</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[30.98%]">
          <span className="text-[#767676] font-medium text-sm">Description</span>
        </th>

        <th className="p-2.5 text-center align-middle w-[8.60%]">
          <span className="text-[#767676] font-medium text-sm">Created</span>
        </th>

        <th className="p-2.5 text-center align-middle w-[17.62%]">
          <span className="text-[#767676] font-medium text-sm">Operation</span>
        </th>
      </tr>
    </thead>
  );
};
