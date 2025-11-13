import type { AlertRule } from '@/entities/alertRule/model/types';

interface AlertRuleRowProps {
  rule: AlertRule;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const AlertRuleRow = ({ rule, onEdit, onDelete, onToggle }: AlertRuleRowProps) => {
  return (
    <tr className="bg-white border-b border-border-light h-[60px] hover:bg-gray-50 transition-colors">
      {/* Rule Name */}
      <td className="w-[250px] px-4 text-left">
        <span className="text-text-secondary font-medium text-sm">{rule.ruleName}</span>
      </td>

      {/* Metric Type */}
      <td className="w-[110px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">{rule.metricType}</span>
      </td>

      {/* Info Threshold */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">{rule.infoThreshold}%</span>
      </td>

      {/* Warning Threshold */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">{rule.warningThreshold}%</span>
      </td>

      {/* High Threshold */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">{rule.highThreshold}%</span>
      </td>

      {/* Critical Threshold */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">{rule.criticalThreshold}%</span>
      </td>

      {/* Cooldown Seconds */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">{rule.cooldownSeconds}</span>
      </td>

      {/* Enabled */}
      <td className="w-[150px] pt-1.5 px-4 text-center">
        <button
          onClick={() => onToggle(rule.id)}
          className={`relative w-14 h-[23px] rounded-full transition-colors ${
            rule.enabled ? 'bg-[#0492F4]' : 'bg-[#EBEBF1]'
          }`}
        >
          <span
            className={`absolute top-[4px] text-[11px] font-medium ${
              rule.enabled ? 'left-[11px] text-white' : 'right-[11px] text-tertiary'
            }`}
          >
            {rule.enabled ? 'ON' : 'OFF'}
          </span>
          <div
            className={`absolute top-[3px] w-[17px] h-[17px] bg-white rounded-full transition-all ${
              rule.enabled ? 'right-[3px]' : 'left-[3px]'
            }`}
          />
        </button>
      </td>

      {/* Operation */}
      <td className="w-[218px] px-4 text-center">
        <div className="flex items-center justify-center gap-4">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(rule.id)}
            className="border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M14.1667 2.49993C14.3856 2.28106 14.6454 2.10744 14.9314 1.98899C15.2173 1.87054 15.5238 1.80957 15.8334 1.80957C16.1429 1.80957 16.4494 1.87054 16.7353 1.98899C17.0213 2.10744 17.2811 2.28106 17.5 2.49993C17.7189 2.7188 17.8925 2.97863 18.011 3.2646C18.1294 3.55057 18.1904 3.85706 18.1904 4.16659C18.1904 4.47612 18.1294 4.78262 18.011 5.06859C17.8925 5.35455 17.7189 5.61439 17.5 5.83326L6.25002 17.0833L1.66669 18.3333L2.91669 13.7499L14.1667 2.49993Z"
                stroke="#F47823"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-text-secondary font-medium text-sm">Edit</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(rule.id)}
            className="border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none">
              <path
                d="M2.25 4.5H3.75H15.75"
                stroke="#767676"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z"
                stroke="#767676"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-text-secondary font-medium text-sm">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};
