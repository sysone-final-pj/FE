import { useState } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalHeader } from '@/shared/ui/ModalHeader/ModalHeader';
import { Button } from '@/shared/ui/Button/Button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import { AddUserForm } from '@/features/user/ui/AddUserForm/AddUserForm';
import type { AddUserFormData } from '@/features/user/model/addUserFormData';
import { userApi } from '@/shared/api/user';
import type { ApiError } from '@/shared/lib/errors/types';
import { mapFormDataToUser } from '@/features/user/lib/mapFormDataToUser';


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

  const handleChange = (key: keyof AddUserFormData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));

    // username이 변경되면 중복 확인 상태 초기화
    if (key === 'username') {
      setIsAvailable(null);
    }
  };

  const handleCheckUsername = async () => {
    if (!data.username) return;

    setIsChecking(true);
    try {
      await userApi.checkUsername(data.username); // 200이면 중복 아님
      setIsAvailable(true);
      setConfirmModalState({
        isOpen: true,
        header: '중복 확인 완료',
        content: '사용 가능한 아이디입니다.',
        type: 'confirm',
        onConfirm: undefined,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setIsAvailable(false);
      setConfirmModalState({
        isOpen: true,
        header: '중복 확인 실패',
        content: apiError.message,
        type: 'confirm',
        onConfirm: undefined,
      });
    }
  }

  const handleSubmit = async () => {
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

    // 사용자 생성 API 호출
    try {
      const userData = mapFormDataToUser(data);

      await userApi.createUser({
        ...userData,
        password: data.password,
      });

      // 성공 메시지 표시
      setConfirmModalState({
        isOpen: true,
        ...MODAL_MESSAGES.USER.ADD_SUCCESS,
        onConfirm: () => {
          setConfirmModalState(prev => ({ ...prev, isOpen: false }));
          onSubmit(data);
          onClose();
        }
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setConfirmModalState({
        isOpen: true,
        header: '사용자 추가 실패',
        content: apiError.message,
        type: 'confirm',
        onConfirm: undefined
      });
    }
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