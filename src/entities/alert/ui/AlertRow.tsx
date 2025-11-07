import type { Alert } from '@/entities/alert/model/types';
import { ALERT_LEVEL_COLORS } from '@/entities/alert/model/constants';
import { alertApi } from '@/shared/api/alert';
import { useAlertStore } from '@/shared/stores/useAlertStore';

interface AlertRowProps {
  alert: Alert;
  onToggleCheck: (id: string | number) => void;
}

export const AlertRow = ({ alert, onToggleCheck }: AlertRowProps) => {
  const markAsRead = useAlertStore((state) => state.markAsRead);

  const handleClick = async () => {
    if (alert.isRead) return; // ✅ read → isRead

    try {
      await alertApi.markAsRead(Number(alert.id));
      markAsRead(Number(alert.id)); // Store 업데이트
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div
      className={`bg-white border-b border-[#EBEBF1] py-[5px] px-4 flex items-center h-[52px] cursor-pointer transition-colors ${
        !alert.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      {/* Check */}
      <div className="w-50 px-2.5 flex items-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={alert.checked || false}
          onChange={() => onToggleCheck(alert.id)}
          className="w-[18px] h-[18px] cursor-pointer"
        />
      </div>

      {/* Alert Level */}
      <div className="w-[110px] px-2.5">
        <span className={`font-medium text-base ${ALERT_LEVEL_COLORS[alert.alertLevel]}`}>
          {alert.alertLevel}
        </span>
      </div>

      {/* Metric Type */}
      <div className="w-[120px] px-2.5">
        <span className="text-[#555555] font-medium text-base">
          {alert.metricType}
        </span>
      </div>

      {/* Agent Name */}
      <div className="w-[180px] px-2.5">
        <span className="text-[#767676] font-medium text-base">
          {alert.agentName}
        </span>
      </div>

      {/* Container Name */}
      <div className="w-[180px] px-2.5">
        <span className="text-[#767676] font-medium text-base">
          {alert.containerName}
        </span>
      </div>

      {/* Message */}
      <div className="w-[530px] px-2.5 overflow-x-auto max-h-[42px] overflow-y-auto">
        <span className="text-[#555555] font-medium text-base whitespace-nowrap">
          {alert.message}
        </span>
      </div>

      {/* Collection time */}
      <div className="w-[150px] px-2.5 flex justify-center">
        <span className="text-[#999999] font-medium text-base">
          {alert.collectedAt}
        </span>
      </div>

      {/* Sent At */}
      <div className="w-[150px] px-2.5 flex justify-center">
        <span className="text-[#999999] font-medium text-base">
          {alert.createdAt}
        </span>
      </div>

      {/* Read */}
      <div className="w-[100px] px-2.5 flex justify-center">
        <span className="text-[#999999] font-medium text-base">
          {alert.isRead ? 'Yes' : 'No'}
        </span>
      </div>

      {/* Duration */}
      <div className="w-[150px] px-2.5 flex justify-center">
        <span className="text-[#999999] font-medium text-sm">
          {alert.duration}
        </span>
      </div>
    </div>
  );
};
