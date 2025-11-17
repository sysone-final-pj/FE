import { useState, useEffect, useCallback } from 'react';
import { UserTable } from '@/widgets/UserTable/ui/UserTable';
import { AddUserModal } from '@/widgets/AddUserModal';
import { InfoUserModal } from '@/widgets/InfoUserModal';
import { EditUserModal } from '@/widgets/EditUserModal';
import type { User } from '@/entities/user/model/types';
import { userApi } from '@/shared/api/user';

type ModalType = 'add' | 'info' | 'edit' | null;

// API 응답을 UI 타입으로 매핑
// 서버는 company, mobile, office 필드명을 사용할 수 있음
const mapUser = (apiUser: any): User => ({
  id: apiUser.id,
  username: apiUser.username,
  name: apiUser.name,
  companyName: apiUser.company || apiUser.companyName || '',
  position: apiUser.position || '',
  mobileNumber: apiUser.mobile || apiUser.mobileNumber || '',
  officePhone: apiUser.office || apiUser.officePhone || '',
  email: apiUser.email,
  note: apiUser.note || '',
});

export const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      console.log('Loading users...');
      const response = await userApi.getUsers();
      console.log('API Response:', response);

      // API 응답이 { statusCode, message, data } 형태인지 확인
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response);
        setUsers([]);
        return;
      }

      // 이름 기준 알파벳 순 정렬
      const sortedUsers = response.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      console.log('Sorted users:', sortedUsers);
      setUsers(sortedUsers.map(mapUser));
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  }, []);

  // 사용자 목록 조회
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddUser = async () => {
    try {
      await loadUsers();
    } catch (error) {
      console.error('Failed to reload users:', error);
    }
  };

  const handleEditUser = async () => {
    try {
      await loadUsers();
    } catch (error) {
      console.error('Failed to reload users:', error);
    }
  };

  const loadUserDetail = async (id: number) => {
    const response = await userApi.getUser(id);
    return mapUser(response);
  };

  const handleInfoClick = async (user: User) => {
    try {
      // 상세 정보 조회
      const detail = await loadUserDetail(user.id!);
      setSelectedUser(detail);
      setModalType('info');
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const handleEditClick = async (user: User) => {
    try {
      const detail = await loadUserDetail(user.id!);
      setSelectedUser(detail);
      setModalType('edit');
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  return (
    <div>
      {/* Page Title */}
      <div className="py-8 px-[132px]">
        <h1 className="text-[#000000] font-semibold text-xl pl-2">Users</h1>

        {/* User Table */}
        <div className="pb-10">
          <UserTable
            users={users}
            onAddUser={() => setModalType('add')}
            onInfoClick={handleInfoClick}
            onEditClick={handleEditClick}
            onUserDeleted={loadUsers}
          />
        </div>
      </div>

      {/* Modals */}
      {modalType === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AddUserModal onClose={handleCloseModal} onAddUser={handleAddUser} />
        </div>
      )}

      {modalType === 'info' && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <InfoUserModal user={selectedUser} onClose={handleCloseModal} />
        </div>
      )}

      {modalType === 'edit' && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <EditUserModal
            user={selectedUser}
            onClose={handleCloseModal}
            onEditUser={handleEditUser}
          />
        </div>
      )}
    </div>
  );
};
