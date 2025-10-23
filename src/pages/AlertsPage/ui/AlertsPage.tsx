import { useState } from 'react';
import { AlertTable } from '@/widgets/AlertTable/ui/AlertTable';
import { ManageAlertRulesModal } from '@/widgets/ManageAlertRulesModal';
import { alertsData } from '@/shared/mocks/alertsData';
import { alertRulesData } from '@/shared/mocks/alertRulesData';

export const AlertsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ManageAlertRulesModal
            rules={alertRulesData}
            onClose={handleCloseModal}
            onAddRule={() => {
              // TODO: API 호출하여 알림 규칙 추가 기능 구현
            }}
            onEditRule={(id) => {
              // TODO: API 호출하여 알림 규칙 수정 기능 구현 (규칙 ID: ${id})
            }}
            onDeleteRule={(id) => {
              // TODO: API 호출하여 알림 규칙 삭제 기능 구현 (규칙 ID: ${id})
            }}
          />
        </div>
      )}
    </div>
  );
};