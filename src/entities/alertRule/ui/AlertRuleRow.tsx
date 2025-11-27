/**
 작성자: 김슬기
 */
import type { AlertRule } from '@/entities/alertRule/model/types';
import { Icon } from '@/shared/ui/UiIcon/UiIcon';


interface AlertRuleRowProps {
  rule: AlertRule;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  isLastRow?: boolean;
}

const formatThreshold = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  return `${value}%`;
};


export const AlertRuleRow = ({ rule, onEdit, onDelete, onToggle, isLastRow }: AlertRuleRowProps) => {
  return (
    <tr className="bg-white border-b border-border-light h-[60px] hover:bg-gray-50 transition-colors">
      {/* Rule Name */}
      <td className={`w-[250px] px-4 text-left ${isLastRow ? 'rounded-bl-xl' : ''}`}>
        <span className="text-text-secondary font-medium text-sm">{rule.ruleName}</span>
      </td>

      {/* Metric Type */}
      <td className="w-[110px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">{rule.metricType}</span>
      </td>

      {/* Info Threshold */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">
          {formatThreshold(rule.infoThreshold)}
        </span>
      </td>

      {/* Warning Threshold */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">
          {formatThreshold(rule.warningThreshold)}
        </span>
      </td>

      {/* High Threshold */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">
          {formatThreshold(rule.highThreshold)}
        </span>
      </td>

      {/* Critical Threshold */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">
          {formatThreshold(rule.criticalThreshold)}
        </span>
      </td>

      {/* Cooldown Seconds */}
      <td className="w-[150px] px-4 text-center">
        <span className="text-text-secondary font-medium text-sm">
          {rule.cooldownSeconds}
        </span>
      </td>

      {/* Enabled */}
      <td className="w-[150px] pt-1.5 px-4 text-center">
        <button
          onClick={() => onToggle(rule.id)}
          className={`relative w-14 h-[23px] rounded-full transition-colors ${rule.enabled ? 'bg-[#0492F4]' : 'bg-border-light'
            }`}
        >
          <span
            className={`absolute top-[4px] text-[11px] font-medium ${rule.enabled ? 'left-[11px] text-white' : 'right-[11px] text-tertiary'
              }`}
          >
            {rule.enabled ? 'ON' : 'OFF'}
          </span>
          <div
            className={`absolute top-[3px] w-[17px] h-[17px] bg-white rounded-full transition-all ${rule.enabled ? 'right-[3px]' : 'left-[3px]'
              }`}
          />
        </button>
      </td>

      {/* Operation */}
      <td className={`w-[218px] px-4 text-center ${isLastRow ? 'rounded-br-xl' : ''}`}>
        <div className="flex items-center justify-center gap-4">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(rule.id)}
            className="border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2"
          >
            <Icon name='edit' size={18} className='text-state-high' />
            <span className="text-text-secondary font-medium text-sm">Edit</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(rule.id)}
            className="border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
          >
            <Icon name='delete' size={20} className='text-text-muted' />
            <span className="text-text-secondary font-medium text-sm">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};
