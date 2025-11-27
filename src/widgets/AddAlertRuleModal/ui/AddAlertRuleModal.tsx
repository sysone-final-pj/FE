/**
 작성자: 김슬기
 */
import { useState, useEffect } from 'react';
import type { MetricType } from '@/entities/alertRule/model/types';
import { METRIC_TYPES } from '@/entities/alertRule/model/constants';
import { alertRuleApi } from '@/shared/api/alertRule';
import { parseApiError } from '@/shared/lib/errors/parseApiError';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import {
  METRIC_DESCRIPTIONS,
  THRESHOLD_FIELDS,
  validateThresholdInput,
  validateCooldownInput,
  parseThreshold,
  hasAnyThreshold as checkAnyThreshold,
} from '@/shared/lib/alertRuleValidation';

interface AddAlertRuleModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddAlertRuleModal = ({ onClose, onSuccess }: AddAlertRuleModalProps) => {
  const [formData, setFormData] = useState({
    ruleName: '',
    metricType: '' as MetricType | '',
    infoThreshold: '',
    warningThreshold: '',
    highThreshold: '',
    criticalThreshold: '',
    cooldownSeconds: '',
  });

  const [unit] = useState<string>('%'); // 기본 단위

  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
  });

  // 메트릭 타입이 변경될 때마다 단위 업데이트
  useEffect(() => {
  }, [formData.metricType]);

  // Threshold 입력 핸들러 (0-100 범위 검증)
  const handleThresholdChange = (key: string, value: string) => {
    const validation = validateThresholdInput(value);
    if (!validation.isValid && validation.message) {
      setResultModalState({
        isOpen: true,
        header: 'Invalid Input',
        content: validation.message,
      });
      return;
    }
    setFormData({ ...formData, [key]: value });
  };

  // Cooldown 입력 핸들러 (음수 불가)
  const handleCooldownChange = (value: string) => {
    const validation = validateCooldownInput(value);
    if (!validation.isValid && validation.message) {
      setResultModalState({
        isOpen: true,
        header: 'Invalid Input',
        content: validation.message,
      });
      return;
    }
    setFormData({ ...formData, cooldownSeconds: value });
  };


  const handleSubmit = async () => {
    const {
      ruleName,
      metricType,
      cooldownSeconds,
      infoThreshold,
      warningThreshold,
      highThreshold,
      criticalThreshold,
    } = formData;

    // 필수 필드 검증
    if (!ruleName || !metricType || !cooldownSeconds) {
      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.ALERT_RULE.REQUIRED_FIELDS.header,
        content: 'Please fill in all required fields.\n(Rule Name, Metric Type, Cooldown)',
      });
      return;
    }

    // 최소 1개 이상의 threshold 입력 검증
    if (!checkAnyThreshold(infoThreshold, warningThreshold, highThreshold, criticalThreshold)) {
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

      await alertRuleApi.createRule({
        ruleName: formData.ruleName,
        metricType: formData.metricType as MetricType,
        infoThreshold: parsedInfo,
        warningThreshold: parsedWarning,
        highThreshold: parsedHigh,
        criticalThreshold: parsedCritical,
        cooldownSeconds: Number(formData.cooldownSeconds),
      });

      // 성공
      setResultModalState({
        isOpen: true,
        header: MODAL_MESSAGES.ALERT_RULE.ADD_SUCCESS.header,
        content: MODAL_MESSAGES.ALERT_RULE.ADD_SUCCESS.content,
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
    <>
      <div className="bg-white rounded-lg px-5 py-0 flex flex-col items-start w-[520px]">
        {/* Modal Header */}
        <div className="border-b border-border-light self-stretch h-[60px] flex items-center overflow-hidden">
          <h2 className="text-text-primary font-semibold text-xl ml-2.5 mt-[25px]">
            Add Alert Rule
          </h2>
        </div>

        {/* Form */}
        <div className="py-2.5 flex flex-col gap-3 w-full">

          {/* Rule Name */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[35%]">
              <span className="text-text-tertiary font-medium text-sm">Rule Name</span>
            </div>
            <input
              type="text"
              value={formData.ruleName}
              onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
              placeholder="Enter rule name"
              className="bg-background-opacity rounded-lg px-4 py-2.5 w-[65%] text-text-secondary font-medium text-xs placeholder:text-text-tertiary outline-none"
            />
          </div>

          {/* Metric Type */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[35%]">
              <span className="text-text-tertiary font-medium text-sm">Metric type</span>
            </div>
            <div className="bg-background-opacity rounded-lg px-4 py-2.5 w-[65%] flex items-center gap-1.5">
              <select
                value={formData.metricType}
                onChange={(e) => setFormData({ ...formData, metricType: e.target.value as MetricType })}
                className="bg-background-opacity text-text-secondary font-medium text-xs w-full outline-none cursor-pointer"
              >
                <option value="">Select metric type...</option>
                {METRIC_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Description */}
          {formData.metricType && (
            <div className="px-2 flex items-center gap-2.5 self-stretch">
              <div className="p-2 w-[35%]">
              </div>
              <p className="px-2 -mt-2 w-[65%] flex items-center text-state-error text-xs">
                {METRIC_DESCRIPTIONS[formData.metricType as MetricType]}
              </p>
            </div>
          )}



          {/* Threshold Blocks */}
          {THRESHOLD_FIELDS.map(([label, key]) => (
            <div key={key} className="px-2.5 flex items-center gap-2.5 self-stretch">
              <div className="p-2.5 w-[35%]">
                <span className="text-text-tertiary font-medium text-sm">{label}</span>
              </div>
              <div className="bg-background-opacity rounded-lg px-4 py-2.5 w-[65%] flex items-center gap-1.5">
                <input
                  type="number"
                  value={formData[key]}
                  onChange={(e) => handleThresholdChange(key, e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="bg-transparent text-text-secondary font-medium text-xs w-full placeholder:text-text-tertiary outline-none"
                />
                <span className="text-text-secondary font-medium text-xs min-w-[40px] text-right">
                  {unit}
                </span>
              </div>
            </div>
          ))}

          {/* Cooldown */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[35%]">
              <span className="text-text-tertiary font-medium text-sm">Cooldown (seconds)</span>
            </div>
            <div className="bg-background-opacity rounded-lg px-4 py-2.5 w-[65%] flex items-center gap-1.5">
              <input
                type="number"
                value={formData.cooldownSeconds}
                onChange={(e) => handleCooldownChange(e.target.value)}
                placeholder="Minimum time between duplicate alerts"
                className="bg-transparent text-text-secondary font-medium text-xs w-full placeholder:text-text-tertiary outline-none"
              />
              <span className="text-text-secondary font-medium text-xs text-right">
                sec
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="border-t border-border-light pt-5 pb-3 flex gap-3 justify-end w-full h-[70px]">
            <button
              onClick={onClose}
              className="
                group
                border border-border-light 
                rounded-lg 
                hover:bg-gray-50 
              "
            >
              <span
                className="
                  text-text-tertiary 
                  font-semibold 
                  text-xs 
                  px-4 py-2.5
                  group-hover:text-text-primary
                "
              >
                Cancel
              </span>
            </button>
            <button
              onClick={handleSubmit}
              className="
                group
                border border-border-light 
                rounded-lg
                hover:border-state-running
                hover:bg-gray-50
              "
            >
              <span
                className="
                  text-text-tertiary
                  font-semibold
                  text-xs
                  px-4 py-2.5
                  group-hover:text-state-running border-state-running
                "
              >
                Add Rule
              </span>
            </button>
          </div>
        </div>
      </div>

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
    </>
  );
};