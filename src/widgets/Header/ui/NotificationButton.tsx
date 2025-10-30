import { useState } from 'react';
import { NotificationDropdown } from './NotificationDropdown';
import type { Alert } from '@/entities/alert/model/types';

export interface NotificationButtonProps {
  alerts: Alert[];
  displayedAlerts: Alert[];
  onConfirm: (alertId: string) => void;
  onConfirmAll: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const NotificationButton = ({
  alerts,
  displayedAlerts,
  onConfirm,
  onConfirmAll,
  onLoadMore,
  hasMore,
}: NotificationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // 전체 알림 개수 표시 (확인된 것 포함)
  const totalCount = alerts.length;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="notifications"
      >
        <svg
          className="w-6 h-6 text-[#505050]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {totalCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {totalCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        alerts={displayedAlerts}
        onConfirm={onConfirm}
        onConfirmAll={onConfirmAll}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};