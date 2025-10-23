import type { SortField, SortDirection } from '@/entities/alert/model/types';

interface AlertTableHeaderProps {
  allChecked: boolean;
  onToggleAll: () => void;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const AlertTableHeader = ({
  allChecked,
  onToggleAll,
  sortField,
  sortDirection,
  onSort,
}: AlertTableHeaderProps) => {
  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;
    const rotation = isActive && sortDirection === 'desc' ? 'rotate-180' : '';

    return (
      <svg
        className={`w-3 h-3 transition-transform ${rotation} ${
          isActive ? 'opacity-100' : 'opacity-40'
        }`}
        viewBox="0 0 12 12"
        fill="none"
      >
        <path d="M6 2L9 8H3L6 2Z" fill="currentColor" />
      </svg>
    );
  };

  const sortableHeaders: { label: string; field: SortField; width: string }[] = [
    { label: 'Alert Level', field: 'level', width: 'w-[110px]' },
    { label: 'Agent Name', field: 'agentName', width: 'w-[180px]' },
    { label: 'Container Name', field: 'containerName', width: 'w-[180px]' },
    { label: 'Timestamp', field: 'timestamp', width: 'w-[150px]' },
    { label: 'Is Read', field: 'isRead', width: 'w-[100px]' },
    { label: 'Duration', field: 'duration', width: 'w-[150px]' },
  ];

  return (
    <div className="bg-[#EBEBF1] rounded-lg py-2.5 px-4 flex items-center h-[60px]">
      {/* Check All */}
      <div className="w-20 px-2.5 flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={onToggleAll}
          className="w-[18px] h-[18px] cursor-pointer"
        />
        <span className="text-[#767676] font-medium text-sm">Check</span>
      </div>

      {/* Alert Level - Sortable */}
      <div className={`${sortableHeaders[0].width} px-2.5`}>
        <button
          onClick={() => onSort('level')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-[#767676] font-medium text-sm">Alert Level</span>
          <SortIcon field="level" />
        </button>
      </div>

      {/* Metric Type - Not sortable */}
      <div className="w-[120px] px-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[#767676] font-medium text-sm">Metric type</span>
          <svg className="w-3 h-3 opacity-40" viewBox="0 0 12 12" fill="none">
            <path d="M6 2L9 8H3L6 2Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Agent Name - Sortable */}
      <div className={`${sortableHeaders[1].width} px-2.5`}>
        <button
          onClick={() => onSort('agentName')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-[#767676] font-medium text-sm">Agent Name</span>
          <SortIcon field="agentName" />
        </button>
      </div>

      {/* Container Name - Sortable */}
      <div className={`${sortableHeaders[2].width} px-2.5`}>
        <button
          onClick={() => onSort('containerName')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-[#767676] font-medium text-sm">Container Name</span>
          <SortIcon field="containerName" />
        </button>
      </div>

      {/* Message - Not sortable */}
      <div className="w-[650px] px-2.5">
        <span className="text-[#767676] font-medium text-sm">Message</span>
      </div>

      {/* Timestamp - Sortable */}
      <div className={`${sortableHeaders[3].width} px-2.5 flex justify-center`}>
        <button
          onClick={() => onSort('timestamp')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-[#767676] font-medium text-sm">Timestamp</span>
          <SortIcon field="timestamp" />
        </button>
      </div>

      {/* Is Read - Sortable */}
      <div className={`${sortableHeaders[4].width} px-2.5 flex justify-center`}>
        <button
          onClick={() => onSort('isRead')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-[#767676] font-medium text-sm">Is Read</span>
          <SortIcon field="isRead" />
        </button>
      </div>

      {/* Duration - Sortable */}
      <div className={`${sortableHeaders[5].width} px-2.5 flex justify-center`}>
        <button
          onClick={() => onSort('duration')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-[#767676] font-medium text-sm">Duration</span>
          <SortIcon field="duration" />
        </button>
      </div>
    </div>
  );
};
