import { useState, useEffect } from 'react';
import type { AlertRule, MetricType } from '@/entities/alertRule/model/types';
import { METRIC_TYPES } from '@/entities/alertRule/model/constants';
import { alertRuleApi } from '@/shared/api/alertRule';
import { parseApiError } from '@/shared/lib/errors/parseApiError';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';

interface EditAlertRuleModalProps {
  rule: AlertRule;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditAlertRuleModal = ({
  rule,
  onClose,
  onSuccess,
}: EditAlertRuleModalProps) => {
  const [formData, setFormData] = useState({
    ruleName: '',
    metricType: '' as MetricType | '',
    infoThreshold: '',
    warningThreshold: '',
    highThreshold: '',
    criticalThreshold: '',
    cooldownSeconds: '',
  });

  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
  });

  // rule이 변경될 때마다 폼 데이터 초기화
  useEffect(() => {
    if (rule) {
      setFormData({
        ruleName: rule.ruleName,
        metricType: rule.metricType,
        infoThreshold: String(rule.infoThreshold),
        warningThreshold: String(rule.warningThreshold),
        highThreshold: String(rule.highThreshold),
        criticalThreshold: String(rule.criticalThreshold),
        cooldownSeconds: String(rule.cooldownSeconds),
      });
    }
  }, [rule]);

  // 값을 숫자로 변환 (빈 값이거나 0이면 null 처리)
  const parseThreshold = (value: string): number | null => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const num = Number(value);
    return num === 0 ? null : num;
  };

  const handleSubmit = async () => {
    if (
      !formData.ruleName ||
      !formData.metricType ||
      !formData.cooldownSeconds
    ) {
      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.ALERT_RULE.REQUIRED_FIELDS.header,
        content: 'Please fill in all required fields.\n(Rule Name, Metric Type, Cooldown)',
      });
      return;
    }

    // 최소 1개 이상의 threshold 입력 검증
    const thresholds = [
      formData.infoThreshold,
      formData.warningThreshold,
      formData.highThreshold,
      formData.criticalThreshold,
    ];
    const hasAnyThreshold = thresholds.some((v) => {
      if (v === '' || v === null || v === undefined) return false;
      const num = Number(v);
      return num !== 0;
    });

    if (!hasAnyThreshold) {
      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.ALERT_RULE.REQUIRED_FIELDS.header,
        content: 'Please enter at least one threshold value.',
      });
      return;
    }

    try {
      const parsedInfo = parseThreshold(formData.infoThreshold);
      const parsedWarning = parseThreshold(formData.warningThreshold);
      const parsedHigh = parseThreshold(formData.highThreshold);
      const parsedCritical = parseThreshold(formData.criticalThreshold);

      await alertRuleApi.updateRule(Number(rule.id), {
        ruleName: formData.ruleName,
        infoThreshold: parsedInfo,
        warningThreshold: parsedWarning,
        highThreshold: parsedHigh,
        criticalThreshold: parsedCritical,
        cooldownSeconds: Number(formData.cooldownSeconds),
        enabled: rule.enabled,
      });

      // 성공
      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.ALERT_RULE.UPDATE_SUCCESS.header,
        content: MODAL_MESSAGES.ALERT_RULE.UPDATE_SUCCESS.content,
      });

      // 성공 모달 닫으면 부모 컴포넌트 업데이트
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);

    } catch (error) {
      const apiError = parseApiError(error, 'alert');
      setResultModalState({
        isOpen: true,
        header: 'Error',
        content: apiError.message,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg px-5 py-0 flex flex-col items-start w-[456px]">
      {/* Modal Header */}
      <div className="border-b border-gray-200 self-stretch h-[60px] flex items-center overflow-hidden">
        <h2 className="text-gray-600 font-semibold text-xl ml-2.5 mt-[25px] font-pretendard tracking-tight">
          Edit Alert Rule
        </h2>
      </div>

      {/* Form */}
      <div className="py-2.5 flex flex-col gap-3 w-full">
        {/* Rule Name */}
        <div className="px-2.5 flex items-center gap-2.5 self-stretch">
          <div className="p-2.5 w-[146px]">
            <span className="text-gray-600 font-medium text-sm font-pretendard tracking-tight">
              Rule Name
            </span>
          </div>
          <input
            type="text"
            value={formData.ruleName}
            onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
            placeholder="Enter rule name"
            className="bg-gray-100 rounded-lg px-4 py-2.5 w-[240px] text-gray-700 font-medium text-xs font-pretendard tracking-tight placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Metric Type */}
        <div className="px-2.5 flex items-center gap-2.5 self-stretch">
          <div className="p-2.5 w-[146px]">
            <span className="text-gray-600 font-medium text-sm font-pretendard tracking-tight">
              Metric type
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-2.5 w-[240px] flex items-center gap-1.5">
            <select
              value={formData.metricType}
              onChange={(e) =>
                setFormData({ ...formData, metricType: e.target.value as MetricType })
              }
              className="bg-transparent text-gray-700 font-medium text-xs font-pretendard tracking-tight w-full outline-none cursor-pointer"
            >
              <option value="">Select metric type...</option>
              {METRIC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <svg
              className="w-4 h-4 text-gray-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Info Threshold */}
        <div className="px-2.5 flex items-center gap-2.5 self-stretch">
          <div className="p-2.5 w-[146px]">
            <span className="text-gray-600 font-medium text-sm font-pretendard tracking-tight">
              Info Threshold
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-2.5 w-[240px] flex items-center gap-1.5">
            <input
              type="number"
              value={formData.infoThreshold}
              onChange={(e) => setFormData({ ...formData, infoThreshold: e.target.value })}
              placeholder="Enter info threshold value"
              className="bg-transparent text-gray-700 font-medium text-xs font-pretendard tracking-tight w-full outline-none"
            />
            <span className="text-gray-500 font-medium text-xs font-pretendard tracking-tight">
              %
            </span>
          </div>
        </div>

        {/* Warning Threshold */}
        <div className="px-2.5 flex items-center gap-2.5 self-stretch">
          <div className="p-2.5 w-[146px]">
            <span className="text-gray-600 font-medium text-sm font-pretendard tracking-tight">
              Warning Threshold
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-2.5 w-[240px] flex items-center gap-1.5">
            <input
              type="number"
              value={formData.warningThreshold}
              onChange={(e) =>
                setFormData({ ...formData, warningThreshold: e.target.value })
              }
              placeholder="Enter warning threshold value"
              className="bg-transparent text-gray-700 font-medium text-xs font-pretendard tracking-tight w-full outline-none"
            />
            <span className="text-gray-500 font-medium text-xs font-pretendard tracking-tight">
              %
            </span>
          </div>
        </div>

        {/* High Threshold */}
        <div className="px-2.5 flex items-center gap-2.5 self-stretch">
          <div className="p-2.5 w-[146px]">
            <span className="text-gray-600 font-medium text-sm font-pretendard tracking-tight">
              High Threshold
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-2.5 w-[240px] flex items-center gap-1.5">
            <input
              type="number"
              value={formData.highThreshold}
              onChange={(e) => setFormData({ ...formData, highThreshold: e.target.value })}
              placeholder="Enter high threshold value"
              className="bg-transparent text-gray-700 font-medium text-xs font-pretendard tracking-tight w-full outline-none"
            />
            <span className="text-gray-500 font-medium text-xs font-pretendard tracking-tight">
              %
            </span>
          </div>
        </div>

        {/* Critical Threshold */}
        <div className="px-2.5 flex items-center gap-2.5 self-stretch">
          <div className="p-2.5 w-[146px]">
            <span className="text-gray-600 font-medium text-sm font-pretendard tracking-tight">
              Critical Threshold
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-2.5 w-[240px] flex items-center gap-1.5">
            <input
              type="number"
              value={formData.criticalThreshold}
              onChange={(e) =>
                setFormData({ ...formData, criticalThreshold: e.target.value })
              }
              placeholder="Enter critical threshold value"
              className="bg-transparent text-gray-700 font-medium text-xs font-pretendard tracking-tight w-full outline-none"
            />
            <span className="text-gray-500 font-medium text-xs font-pretendard tracking-tight">
              %
            </span>
          </div>
        </div>

        {/* Cooldown (seconds) */}
        <div className="px-2.5 flex items-center gap-2.5 self-stretch">
          <div className="p-2.5 w-[146px]">
            <span className="text-gray-600 font-medium text-sm font-pretendard tracking-tight">
              Cooldown (seconds)
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-2.5 w-[240px] flex items-center gap-1.5">
            <input
              type="number"
              value={formData.cooldownSeconds}
              onChange={(e) =>
                setFormData({ ...formData, cooldownSeconds: e.target.value })
              }
              placeholder="Minimum time between duplicate alerts"
              className="bg-transparent text-gray-700 font-medium text-xs font-pretendard tracking-tight w-full outline-none"
            />
            <span className="text-gray-500 font-medium text-xs font-pretendard tracking-tight">
              seconds
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 pt-5 pb-3 flex gap-3 justify-end w-[416px] h-[70px]">
          <button
            onClick={onClose}
            className="border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-500 font-semibold text-xs text-center font-pretendard tracking-tight">
              Cancel
            </span>
          </button>
          <button
            onClick={handleSubmit}
            className="border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-600 font-semibold text-xs text-center font-pretendard tracking-tight">
              Edit Rule
            </span>
          </button>
        </div>
      </div>

      {/* Result Modal (Success/Error/Validation) */}
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