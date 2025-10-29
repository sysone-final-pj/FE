import { useState } from 'react';
import { authApi } from '@/shared/api/auth';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';

export interface UserMenuProps {
  userName: string;
  userRole: string;
  onLogout?: () => void; // Optional - 없으면 authApi.logout() 사용
}

export const UserMenu: React.FC<UserMenuProps> = ({
  userName,
  userRole,
  onLogout,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    
    // onLogout prop이 있으면 사용, 없으면 authApi 직접 사용
    if (onLogout) {
      onLogout();
    } else {
      await authApi.logout();
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="text-gray-700 text-base">
          Welcome <span className="font-medium">{userRole} {userName}</span>!
        </span>
        <button
          onClick={handleLogoutClick}
          className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors text-gray-700 text-base"
        >
          Logout
        </button>
      </div>

      {/* Logout 확인 모달 */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        header={MODAL_MESSAGES.SYSTEM.LOGOUT_CONFIRM.header}
        content={MODAL_MESSAGES.SYSTEM.LOGOUT_CONFIRM.content}
        type={MODAL_MESSAGES.SYSTEM.LOGOUT_CONFIRM.type}
      />
    </>
  );
};