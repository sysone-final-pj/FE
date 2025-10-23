import { useState } from 'react';
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

  const handleToggle = (id: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, isEnabled: !rule.isEnabled } : rule
      )
    );
  };

  const handleEdit = (id: string) => {
    const ruleToEdit = rules.find((rule) => rule.id === id);
    if (ruleToEdit) {
      setEditingRule(ruleToEdit);
    }
  };

  const handleEditSubmit = (
    id: string,
    updatedRule: {
      ruleName: string;
      metricType: 'CPU' | 'Memory' | 'Disk' | 'Network';
      infoThreshold: number;
      warningThreshold: number;
      highThreshold: number;
      criticalThreshold: number;
      cooldownSeconds: number;
      checkInterval: number;
    }
  ) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              ...updatedRule,
            }
          : rule
      )
    );
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      setRules((prev) => prev.filter((rule) => rule.id !== id));
    }
  };

  const handleAddRule = () => {
    setIsAddModalOpen(true);
  };

  const handleAddRuleSubmit = (newRule: {
    ruleName: string;
    metricType: 'CPU' | 'Memory' | 'Disk' | 'Network';
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
      isEnabled: true,
    };
    setRules((prev) => [...prev, rule]);
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg px-5 py-0 flex flex-col items-center w-[1700px]">
        {/* Modal Header */}
        <div className="border-b border-gray-200 self-stretch h-[60px] flex items-center overflow-hidden">
          <div className="flex items-center gap-1.5 ml-2.5 mt-[25px]">
            <svg className="w-[25px] h-[25px]" viewBox="0 0 25 25" fill="none">
              <path
                d="M12.5 15.625C14.2259 15.625 15.625 14.2259 15.625 12.5C15.625 10.7741 14.2259 9.375 12.5 9.375C10.7741 9.375 9.375 10.7741 9.375 12.5C9.375 14.2259 10.7741 15.625 12.5 15.625Z"
                stroke="#767676"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.2083 15.625C20.0811 15.8819 20.0378 16.1703 20.0838 16.4514C20.1299 16.7324 20.2633 16.9923 20.4646 17.1938L20.5333 17.2625C20.6919 17.421 20.8179 17.6094 20.9043 17.8171C20.9906 18.0249 21.0356 18.2479 21.0356 18.4729C21.0356 18.698 20.9906 18.921 20.9043 19.1288C20.8179 19.3365 20.6919 19.5249 20.5333 19.6833C20.3749 19.8419 20.1865 19.9679 19.9787 20.0543C19.771 20.1406 19.548 20.1856 19.3229 20.1856C19.0979 20.1856 18.8749 20.1406 18.6671 20.0543C18.4594 19.9679 18.271 19.8419 18.1125 19.6833L18.0437 19.6146C17.8423 19.4133 17.5824 19.2799 17.3014 19.2338C17.0203 19.1878 16.7319 19.2311 16.475 19.3583C16.2236 19.4799 16.0165 19.6743 15.8813 19.9167C15.746 20.1591 15.6889 20.4383 15.7187 20.7156V20.8333C15.7187 21.2862 15.5387 21.7206 15.2199 22.0394C14.9011 22.3581 14.4667 22.5381 14.0139 22.5381C13.5611 22.5381 13.1267 22.3581 12.8079 22.0394C12.4891 21.7206 12.3091 21.2862 12.3091 20.8333V20.7396C12.2735 20.4543 12.1478 20.1867 11.9498 19.9754C11.7519 19.7642 11.4917 19.6196 11.2049 19.5625C10.948 19.5164 10.6597 19.5597 10.3786 19.687C10.0975 19.8142 9.83767 19.9475 9.63617 20.1489L9.56742 20.2177C9.40895 20.3763 9.22052 20.5023 9.01278 20.5886C8.80504 20.6749 8.58202 20.72 8.35696 20.72C8.13189 20.72 7.90888 20.6749 7.70114 20.5886C7.4934 20.5023 7.30496 20.3763 7.14649 20.2177C6.98794 20.0592 6.86194 19.8708 6.77559 19.663C6.68925 19.4553 6.6442 19.2323 6.6442 19.0072C6.6442 18.7822 6.68925 18.5591 6.77559 18.3514C6.86194 18.1437 6.98794 17.9552 7.14649 17.7968L7.21524 17.728C7.41661 17.5265 7.54993 17.2667 7.59598 16.9856C7.64203 16.7045 7.59868 16.4162 7.47149 16.1593C7.34989 15.9078 7.15554 15.7008 6.9131 15.5655C6.67067 15.4302 6.39153 15.3732 6.11419 15.403H5.99649C5.54364 15.403 5.10922 15.223 4.79043 14.9042C4.47165 14.5854 4.29169 14.151 4.29169 13.6982C4.29169 13.2454 4.47165 12.811 4.79043 12.4922C5.10922 12.1734 5.54364 11.9934 5.99649 11.9934H6.09024C6.37558 11.9579 6.64319 11.8322 6.85442 11.6342C7.06566 11.4362 7.2103 11.1761 7.26732 10.8893C7.31337 10.6324 7.27002 10.344 7.14274 10.0629C7.01546 9.78183 6.88215 9.52195 6.68078 9.32048L6.61203 9.25173C6.45348 9.09326 6.32748 8.90483 6.24114 8.69709C6.15479 8.48935 6.10974 8.26633 6.10974 8.04127C6.10974 7.8162 6.15479 7.59319 6.24114 7.38545C6.32748 7.17771 6.45348 6.98927 6.61203 6.8308C6.7705 6.67225 6.95893 6.54625 7.16667 6.45991C7.37441 6.37356 7.59743 6.32851 7.82249 6.32851C8.04756 6.32851 8.27057 6.37356 8.47831 6.45991C8.68605 6.54625 8.87449 6.67225 9.03296 6.8308L9.10171 6.89955C9.30318 7.10092 9.56306 7.23424 9.84416 7.28029C10.1253 7.32634 10.4136 7.28299 10.6705 7.1558H10.7392C10.9906 7.0342 11.1976 6.83985 11.3329 6.59742C11.4682 6.35498 11.5252 6.07584 11.4954 5.7985V5.6808C11.4954 5.22795 11.6754 4.79353 11.9942 4.47474C12.313 4.15596 12.7474 3.976 13.2003 3.976C13.6531 3.976 14.0875 4.15596 14.4063 4.47474C14.7251 4.79353 14.9051 5.22795 14.9051 5.6808V5.77455C14.9349 6.05189 14.9919 6.33103 15.1272 6.57346C15.2625 6.8159 15.4695 7.01025 15.7209 7.13185C15.9778 7.25913 16.2662 7.30248 16.5473 7.25643C16.8284 7.21038 17.0883 7.07706 17.2898 6.87569L17.3585 6.80694C17.517 6.64839 17.7054 6.52239 17.9132 6.43605C18.1209 6.3497 18.3439 6.30465 18.569 6.30465C18.7941 6.30465 19.0171 6.3497 19.2248 6.43605C19.4325 6.52239 19.621 6.64839 19.7794 6.80694C19.938 6.96541 20.064 7.15385 20.1503 7.36159C20.2367 7.56933 20.2817 7.79234 20.2817 8.01741C20.2817 8.24247 20.2367 8.46549 20.1503 8.67323C20.064 8.88097 19.938 9.0694 19.7794 9.22787L19.7107 9.29662C19.5093 9.49809 19.376 9.75797 19.33 10.0391C19.2839 10.3202 19.3272 10.6085 19.4544 10.8654V10.9341C19.576 11.1856 19.7704 11.3926 20.0128 11.5279C20.2552 11.6632 20.5344 11.7202 20.8117 11.6904H20.9294C21.3823 11.6904 21.8167 11.8704 22.1355 12.1892C22.4543 12.508 22.6342 12.9424 22.6342 13.3952C22.6342 13.8481 22.4543 14.2825 22.1355 14.6013C21.8167 14.9201 21.3823 15.1 20.9294 15.1H20.8357C20.5584 15.1298 20.2792 15.1868 20.0368 15.3221C19.7944 15.4574 19.6 15.6644 19.4784 15.9158V15.625Z"
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

        {/* Content */}
        <div className="py-2.5 flex flex-col gap-3 w-[1660px]">
          {/* Add New Rule Button */}
          <div className="pt-5 flex justify-end w-full">
            <button
              onClick={handleAddRule}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3.33334V12.6667M3.33334 8H12.6667"
                  stroke="#767676"
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
          <div className="flex flex-col w-[1510px]">
            <AlertRuleTableHeader />
            <div className="flex flex-col">
              {rules.map((rule) => (
                <AlertRuleRow
                  key={rule.id}
                  rule={rule}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-gray-200 pt-5 pb-3 flex justify-end w-[1660px] h-[70px]">
            <button
              onClick={onClose}
              className="border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
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
    </>
  );
};