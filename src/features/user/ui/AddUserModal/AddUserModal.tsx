import { useState } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalHeader } from '@/shared/ui/ModalHeader/ModalHeader';
import { Button } from '@/shared/ui/Button/Button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
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

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
    type: 'confirm' as ConfirmModalType,
    onConfirm: undefined as (() => void) | undefined
  });

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
    // 필수 필드 검증
    if (!data.username || !data.password || !data.name || !data.email) {
      setConfirmModalState({
        isOpen: true,
        ...MODAL_MESSAGES.USER.ADD_REQUIRED_FIELDS,
        onConfirm: undefined
      });
      return;
    }

    // 사용자명 중복 확인 검증
    if (isAvailable !== true) {
      setConfirmModalState({
        isOpen: true,
        ...MODAL_MESSAGES.USER.USERNAME_CHECK_REQUIRED,
        onConfirm: undefined
      });
      return;
    }

    // 정상 처리
    onSubmit(data);
    onClose();
  };

  return (
    <>
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