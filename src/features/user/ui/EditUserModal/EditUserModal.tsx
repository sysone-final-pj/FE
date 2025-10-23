import { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalHeader } from '@/shared/ui/ModalHeader/ModalHeader';
import { Button } from '@/shared/ui/Button/Button';
import { AddUserForm } from '@/features/user/ui/AddUserForm/AddUserForm'; // 기존 폼 재사용
import type { AddUserFormData } from '@/features/user/model/addUserFormData';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AddUserFormData | null;
  onSubmit: (data: AddUserFormData) => void;
}

export const EditUserModal = ({ isOpen, onClose, user, onSubmit }: EditUserModalProps) => {
  const [data, setData] = useState<AddUserFormData>(
    user || {
      username: '',
      password: '',
      name: '',
      company: '',
      position: '',
      mobile: '',
      office: '',
      email: '',
      note: '',
    }
  );

  useEffect(() => {
    if (user) setData(user);
  }, [user]);

  const handleChange = (key: keyof AddUserFormData, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <ModalHeader title="Edit User" />
        <div className="flex-1 overflow-y-auto">
          <AddUserForm
            data={data}
            onChange={handleChange}
            onCheckUsername={() => {}}
            isChecking={false}
            isAvailable={true}
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-8 py-5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};