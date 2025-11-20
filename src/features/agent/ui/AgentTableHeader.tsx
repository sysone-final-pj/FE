export const AgentTableHeader = () => {
  return (
    <thead className="bg-border-light">
      <tr>
        <th className="p-5 px-4 text-left align-middle w-[14.12%]">
          <span className="text-text-secondary font-medium text-sm">Agent Name</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[5.74%]">
          <span className="text-text-secondary font-medium text-sm">Active</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[22.95%]">
          <span className="text-text-secondary font-medium text-sm">Hashcode</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[30.98%]">
          <span className="text-text-secondary font-medium text-sm">Description</span>
        </th>

        <th className="p-2.5 text-center align-middle w-[8.60%]">
          <span className="text-text-secondary font-medium text-sm">Created</span>
        </th>

        <th className="p-2.5 text-center align-middle w-[17.62%]">
          <span className="text-text-secondary font-medium text-sm">Operation</span>
        </th>
      </tr>
    </thead>
  );
};
