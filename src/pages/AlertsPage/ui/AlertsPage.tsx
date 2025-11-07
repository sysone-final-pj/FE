import { useState, useEffect, useMemo } from 'react';
import { AlertTable } from '@/widgets/AlertTable/ui/AlertTable';
import { ManageAlertRulesModal } from '@/widgets/ManageAlertRulesModal';
import { alertRulesData } from '@/shared/mocks/alertRulesData';
import { alertRuleApi, type AlertRuleResponse } from '@/shared/api/alertRule';
import { alertApi } from '@/shared/api/alert';
import type { AlertRule } from '@/entities/alertRule/model/types';
import type { Alert } from '@/entities/alert/model/types';
import { parseApiError } from '@/shared/lib/errors/parseApiError';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { useAlertStore } from '@/shared/stores/useAlertStore';
import { useAlertWebSocket } from '@/features/alert/hooks/useAlertWebSocket';

// API 응답을 AlertRule 타입으로 변환
const mapApiRuleToAlertRule = (apiRule: AlertRuleResponse): AlertRule => ({
  id: apiRule.id.toString(),
  ruleName: apiRule.ruleName,
  metricType: apiRule.metricType,
  infoThreshold: apiRule.infoThreshold,
  warningThreshold: apiRule.warningThreshold,
  highThreshold: apiRule.highThreshold,
  criticalThreshold: apiRule.criticalThreshold,
  cooldownSeconds: apiRule.cooldownSeconds,
  enabled: apiRule.enabled,
});

export const AlertsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rules, setRules] = useState<AlertRule[]>(alertRulesData);
  const [loading, setLoading] = useState(true);

  // Alert Store
  const setNotifications = useAlertStore((state) => state.setNotifications);
  const notifications = useAlertStore((state) => state.notifications);

  // WebSocket 연결 (실시간 알림 수신)
  useAlertWebSocket();

  // 에러/성공 모달
  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
  });

  // 알림 목록 로드
  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertApi.getAllAlerts();

      // ✅ AlertListItemDTO → AlertNotification 정확한 매핑
      const mappedNotifications = response.data.map((item) => ({
        alertId: item.id,
        metricType: item.metricType,  // 백엔드: CPU, MEMORY, NETWORK
        title: item.alertLevel,  // 백엔드: CRITICAL, HIGH, WARNING, INFO
        message: item.message,
        createdAt: item.createdAt,
        containerInfo: {
          containerId: 0,  // AlertListItemDTO에 없음 (WebSocket 전용)
          containerName: item.containerName,
          containerHash: '',  // AlertListItemDTO에 없음 (WebSocket 전용)
          metricType: item.metricType,  // 추가
          metricValue: item.metricValue,  // 추가
        },
        isRead: item.isRead,
        // REST API 전용 확장 필드
        agentName: item.agentName,
        metricValue: item.metricValue,
        collectedAt: item.collectedAt,
      }));

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      const apiError = parseApiError(error, 'alert');
      setResultModalState({
        isOpen: true,
        header: 'Error',
        content: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // 규칙 목록 로드
  const loadRules = async () => {
    try {
      const response = await alertRuleApi.getAllRules();
      const mappedRules = response.data.map(mapApiRuleToAlertRule);
      setRules(mappedRules);
    } catch (error) {
      // API 실패 시 mock 데이터 사용
      setRules(alertRulesData);

      const apiError = parseApiError(error, 'alert');
      setResultModalState({
        isOpen: true,
        header: 'Error',
        content: apiError.message,
      });
    }
  };

  // 초기 로드
  useEffect(() => {
    loadAlerts();
    loadRules();
  }, []);

  const handleOpenModal = async () => {
    // Modal 열 때 최신 규칙 로드
    await loadRules();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // AlertNotification을 Alert로 변환
  const alerts = useMemo(() => {
    return notifications.map((notification): Alert => {
      const created = new Date(notification.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const duration = diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`;

      return {
        id: notification.alertId,
        alertLevel: notification.title as Alert['alertLevel'],
        metricType: notification.metricType as Alert['metricType'],
        agentName: notification.agentName || '',
        containerName: notification.containerInfo.containerName,
        message: notification.message,
        metricValue: notification.metricValue || 0,
        collectedAt: notification.collectedAt || notification.createdAt,
        createdAt: notification.createdAt,
        isRead: notification.isRead,
        duration,
      };
    });
  }, [notifications]);

  return (
    <div className="bg-white min-h-screen">
      {/* Background */}
      <div className="bg-[#F7F7F7] min-h-[calc(100vh-80px)] pt-0">
        {/* Page Title */}
        <div className="py-8 px-10">
          <h1 className="text-[#000000] font-semibold text-xl">Alerts</h1>
        </div>

        {/* Alert Table */}
        <div className="px-[84px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">Loading alerts...</span>
            </div>
          ) : (
            <AlertTable alerts={alerts} onManageRulesClick={handleOpenModal} />
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ManageAlertRulesModal
          rules={rules}
          onClose={handleCloseModal}
          onRulesUpdate={loadRules}
        />
      )}

      {/* Result Modal (Error) */}
      <ConfirmModal
        isOpen={resultModalState.isOpen}
        onClose={() =>
          setResultModalState({
            isOpen: false,
            header: '',
            content: '',
          })
        }
        header={resultModalState.header}
        content={resultModalState.content}
        type="confirm"
      />
    </div>
  );
};