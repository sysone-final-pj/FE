import { useState } from 'react';
import type { MetricType } from '@/entities/alertRule/model/types';
import { METRIC_TYPES } from '@/entities/alertRule/model/constants';

interface AddAlertRuleModalProps {
  onClose: () => void;
  onAddRule: (rule: {
    ruleName: string;
    metricType: MetricType;
    infoThreshold: number;
    warningThreshold: number;
    highThreshold: number;
    criticalThreshold: number;
    cooldownSeconds: number;
    checkInterval: number;
  }) => void;
}

export const AddAlertRuleModal = ({ onClose, onAddRule }: AddAlertRuleModalProps) => {
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

    onAddRule({
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
              placeholder="Enter warning threshold value"
              className="bg-transparent text-[#505050] font-medium text-xs w-[182px] opacity-60 outline-none"
            />
            <span className="text-[#505050] font-medium text-xs opacity-60 w-[15px] text-right">ms</span>
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
            <span className="text-[#505050] font-medium text-xs opacity-60 w-[15px] text-right">ms</span>
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
            <span className="text-[#505050] font-medium text-xs opacity-60 w-[15px] text-right">ms</span>
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
            <span className="text-[#505050] font-medium text-xs opacity-60 w-[15px] text-right">ms</span>
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
            className="border border-[#EBEBF1] rounded-lg px-4 py-2.5"
          >
            <span className="text-[#999999] font-semibold text-xs text-center">Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            className="border border-[#EBEBF1] rounded-lg px-4 py-2.5"
          >
            <span className="text-[#767676] font-semibold text-xs text-center">Add Rule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
