import type { AlertLevel, MetricType } from '@/entities/alert/model/types';
import { ALERT_LEVELS, METRIC_TYPES } from '@/entities/alert/model/constants';
import { TimeFilter, type TimeFilterValue } from '@/shared/ui/TimeFilter/TimeFilter';
import { Icon } from '@/shared/ui/UiIcon/UiIcon';

interface AlertFiltersProps {
  selectedLevel: AlertLevel | 'ALL';
  selectedMetricType: MetricType | 'ALL';
  searchKeyword: string;
  onLevelChange: (level: AlertLevel | 'ALL') => void;
  onMetricTypeChange: (type: MetricType | 'ALL') => void;
  onSearchChange: (keyword: string) => void;
  onTimeFilterSearch: (value: TimeFilterValue) => void;
  onManageRulesClick: () => void;
  onMessageDelete: () => void;
}

export const AlertFilters = ({
  selectedLevel,
  selectedMetricType,
  searchKeyword,
  onLevelChange,
  onMetricTypeChange,
  onSearchChange,
  onTimeFilterSearch,
  onManageRulesClick,
  onMessageDelete,
}: AlertFiltersProps) => {
  return (
    <div className="flex items-center gap-3 pb-5">
      {/* Alert Level Filter */}
      <div className="flex items-center gap-1.5">
        <div className="px-2.5 py-[10px]">
          <span className="text-text-primary font-medium text-sm">Alert Level</span>
        </div>
        <div className="bg-border-light rounded-xl px-4 py-2.5 flex items-center gap-1.5 w-[100px] shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.25)]">
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value as AlertLevel | 'ALL')}
            className="bg-transparent text-text-primary font-medium text-xs w-full opacity-60 outline-none cursor-pointer"
          >
            <option value="ALL">ALL</option>
            {ALERT_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Type Filter */}
      <div className="flex items-center gap-1.5">
        <div className="px-2.5 py-[10px]">
          <span className="text-text-primary font-medium text-sm">Metric type</span>
        </div>
        <div className="bg-border-light rounded-xl px-4 py-2.5 flex items-center gap-1.5 w-[100px] shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.25)]">
          <select
            value={selectedMetricType}
            onChange={(e) => onMetricTypeChange(e.target.value as MetricType | 'ALL')}
            className="bg-transparent text-text-primary font-medium text-xs w-full opacity-60 outline-none cursor-pointer"
          >
            <option value="ALL">ALL</option>
            {METRIC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-[#C9C9D9]" />

      {/* Time Filter */}
      <TimeFilter onSearch={onTimeFilterSearch} />

      {/* Divider */}
      <div className="w-px h-4 bg-[#C9C9D9]" />

      {/* Search */}
      <div className="w-[260px] px-2.5">
        <div className="bg-border-light rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.25)]">
          <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="none">
            <path
              d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
              stroke="#505050"
              strokeWidth="1.5"
            />
            <path d="M11.5 11.5L15 15" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search Messages..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent text-text-primary font-medium text-xs opacity-60 outline-none w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 ml-auto">
        <button
          onClick={onManageRulesClick}
          className="bg-white border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
        >
          {/* <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3.33334V16.6667M10 16.6667L15 11.6667M10 16.6667L5 11.6667"
              stroke="#767676"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg> */}
          <span className="text-text-secondary font-medium text-sm">Manage Alert Rules</span>
        </button>
        <button
          onClick={onMessageDelete}
          className="bg-white border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
          <Icon name='delete' size={20} className='text-text-muted' />

          <span className="text-text-secondary font-medium text-sm">Delete</span>
        </button>
      </div>
    </div>
  );
};
