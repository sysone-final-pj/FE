import { useState, useEffect } from 'react';
import { UserTable } from '@/widgets/UserTable/ui/UserTable';
import { mockUsers } from '@/shared/mocks/usersData';
import { AddUserModal } from '@/features/user/ui/AddUserModal/AddUserModal';
import { InfoUserModal } from '@/features/user/ui/InfoUserModal/InfoUserModal';
import { EditUserModal } from '@/features/user/ui/EditUserModal/EditUserModal';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import type { User } from '@/entities/user/model/types';
import { userApi } from '@/shared/api/user';
import { parseApiError } from '@/shared/lib/errors/parseApiError';

export const ManageUsersPage = () => {
  // 사용자 목록 및 선택된 사용자
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 삭제 확인 모달 상태
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    userId: '',
  });

  // 결과 모달 (성공/실패)
  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
  });

  // 사용자 목록 로드
  useEffect(() => {
    loadUsers();
  }, []);

const loadUsers = async () => {
  try {
    const response = await userApi.getUsers();
    setUsers(response.data); 
  } catch (error) {
    setUsers(mockUsers);
  }
};

  /** 사용자 추가 */
  const handleAddUser = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  /** 사용자 정보 보기 */
  const handleUserInfo = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setIsInfoModalOpen(true);
    }
  };
  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
    setSelectedUser(null);
  };

  /** 사용자 수정 */
  const handleUserEdit = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setIsEditModalOpen(true);
    }
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  /** 사용자 삭제 */
  const handleUserDelete = (id: string) => {
    setDeleteConfirmState({
      isOpen: true,
      userId: id,
    });
  };

  const confirmDelete = async () => {
    const { userId } = deleteConfirmState;
    setDeleteConfirmState({ isOpen: false, userId: '' });

    try {
      await userApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.USER.DELETE_SUCCESS.header,
        content: MODAL_MESSAGES.USER.DELETE_SUCCESS.content,
      });
    } catch (error) {
      const apiError = parseApiError(error, 'user');
      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.USER.DELETE_FAIL.header,
        content: apiError.message,
      });
    }
  };

  /** Modal Submit 핸들러 */
  const handleSubmitAddUser = () => {
    loadUsers();
    setIsAddModalOpen(false);
  };

  const handleSubmitEditUser = () => {
    loadUsers();
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-screen-2xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-semibold text-black mb-8">Users</h1>

        <UserTable
          users={users}
          onAddUser={handleAddUser}
          onUserInfo={handleUserInfo}
          onUserEdit={handleUserEdit}
          onUserDelete={handleUserDelete}
        />
      </main>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitAddUser}
      />

      {/* Info User Modal */}
      <InfoUserModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
        user={selectedUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={selectedUser}
        onSubmit={handleSubmitEditUser}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() =>
          setDeleteConfirmState({ isOpen: false, userId: '' })
        }
        onConfirm={confirmDelete}
        {...MODAL_MESSAGES.USER.DELETE_CONFIRM}
      />

      {/* Result Modal (Success/Error) */}
      <ConfirmModal
        isOpen={resultModalState.isOpen}
        onClose={() =>
          setResultModalState({
            isOpen: false,
            header: '',
            content: '',
          })
        }
        header={resultModalState.header}
        content={resultModalState.content}
        type="confirm"
      />
    </div>
  );
};
