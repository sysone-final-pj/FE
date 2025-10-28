import { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalHeader } from '@/shared/ui/ModalHeader/ModalHeader';
import { Button } from '@/shared/ui/Button/Button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import { EditUserForm } from '@/features/user/ui/EditUserForm/EditUserForm';
import type { User } from '@/entities/user/model/types';

interface EditUserFormData {
  name: string;
  companyName: string;
  position: string;
  mobileNumber: string;
  officePhone: string;
  email: string;
  note: string;
  password?: string;
  confirmPassword?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, data: EditUserFormData) => void;
  user: User | null;
}

export const EditUserModal = ({ isOpen, onClose, onSubmit, user }: EditUserModalProps) => {
  const [data, setData] = useState<EditUserFormData>({
    name: '',
    companyName: '',
    position: '',
    mobileNumber: '',
    officePhone: '',
    email: '',
    note: '',
    password: '',
    confirmPassword: '',
  });

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
    type: 'confirm' as ConfirmModalType,
    onConfirm: undefined as (() => void) | undefined
  });

  // user가 변경될 때마다 폼 데이터 초기화
  useEffect(() => {
    if (user) {
      setData({
        name: user.name,
        companyName: user.companyName,
        position: user.position,
        mobileNumber: user.mobileNumber,
        officePhone: user.officePhone,
        email: user.email,
        note: user.note,
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (key: keyof EditUserFormData, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!user) return;

    // 필수 필드 검증
    if (!data.name || !data.email) {
      setConfirmModalState({
        isOpen: true,
        ...MODAL_MESSAGES.USER.EDIT_REQUIRED_FIELDS,
        onConfirm: undefined
      });
      return;
    }

    // 비밀번호 변경 시 확인
    if (data.password || data.confirmPassword) {
      if (data.password !== data.confirmPassword) {
        setConfirmModalState({
          isOpen: true,
          ...MODAL_MESSAGES.USER.PASSWORD_MISMATCH,
          onConfirm: undefined
        });
        return;
      }
      if (data.password && data.password.length < 3) {
        setConfirmModalState({
          isOpen: true,
          ...MODAL_MESSAGES.USER.PASSWORD_LENGTH_ERROR,
          onConfirm: undefined
        });
        return;
      }
    }

    // 비밀번호가 입력되지 않았으면 제외
    const submitData = { ...data };
    if (!data.password) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }

    onSubmit(user.id, submitData);
    onClose();
  };

  if (!user) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col max-h-[90vh]">
          <ModalHeader title="Edit User" />
          <div className="flex-1 overflow-y-auto">
            <EditUserForm user={user} data={data} onChange={handleChange} />
          </div>
          <div className="flex items-center justify-end gap-3 px-8 py-5">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Edit User
            </Button>
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