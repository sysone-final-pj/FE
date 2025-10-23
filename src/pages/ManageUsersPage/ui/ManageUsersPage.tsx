import { useState } from 'react';
import { UserTable } from '@/widgets/UserTable/ui/UserTable';
import { mockUsers } from '@/shared/mocks/usersData';
import { AddUserModal } from '@/features/user/ui/AddUserModal/AddUserModal';
import { InfoUserModal } from '@/features/user/ui/InfoUserModal/InfoUserModal';
import { EditUserModal } from '@/features/user/ui/EditUserModal/EditUserModal';
import { mapUserToFormData } from '@/features/user/lib/mapUserToFormData';
import { mapFormDataToUser } from '@/features/user/lib/mapFormDataToUser';
import type { AddUserFormData } from '@/features/user/model/addUserFormData';
import type { User } from '@/entities/user/model/types';

export const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<AddUserFormData | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddUser = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleUserInfo = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(mapUserToFormData(user));
      setIsInfoModalOpen(true);
    }
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserEdit = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(mapUserToFormData(user));
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSubmitAddUser = (data: AddUserFormData) => {
    const newUser = mapFormDataToUser(data);
    setUsers((prev) => [...prev, newUser]);
    setIsAddModalOpen(false);
  };

  const handleSubmitEditUser = (data: AddUserFormData) => {
    const updatedUser = mapFormDataToUser(data);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
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

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitAddUser}
      />

      <InfoUserModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={selectedUser}
        onSubmit={handleSubmitEditUser}
      />
    </div>
  );
};