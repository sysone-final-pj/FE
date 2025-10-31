import { useState } from 'react';
import { Navigation } from './ui/Navigation';
import { NotificationButton } from './ui/NotificationButton';
import { UserMenu } from './ui/UserMenu';
import type { Alert } from '@/entities/alert/model/types';

export interface HeaderProps {
  userName: string;
  userRole: string;
  initialAlerts?: Alert[];
  onLogout: () => void;
  currentPath?: string;
}

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Manage Containers', href: '/containers' },
  { label: 'Manage Agents', href: '/agents' },
  { label: 'Manage Alerts', href: '/alerts' },
  { label: 'Manage Users', href: '/users' },
];

export const Header = ({
  userName,
  userRole,
  initialAlerts = [],
  onLogout,
  currentPath = '/containers',
}: HeaderProps) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [displayCount, setDisplayCount] = useState(5);

  const navItems = navigationItems.map((item) => ({
    ...item,
    active: item.href === currentPath,
  }));

  const handleConfirm = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const handleConfirmAll = () => {
    setAlerts([]);
    setDisplayCount(5);
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const displayedAlerts = alerts.slice(0, displayCount);
  const hasMore = displayCount < alerts.length;

  return (
    <header className="bg-white border-b border-[#e5e5ec] h-20 relative overflow-hidden sticky top-0 z-40">
      {/* Logo */}
      <div
        className="text-black font-pretendard font-medium text-xl absolute left-[31px] top-[25px]"
        style={{ letterSpacing: '-0.025em', lineHeight: '140%' }}
      >
        MONITO
      </div>

      <Navigation items={navItems} />

      <div className="absolute right-8 top-[17px] flex items-center gap-4">
        <NotificationButton
          alerts={alerts}
          displayedAlerts={displayedAlerts}
          onConfirm={handleConfirm}
          onConfirmAll={handleConfirmAll}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
        <UserMenu userName={userName} userRole={userRole} onLogout={onLogout} />
      </div>
    </header>
  );
};