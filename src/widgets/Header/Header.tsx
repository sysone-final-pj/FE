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
  { label: 'Manage Users', href: '/users' },
  { label: 'Manage Alerts', href: '/alerts' },
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
    <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
      <div className="text-lg font-medium text-black">MONITO</div>

      <Navigation items={navItems} />

      <div className="flex items-center gap-4">
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