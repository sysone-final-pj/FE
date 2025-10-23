import React from 'react';
import { Navigation } from './ui/Navigation';
import { NotificationButton } from './ui/NotificationButton';
import { UserMenu } from './ui/UserMenu';

export interface HeaderProps {
  userName?: string;
  userRole?: string;
  notificationCount?: number;
  onLogout?: () => void;
  onClickNotification?: () => void;
  currentPath?: string;
}

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Manage Containers', href: '/containers' },
  { label: 'Manage Agents', href: '/agents' },
  { label: 'Manage Users', href: '/users' },
  { label: 'Manage Alerts', href: '/alerts' },
];

export const Header: React.FC<HeaderProps> = ({
  userName = 'admin',
  userRole = '관리자',
  notificationCount = 0,
  onLogout = () => console.log('Logout clicked'),
  onClickNotification = () => console.log('Notification clicked'),
  currentPath = '/containers',
}) => {
  const navItems = navigationItems.map((item) => ({
    ...item,
    active: item.href === currentPath,
  }));

  return (
    <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
      {/* 로고(Logo) */}
      <div className="text-lg font-medium text-black">MONITO</div>

      {/* 네비게이션(Navigation) */}
      <Navigation items={navItems} />

      {/* 우측 메뉴(Right actions) */}
      <div className="flex items-center gap-4">
        <NotificationButton
          count={notificationCount}
          onClickNotification={onClickNotification}
        />
        <UserMenu userName={userName} userRole={userRole} onLogout={onLogout} />
      </div>
    </header>
  );
};
