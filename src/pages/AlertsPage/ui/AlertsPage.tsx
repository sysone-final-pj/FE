/**
 작성자: 김슬기
 */
import { useState, useEffect, useMemo } from 'react';
import { AlertTable } from '@/widgets/AlertTable/ui/AlertTable';
import { ManageAlertRulesModal } from '@/widgets/ManageAlertRulesModal';
import { alertRulesData } from '@/shared/mocks/alertRulesData';
import { alertRuleApi, type AlertRuleResponse } from '@/shared/api/alertRule';
import { alertApi, type AlertFilterParams } from '@/shared/api/alert';
import type { AlertRule } from '@/entities/alertRule/model/types';
import type { Alert } from '@/entities/alert/model/types';
import { parseApiError } from '@/shared/lib/errors/parseApiError';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import { useAlertStore } from '@/shared/stores/useAlertStore';
import { useAlertWebSocket } from '@/features/alert/hooks/useAlertWebSocket';
import type { TimeFilterValue } from '@/shared/ui/TimeFilter/TimeFilter';

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
  enabled: apiRule.isEnabled,
});

export const AlertsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rules, setRules] = useState<AlertRule[]>(alertRulesData);
  const [loading, setLoading] = useState(true);

  // Zustand Store
  const setNotifications = useAlertStore((state) => state.setNotifications);
  const removeNotification = useAlertStore((state) => state.removeNotification);
  const notifications = useAlertStore((state) => state.notifications);

  // WebSocket 연결 (실시간 알림 수신)
  useAlertWebSocket();

  // 모달 상태
  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
  });

  // 삭제 확인 모달
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    alertIds: [] as number[],
  });

  /** 알림 목록 로드 */
  const loadAlerts = async (params: AlertFilterParams = {}) => {
    try {
      setLoading(true);

      // 필터 파라미터가 있으면 필터 API 사용, 없으면 전체 조회
      const response = Object.keys(params).length > 0
        ? await alertApi.getAlertsWithFilter(params)
        : await alertApi.getAllAlerts();

      const mappedNotifications = response.data.map((item) => ({
        alertId: item.id,
        metricType: item.metricType,
        title: item.alertLevel,
        message: item.message,
        createdAt: item.createdAt,
        containerInfo: {
          containerId: 0,
          containerName: item.containerName,
          containerHash: '',
          metricType: item.metricType,
          metricValue: item.metricValue,
        },
        isRead: item.isRead,
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

  /** TimeFilter에서 호출되는 검색 핸들러 */
  const handleTimeFilterSearch = (filterValue: TimeFilterValue) => {
    const params: AlertFilterParams = {};

    if (filterValue.mode === 'quick' && filterValue.quickRangeType) {
      params.quickRangeType = filterValue.quickRangeType;
    } else if (filterValue.mode === 'custom') {
      params.collectedAtFrom = filterValue.collectedAtFrom;
      params.collectedAtTo = filterValue.collectedAtTo;
    }

    loadAlerts(params);
  };

  /** 규칙 목록 로드 */
  const loadRules = async () => {
    try {
      const response = await alertRuleApi.getAllRules();
      const mappedRules = response.data.map(mapApiRuleToAlertRule);
      setRules(mappedRules);
    } catch (error) {
      setRules(alertRulesData);
      const apiError = parseApiError(error, 'alert');
      setResultModalState({
        isOpen: true,
        header: 'Error',
        content: apiError.message,
      });
    }
  };

  /** 삭제 버튼 클릭 시 */
  const handleMessageDelete = (alertIds: number[]) => {
    setDeleteConfirmState({ isOpen: true, alertIds });
  };

  /** 삭제 확정 */
  const confirmDelete = async () => {
    const { alertIds } = deleteConfirmState;
    setDeleteConfirmState({ isOpen: false, alertIds: [] });

    try {
      await Promise.all(alertIds.map((id) => alertApi.deleteAlert(id)));
      alertIds.forEach((id) => removeNotification(id));

      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.ALERT.DELETE_SUCCESS.header,
        content: MODAL_MESSAGES.ALERT.DELETE_SUCCESS.content,
      });
    } catch (error) {
      const apiError = parseApiError(error, 'alert');
      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.ALERT.DELETE_FAIL.header,
        content: apiError.message,
      });
    }
  };

  // 초기 로드
  useEffect(() => {
    loadAlerts();
  }, []);

  /** 규칙 관리 모달 */
  const handleOpenModal = async () => {
    await loadRules();
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  /** AlertNotification → Alert 변환 */
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
        read: notification.isRead,
        duration,
      };
    });
  }, [notifications]);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-[#F7F7F7] min-h-[calc(100vh-80px)] pt-0">
        <div className="py-8 px-10">
          <h1 className="text-[#000000] font-semibold text-xl">Alerts</h1>
        </div>

        <div className="px-[84px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-text-secondary">Loading alerts...</span>
            </div>
          ) : (
            <AlertTable
              alerts={alerts}
              onManageRulesClick={handleOpenModal}
              onMessageDelete={handleMessageDelete}
              onTimeFilterSearch={handleTimeFilterSearch}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <ManageAlertRulesModal
          rules={rules}
          onClose={handleCloseModal}
          onRulesUpdate={loadRules}
        />
      )}

      <ConfirmModal
        isOpen={resultModalState.isOpen}
        onClose={() =>
          setResultModalState({ isOpen: false, header: '', content: '' })
        }
        header={resultModalState.header}
        content={resultModalState.content}
        type="confirm"
      />

      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() =>
          setDeleteConfirmState({ isOpen: false, alertIds: [] })
        }
        onConfirm={confirmDelete}
        {...MODAL_MESSAGES.ALERT.DELETE_CONFIRM}
      />
    </div>
  );
};
