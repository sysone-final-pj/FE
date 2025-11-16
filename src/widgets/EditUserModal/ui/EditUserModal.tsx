import { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalHeader } from '@/shared/ui/ModalHeader/ModalHeader';
import { Button } from '@/shared/ui/Button/Button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import { EditUserForm } from '@/features/user/ui/EditUserForm/EditUserForm';
import type { User } from '@/entities/user/model/types';
import { parseApiError } from '@/shared/lib/errors/parseApiError';
import { userApi } from '@/shared/api/user';
import type { UpdateUserRequest } from '@/shared/api/user';

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
  onClose: () => void;
  onEditUser: () => void;
  user: User;
}

export const EditUserModal = ({ onClose, onEditUser, user }: EditUserModalProps) => {
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

  const handleSubmit = async () => {
    if (!user || !user.id) return;

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

    // API 요청 데이터 준비
    const updateData: UpdateUserRequest = {
      name: data.name,
      company: data.companyName,
      position: data.position,
      mobile: data.mobileNumber,
      office: data.officePhone,
      email: data.email,
      note: data.note,
    };

    // 비밀번호가 입력된 경우에만 추가
    if (data.password) {
      updateData.password = data.password;
    }

    // 사용자 수정 API 호출
    try {
      await userApi.updateUser(user.id, updateData);

      // 성공 메시지 표시
      setConfirmModalState({
        isOpen: true,
        ...MODAL_MESSAGES.USER.EDIT_SUCCESS,
        onConfirm: () => {
          setConfirmModalState(prev => ({ ...prev, isOpen: false }));
          onEditUser();
          onClose();
        }
      });
    } catch (error) {
      // 공통 에러 처리
      const apiError = parseApiError(error, 'user');
      setConfirmModalState({
        isOpen: true,
        header: '사용자 수정 실패',
        content: apiError.message,
        type: 'confirm',
        onConfirm: undefined
      });
    }
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose}>
        <div className="flex flex-col max-h-[90vh]">
          <ModalHeader title="Edit User" onClose={onClose} />
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
