import { useState, useMemo } from 'react';
import { Navigation } from './ui/Navigation';
import { NotificationButton } from './ui/NotificationButton';
import { UserMenu } from './ui/UserMenu';
import type { Alert } from '@/entities/alert/model/types';
import { useAlertStore } from '@/shared/stores/useAlertStore';
import { useAlertWebSocket } from '@/features/alert/hooks/useAlertWebSocket';
import { alertApi } from '@/shared/api/alert';
import type { AlertNotification } from '@/shared/types/websocket';

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
  { label: 'Container History', href: '/history' },
];

// AlertNotification을 Alert로 변환
const mapNotificationToAlert = (notification: AlertNotification): Alert => {
  // createdAt과 collectedAt의 차이를 duration으로 계산
  const created = new Date(notification.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const duration = diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`;

  return {
    id: notification.alertId,  // number로 변경
    alertLevel: notification.title as Alert['alertLevel'],  // 백엔드 필드명
    metricType: notification.metricType as Alert['metricType'],
    agentName: notification.agentName || '',  // AlertNotification 확장 필드
    containerName: notification.containerInfo.containerName,
    message: notification.message,
    metricValue: notification.metricValue || notification.containerInfo.metricValue || 0,
    collectedAt: notification.collectedAt || notification.createdAt,  // 백엔드 필드명
    createdAt: notification.createdAt,  // 백엔드 필드명
    isRead: notification.isRead,  // 백엔드 필드명
    duration,
  };
};

export const Header = ({
  userName,
  userRole,
  initialAlerts = [],
  onLogout,
  currentPath = '/containers',
}: HeaderProps) => {
  const [displayCount, setDisplayCount] = useState(5);

  // WebSocket 연결 (실시간 알림 수신)
  useAlertWebSocket();

  // AlertStore에서 읽지 않은 알림만 가져오기
  const notifications = useAlertStore((state) => state.notifications);
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const markAllAsRead = useAlertStore((state) => state.markAllAsRead);

  // AlertNotification을 Alert로 변환
  const alerts = useMemo(() => {
    return notifications
      .filter((n) => !n.isRead)
      .map(mapNotificationToAlert);
  }, [notifications]);

  const navItems = navigationItems.map((item) => ({
    ...item,
    active: item.href === currentPath,
  }));

  const handleConfirm = async (alertId: string | number) => {
    try {
      // ✅ DELETE 대신 읽음 처리 API 호출
      await alertApi.markAsRead(Number(alertId));
      // ✅ Store에서 제거 대신 읽음 처리
      await markAsRead(Number(alertId));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleConfirmAll = async () => {
    try {
      // ✅ DELETE ALL 대신 모든 알림 읽음 처리
      await alertApi.markAllAsRead();
      // ✅ Store에서 모든 알림 읽음 처리
      markAllAsRead();
      setDisplayCount(5);
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
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