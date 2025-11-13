import { useState, useEffect } from 'react';
import type { MetricType } from '@/entities/alertRule/model/types';
import { METRIC_TYPES } from '@/entities/alertRule/model/constants';
import { alertRuleApi } from '@/shared/api/alertRule';
import { parseApiError } from '@/shared/lib/errors/parseApiError';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';

interface AddAlertRuleModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

// 메트릭 타입별 단위 정의
const METRIC_UNITS: Record<MetricType, string> = {
  CPU: '%',
  Memory: 'MB',
  Storage: 'GB',
  Network: 'Mbps', // 가정용 컴퓨터 기준 (Megabits per second)
};

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

  const [unit, setUnit] = useState<string>('%'); // 기본 단위

  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    header: '',
    content: '',
  });

  // 메트릭 타입이 변경될 때마다 단위 업데이트
  useEffect(() => {
    if (formData.metricType && formData.metricType in METRIC_UNITS) {
      setUnit(METRIC_UNITS[formData.metricType as MetricType]);
    }
  }, [formData.metricType]);

  // 값을 숫자로 변환 (빈 값이거나 0이면 null 처리)
  const parseThreshold = (value: string): number | null => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const num = Number(value);
    return num === 0 ? null : num;
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
    const thresholds = [infoThreshold, warningThreshold, highThreshold, criticalThreshold];
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
      <div className="bg-white rounded-lg px-5 py-0 flex flex-col items-start w-[456px]">
        {/* Modal Header */}
        <div className="border-b border-[#EBEBF1] self-stretch h-[60px] flex items-center overflow-hidden">
          <h2 className="text-[#767676] font-semibold text-xl ml-2.5 mt-[25px]">Add Alert Rule</h2>
        </div>

        {/* Form */}
        <div className="py-2.5 flex flex-col gap-3 w-full">
          {/* Rule Name */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[146px]">
              <span className="text-[#767676] font-medium text-sm">Rule Name</span>
            </div>
            <input
              type="text"
              value={formData.ruleName}
              onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
              placeholder="Enter rule name"
              className="bg-[#EBEBF1] rounded-lg opacity-60 px-4 py-2.5 w-[240px] text-[#505050] font-medium text-xs placeholder:opacity-60 outline-none"
            />
          </div>

          {/* Metric Type */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[146px]">
              <span className="text-[#767676] font-medium text-sm">Metric type</span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg opacity-60 px-4 py-2.5 w-[240px] flex items-center gap-1.5">
              <select
                value={formData.metricType}
                onChange={(e) => setFormData({ ...formData, metricType: e.target.value as MetricType })}
                className="bg-transparent text-[#505050] font-medium text-xs w-full opacity-60 outline-none cursor-pointer"
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

          {/* Info Threshold */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[146px]">
              <span className="text-[#767676] font-medium text-sm">Info Threshold</span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg opacity-60 px-4 py-2.5 w-[240px] flex items-center gap-1.5">
              <input
                type="number"
                value={formData.infoThreshold}
                onChange={(e) => setFormData({ ...formData, infoThreshold: e.target.value })}
                placeholder="Enter info threshold value"
                className="bg-transparent text-[#505050] font-medium text-xs w-[182px] opacity-60 outline-none"
              />
              <span className="text-[#505050] font-medium text-xs opacity-60 min-w-[40px] text-right">
                {unit}
              </span>
            </div>
          </div>

          {/* Warning Threshold */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[146px]">
              <span className="text-[#767676] font-medium text-sm">Warning Threshold</span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg opacity-60 px-4 py-2.5 w-[240px] flex items-center gap-1.5">
              <input
                type="number"
                value={formData.warningThreshold}
                onChange={(e) => setFormData({ ...formData, warningThreshold: e.target.value })}
                placeholder="Enter warning threshold value"
                className="bg-transparent text-[#505050] font-medium text-xs w-[182px] opacity-60 outline-none"
              />
              <span className="text-[#505050] font-medium text-xs opacity-60 min-w-[40px] text-right">
                {unit}
              </span>
            </div>
          </div>

          {/* High Threshold */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[146px]">
              <span className="text-[#767676] font-medium text-sm">High Threshold</span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg opacity-60 px-4 py-2.5 w-[240px] flex items-center gap-1.5">
              <input
                type="number"
                value={formData.highThreshold}
                onChange={(e) => setFormData({ ...formData, highThreshold: e.target.value })}
                placeholder="Enter high threshold value"
                className="bg-transparent text-[#505050] font-medium text-xs w-[182px] opacity-60 outline-none"
              />
              <span className="text-[#505050] font-medium text-xs opacity-60 min-w-[40px] text-right">
                {unit}
              </span>
            </div>
          </div>

          {/* Critical Threshold */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5 w-[146px]">
              <span className="text-[#767676] font-medium text-sm">Critical Threshold</span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg opacity-60 px-4 py-2.5 w-[240px] flex items-center gap-1.5">
              <input
                type="number"
                value={formData.criticalThreshold}
                onChange={(e) => setFormData({ ...formData, criticalThreshold: e.target.value })}
                placeholder="Enter critical threshold value"
                className="bg-transparent text-[#505050] font-medium text-xs w-[182px] opacity-60 outline-none"
              />
              <span className="text-[#505050] font-medium text-xs opacity-60 min-w-[40px] text-right">
                {unit}
              </span>
            </div>
          </div>

          {/* Cooldown (seconds) */}
          <div className="px-2.5 flex items-center gap-2.5 self-stretch">
            <div className="p-2.5">
              <span className="text-[#767676] font-medium text-sm">Cooldown (seconds)</span>
            </div>
            <div className="bg-[#EBEBF1] rounded-lg opacity-60 px-4 py-2.5 w-[240px] flex items-center gap-1.5">
              <input
                type="number"
                value={formData.cooldownSeconds}
                onChange={(e) => setFormData({ ...formData, cooldownSeconds: e.target.value })}
                placeholder="Minimum time between duplicate alerts"
                className="bg-transparent text-[#505050] font-medium text-xs w-[154px] opacity-60 outline-none"
              />
              <span className="text-[#505050] font-medium text-xs opacity-60 text-right">seconds</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="border-t border-[#EBEBF1] pt-5 pb-3 flex gap-3 justify-end w-[416px] h-[70px]">
            <button
              onClick={onClose}
              className="border border-[#EBEBF1] rounded-lg px-4 py-2.5 hover:bg-gray-50"
            >
              <span className="text-[#808080] font-semibold text-xs text-center">Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              className="border border-[#0492F4] rounded-lg px-4 py-2.5 hover:bg-blue-50"
            >
              <span className="text-[#0492F4] font-semibold text-xs text-center">Add Rule</span>
            </button>
          </div>
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
    </>
  );
};