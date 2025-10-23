import React from 'react';

export interface UserMenuProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  userName,
  userRole,
  onLogout,
}) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-gray-700 text-base">
        반갑습니다 <span className="font-medium">{userRole} {userName}</span>님!
      </span>
      <button
        onClick={onLogout}
        className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors text-gray-700 text-base"
      >
        Logout
      </button>
    </div>
  );
};
