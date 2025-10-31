import { useState } from 'react';
import type { ConfirmModalType } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import type { AlertRule } from '@/entities/alertRule/model/types';
import { AlertRuleRow } from '@/entities/alertRule/ui/AlertRuleRow';
import { AlertRuleTableHeader } from '@/features/alertRule/ui/AlertRuleTableHeader';
import { AddAlertRuleModal } from '@/widgets/AddAlertRuleModal';
import { EditAlertRuleModal } from '@/widgets/EditAlertRuleModal/ui/EditAlertRuleModal';

interface ManageAlertRulesModalProps {
  rules: AlertRule[];
  onClose?: () => void;
}

export const ManageAlertRulesModal = ({
  rules: initialRules,
  onClose,
}: ManageAlertRulesModalProps) => {
  const [rules, setRules] = useState<AlertRule[]>(initialRules);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
    type: 'confirm' as ConfirmModalType,
    onConfirm: undefined as (() => void) | undefined
  });

  const handleToggle = (id: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleEdit = (id: string) => {
    const ruleToEdit = rules.find((rule) => rule.id === id);
    if (ruleToEdit) setEditingRule(ruleToEdit);
  };

  const handleEditSubmit = (
    id: string,
    updatedRule: {
      ruleName: string;
      metricType: 'CPU' | 'Memory' | 'Storage' | 'Network';
      infoThreshold: number;
      warningThreshold: number;
      highThreshold: number;
      criticalThreshold: number;
      cooldownSeconds: number;
      checkInterval: number;
    }
  ) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...updatedRule } : rule))
    );
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    setConfirmModalState({
      isOpen: true,
      ...MODAL_MESSAGES.ALERT_RULE.DELETE_CONFIRM,
      onConfirm: () => {
        setRules((prev) => prev.filter((rule) => rule.id !== id));
      },
    });
  };

  const handleAddRule = () => setIsAddModalOpen(true);

  const handleAddRuleSubmit = (newRule: {
    ruleName: string;
    metricType: 'CPU' | 'Memory' | 'Storage' | 'Network';
    infoThreshold: number;
    warningThreshold: number;
    highThreshold: number;
    criticalThreshold: number;
    cooldownSeconds: number;
    checkInterval: number;
  }) => {
    const rule: AlertRule = {
      id: Date.now().toString(),
      ...newRule,
      enabled: true,
    };
    setRules((prev) => [...prev, rule]);
    setIsAddModalOpen(false);
  };

  return (
    <>
      {/* Modal Wrapper */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50]">
        {/* Modal Content Box */}
        <div className="bg-white rounded-lg w-[1580px] flex flex-col max-h-[90vh] overflow-hidden shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 h-[60px] flex items-center px-6">
            <div className="flex items-center gap-1.5">
              <svg className="w-[25px] h-[25px]" viewBox="0 0 25 25" fill="none">
                <path
                  d="M12.5 15.625C14.2259 15.625 15.625 14.2259 15.625 12.5C15.625 10.7741 14.2259 9.375 12.5 9.375C10.7741 9.375 9.375 10.7741 9.375 12.5C9.375 14.2259 10.7741 15.625 12.5 15.625Z"
                  stroke="#767676"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2 className="text-gray-600 font-semibold text-xl font-pretendard tracking-tight">
                Manage Alert Rules
              </h2>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {/* Add New Rule Button */}
            <div className="flex justify-end">
              <button
                onClick={handleAddRule}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3.33334V12.6667M3.33334 8H12.6667"
                    stroke="#0492f4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-gray-600 font-medium text-sm font-pretendard tracking-tight">
                  Add New Rule
                </span>
              </button>
            </div>

            {/* Table */}
            <div
              className={`border border-[#EBEBF1] rounded-lg ${
                rules.length > 7 ? 'max-h-[420px] overflow-y-auto' : ''
              }`}
            >
              <table className="min-w-full border-collapse">
                <AlertRuleTableHeader />
                <tbody>
                  {rules.map((rule) => (
                    <AlertRuleRow
                      key={rule.id}
                      rule={rule}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 py-4 px-6 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="border border-gray-200 rounded-lg px-4 pt-2 pb-2.5 hover:bg-gray-50 transition-colors "
            >
              <span className="text-gray-500 font-semibold text-xs text-center font-pretendard tracking-tight">
                Cancel
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Alert Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <AddAlertRuleModal
            onClose={() => setIsAddModalOpen(false)}
            onAddRule={handleAddRuleSubmit}
          />
        </div>
      )}

      {/* Edit Alert Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <EditAlertRuleModal
            rule={editingRule}
            onClose={() => setEditingRule(null)}
            onEditRule={handleEditSubmit}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        header={confirmModalState.header}
        content={confirmModalState.content}
        type={confirmModalState.type}
      />
    </>
  );
};
