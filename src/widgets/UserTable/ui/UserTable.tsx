import { SearchInput } from '@/shared/ui/SearchInput/SearchInput';
import { Icon } from '@/shared/ui/UiIcon/UiIcon';
import { UserTableHeader } from '@/features/user/ui/UserTableHeader/UserTableHeader';
import { UserRow } from '@/entities/user/ui/UserRow/UserRow';
import type { User } from '@/entities/user/model/types';

interface UserTableProps {
  users: User[];
  onSearch?: (query: string) => void;
  onAddUser?: () => void;
  onUserInfo?: (userId: string) => void;
  onUserEdit?: (userId: string) => void;
  onUserDelete?: (userId: string) => void;
}

export const UserTable = ({
  users,
  onSearch,
  onAddUser,
  onUserInfo,
  onUserEdit,
  onUserDelete,
}: UserTableProps) => {
  const tableColumns = [
    { key: 'name', label: 'Name', width: '120px', align: 'left' },
    { key: 'position', label: 'Position', width: '150px', align: 'left' },
    { key: 'company', label: 'Company', width: '200px', align: 'left' },
    { key: 'mobile', label: 'Mobile', width: '150px', align: 'left' },
    { key: 'officePhone', label: 'Office phone', width: '150px', align: 'left' },
    { key: 'email', label: 'Email', width: '250px', align: 'left' },
    { key: 'operation', label: 'Operation', width: 'auto', align: 'right' },
  ] as const;

  return (
    <div className="w-full">
      {/* Search & Add User */}
      <div className="flex items-center justify-end gap-3 mb-4">
        <SearchInput placeholder="Search..." onChange={onSearch} />
        <button
          onClick={onAddUser}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Icon name="plus" size={16} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <UserTableHeader columns={tableColumns} />

        {Array.isArray(users) && users.length > 0 ? (
          users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onInfo={onUserInfo}
              onEdit={onUserEdit}
              onDelete={onUserDelete}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-6">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
};
