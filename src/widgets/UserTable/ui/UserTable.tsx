/**
 작성자: 김슬기
 */
import { useState, useEffect } from 'react';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import type { User } from '@/entities/user/model/types';
import { UserRow } from '@/entities/user/ui/UserRow/UserRow';
import { UserTableHeader } from '@/features/user/ui/UserTableHeader/UserTableHeader';
import { userApi } from '@/shared/api/user';

interface UserTableProps {
  users: User[];
  onAddUser: () => void;
  onInfoClick: (user: User) => void;
  onEditClick: (user: User) => void;
  onUserDeleted?: () => void;
}

export const UserTable = ({
  users: initialUsers,
  onAddUser,
  onInfoClick,
  onEditClick,
  onUserDeleted
}: UserTableProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
    type: 'confirm' as ConfirmModalType,
    onConfirm: undefined as (() => void) | undefined
  });

  // users prop이 변경되면 로컬 state 업데이트
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleInfo = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      onInfoClick(user);
    }
  };

  const handleEdit = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      onEditClick(user);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmModalState({
      isOpen: true,
      ...MODAL_MESSAGES.USER.DELETE_CONFIRM,
      onConfirm: async () => {
        try {
          await userApi.deleteUser(id);
          setUsers((prev) => prev.filter((user) => user.id !== id));
          if (onUserDeleted) {
            onUserDeleted();
          }
        } catch (error) {
          console.error('Failed to delete user:', error);
        }
      }
    });
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="w-full flex flex-col gap-5 items-center">
        {/* Search and Add Button */}
        <div className="flex items-center justify-end gap-3 w-full">
          <div className="bg-border-light rounded-xl px-4 py-2.5 flex items-center gap-1.5 w-[260px] shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.25)]">
            <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="none">
              <path
                d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
                stroke="#505050"
                strokeWidth="1.5"
              />
              <path d="M11.5 11.5L15 15" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-text-primary font-medium text-xs opacity-60 outline-none w-full"
            />
          </div>

          <button
            onClick={onAddUser}
            className="bg-white rounded-lg border border-transparent px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4.16667V15.8333M4.16667 10H15.8333"
                stroke="#0492f4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[#344054] font-medium text-sm">Add New User</span>
          </button>
        </div>
        {/* Table */}
        <div className="w-full overflow-x-auto rounded-12">
          <table className="w-full table-fixed border-collapse">
            <UserTableHeader />
            <tbody>
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onInfo={handleInfo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
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
