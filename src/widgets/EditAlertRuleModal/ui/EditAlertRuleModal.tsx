import { useState, useEffect } from 'react';
import type { AlertRule, MetricType } from '@/entities/alertRule/model/types';
import { METRIC_TYPES } from '@/entities/alertRule/model/constants';

interface EditAlertRuleModalProps {
  rule: AlertRule;
  onClose: () => void;
  onEditRule: (
    id: string,
    updatedRule: {
      ruleName: string;
      metricType: MetricType;
      infoThreshold: number;
      warningThreshold: number;
      highThreshold: number;
      criticalThreshold: number;
      cooldownSeconds: number;
      checkInterval: number;
    }
  ) => void;
}

export const EditAlertRuleModal = ({
  rule,
  onClose,
  onEditRule,
}: EditAlertRuleModalProps) => {
  const [formData, setFormData] = useState({
    ruleName: '',
    metricType: '' as MetricType | '',
    infoThreshold: '',
    warningThreshold: '',
    highThreshold: '',
    criticalThreshold: '',
    cooldownSeconds: '',
    checkInterval: '',
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
        checkInterval: String(rule.checkInterval),
      });
    }
  }, [rule]);

  const handleSubmit = () => {
    if (
      !formData.ruleName ||
      !formData.metricType ||
      !formData.infoThreshold ||
      !formData.warningThreshold ||
      !formData.highThreshold ||
      !formData.criticalThreshold ||
      !formData.cooldownSeconds ||
      !formData.checkInterval
    ) {
      alert('Please fill in all fields');
      return;
    }

    onEditRule(rule.id, {
      ruleName: formData.ruleName,
      metricType: formData.metricType as MetricType,
      infoThreshold: Number(formData.infoThreshold),
      warningThreshold: Number(formData.warningThreshold),
      highThreshold: Number(formData.highThreshold),
      criticalThreshold: Number(formData.criticalThreshold),
      cooldownSeconds: Number(formData.cooldownSeconds),
      checkInterval: Number(formData.checkInterval),
    });

    onClose();
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
    </div>
  );
};