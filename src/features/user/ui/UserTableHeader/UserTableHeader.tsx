/**
 작성자: 김슬기
 */
export const UserTableHeader = () => {
  return (
    <thead className="bg-border-light">
      <tr>
        <th className="p-5 px-4 text-left align-middle w-[14%]">
          <span className="text-text-secondary font-medium text-sm">Name</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[12%]">
          <span className="text-text-secondary font-medium text-sm">Position</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[16%]">
          <span className="text-text-secondary font-medium text-sm">Company</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[13%]">
          <span className="text-text-secondary font-medium text-sm">Mobile</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[13%]">
          <span className="text-text-secondary font-medium text-sm">Office Phone</span>
        </th>

        <th className="p-2.5 text-left align-middle w-[20%]">
          <span className="text-text-secondary font-medium text-sm">Email</span>
        </th>

        <th className="p-2.5 text-center align-middle w-[12%]">
          <span className="text-text-secondary font-medium text-sm">Operation</span>
        </th>
      </tr>
    </thead>
  );
};
