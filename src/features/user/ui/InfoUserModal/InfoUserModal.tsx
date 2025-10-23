import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalHeader } from '@/shared/ui/ModalHeader/ModalHeader';
import { Button } from '@/shared/ui/Button/Button';
import { AddUserForm } from '@/features/user/ui/AddUserForm/AddUserForm';
import type { AddUserFormData } from '@/features/user/model/addUserFormData';

interface InfoUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AddUserFormData | null;
}

export const InfoUserModal = ({ isOpen, onClose, user }: InfoUserModalProps) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <ModalHeader title="User Information" />
        <div className="flex-1 overflow-y-auto px-8 py-5">
          <AddUserForm
            data={user}
            onChange={() => {}}
            onCheckUsername={() => {}}
            isChecking={false}
            isAvailable={true}
          />
        </div>
        <div className="flex items-center justify-end px-8 py-5">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
