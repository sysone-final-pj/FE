import { useState, useRef, useEffect } from 'react';
import type { Alert } from '@/entities/alert/model/types';

interface NotificationDropdownProps {
  alerts: Alert[];
  onConfirm: (alertId: string | number) => void;
  onConfirmAll: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isOpen: boolean;
  onClose: () => void;
}

// 백엔드 AlertLevel과 일치 (대문자)
const LEVEL_COLORS = {
  CRITICAL: { bg: 'bg-[#ff6c5e]', text: 'text-[#ff6c5e]' },
  HIGH: { bg: 'bg-[#f47823]', text: 'text-[#f47823]' },
  WARNING: { bg: 'bg-[#ffc400]', text: 'text-[#ffc400]' },
  INFO: { bg: 'bg-[#0492f4]', text: 'text-[#0492f4]' },
};

const NotificationItem = ({
  alert,
  onConfirm,
}: {
  alert: Alert;
  onConfirm: (id: string | number) => void;
}) => {
  const levelColor = LEVEL_COLORS[alert.alertLevel as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.INFO;

  return (
    <div className="bg-white border-b border-border-light py-2.5 px-4 flex flex-col gap-1.5">
      <div className="flex flex-col gap-2">
        {/* 첫 번째 줄: Level, Type, Time, Confirm */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 w-[274px]">
            <div className={`${levelColor.bg} rounded-full w-2.5 h-2.5 shrink-0`} />
            <div className="flex items-center gap-2.5">
              <span
                className={`${levelColor.text} text-sm font-medium font-pretendard tracking-tight`}
              >
                {alert.alertLevel}
              </span>
              <div className="bg-gray-400 w-px h-4" />
              <span className="text-gray-700 text-sm font-medium font-pretendard tracking-tight">
                {alert.metricType}
              </span>
              <div className="bg-gray-400 w-px h-4" />
              <span className="text-gray-500 text-xs font-medium font-pretendard tracking-tight">
                {alert.duration}
              </span>
            </div>
          </div>
          <button
            onClick={() => onConfirm(alert.id)}
            className="rounded-lg border border-gray-500 py-0.5 px-2.5 text-gray-500 text-xs font-medium font-pretendard tracking-tight hover:bg-gray-50 transition-colors"
          >
            Confirm
          </button>
        </div>

        {/* 두 번째 줄: Agent / Container */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-gray-500 text-xs font-medium font-pretendard tracking-tight">
              {alert.agentName}
            </span>
            <span className="text-gray-500 text-xs font-medium font-pretendard tracking-tight">
              /
            </span>
            <span className="text-gray-500 text-xs font-medium font-pretendard tracking-tight">
              {alert.containerName}
            </span>
          </div>

          {/* 세 번째 줄: Message */}
          <div className="text-gray-700 text-xs font-medium font-pretendard tracking-tight w-[369px]">
            {alert.message}
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationDropdown = ({
  alerts,
  onConfirm,
  onConfirmAll,
  onLoadMore,
  hasMore,
  isOpen,
  onClose,
}: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 7개 이상일 때 스크롤 높이 계산 (각 아이템 약 88px)
  useEffect(() => {
    if (alerts.length >= 7) {
      setMaxHeight(88 * 7); // 7개 높이 = 616px
    } else {
      setMaxHeight(0); // 스크롤 없음
    }
  }, [alerts.length]);

  if (!isOpen) return null;

  const isEmpty = alerts.length === 0;

  return (
    <div
      ref={dropdownRef}
      className="fixed top-20 right-8 w-[414px] bg-white rounded-lg shadow-lg border border-border-light z-50"
    >
      <div className="p-2.5 flex flex-col gap-2.5">
        {/* Header: All alerts checked complete */}
        <div className="border-b border-border-light py-[5px] flex items-center justify-center">
          {isEmpty ? (
            <span className="text-text-secondary text-xs font-medium font-pretendard tracking-tight text-center w-full">
              All alerts checked complete
            </span>
          ) : (
            <button
              onClick={onConfirmAll}
              className="text-text-secondary text-xs font-medium font-pretendard tracking-tight text-center w-full hover:text-gray-900 transition-colors"
            >
              All alerts checked complete
            </button>
          )}
        </div>

        {/* Notification List */}
        <div
          className="flex flex-col overflow-y-auto"
          style={maxHeight > 0 ? { maxHeight: `${maxHeight}px` } : undefined}
        >
          {isEmpty ? (
            <div className="py-8 text-center text-gray-500 text-sm font-pretendard">
              No notifications
            </div>
          ) : (
            alerts.map((alert) => (
              <NotificationItem key={alert.id} alert={alert} onConfirm={onConfirm} />
            ))
          )}
        </div>

        {/* Footer: more... */}
        {hasMore && !isEmpty && (
          <div className="border-t border-border-light py-[5px] flex items-center justify-center">
            <button
              onClick={onLoadMore}
              className="text-text-secondary text-xs font-medium font-pretendard tracking-tight text-center w-full hover:text-gray-900 transition-colors"
            >
              more...
            </button>
          </div>
        )}
      </div>
    </div>
  );
};