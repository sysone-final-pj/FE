import { useState } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalHeader } from '@/shared/ui/ModalHeader/ModalHeader';
import { Button } from '@/shared/ui/Button/Button';
import { AddUserForm } from '@/features/user/ui/AddUserForm/AddUserForm';
import type { AddUserFormData } from '@/features/user/model/addUserFormData';


interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserFormData) => void;
}

export const AddUserModal = ({ isOpen, onClose, onSubmit }: AddUserModalProps) => {
  const [data, setData] = useState<AddUserFormData>({
    username: '', password: '', name: '', company: '',
    position: '', mobile: '', office: '', email: '', note: '',
  });

  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const handleChange = (key: keyof AddUserFormData, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleCheckUsername = () => {
    if (!data.username) return;
    setIsChecking(true);
    setTimeout(() => {
      const available = data.username !== 'admin';
      setIsAvailable(available);
      setIsChecking(false);
    }, 800);
  };

  const handleSubmit = () => {
    if (!data.username || !data.password || !data.name || !data.email) {
      alert('Please fill in all required fields.');
      return;
    }
    if (isAvailable !== true) {
      alert('Please check username availability.');
      return;
    }
    onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <ModalHeader title="Create New User" />
        <div className="flex-1 overflow-y-auto">
          <AddUserForm
            data={data}
            onChange={handleChange}
            onCheckUsername={handleCheckUsername}
            isChecking={isChecking}
            isAvailable={isAvailable}
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-8 py-5">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={handleSubmit}>Create User</Button>
        </div>
      </div>
    </Modal>
  );
};