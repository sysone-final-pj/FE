import { useState, useEffect } from 'react';
import { AlertTable } from '@/widgets/AlertTable/ui/AlertTable';
import { ManageAlertRulesModal } from '@/widgets/ManageAlertRulesModal';
import { alertsData } from '@/shared/mocks/alertsData';
import { alertRulesData } from '@/shared/mocks/alertRulesData';
import { alertRuleApi, type AlertRuleResponse } from '@/shared/api/alertRule';
import type { AlertRule } from '@/entities/alertRule/model/types';
import { parseApiError } from '@/shared/lib/errors/parseApiError';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';

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

  // 에러/성공 모달
  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
  });

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
    loadRules();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
          <AlertTable alerts={alertsData} onManageRulesClick={handleOpenModal} />
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