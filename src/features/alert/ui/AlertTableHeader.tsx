/**
 작성자: 김슬기
 */
import type { SortField, SortDirection } from '@/entities/alert/model/types';
import { SortIcon } from '@/shared/ui/SortIcon/SortIcon';

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

  const sortableHeaders: { label: string; field: SortField; width: string }[] = [
    { label: 'Alert Level', field: 'alertLevel', width: 'w-[110px]' },
    { label: 'Metric Type', field: 'metricType', width: 'w-[120px]' },
    { label: 'Agent Name', field: 'agentName', width: 'w-[180px]' },
    { label: 'Container Name', field: 'containerName', width: 'w-[180px]' },
    { label: 'Message', field: 'message', width: 'w-[530px]' },
    { label: 'CollectionTime', field: 'collectedAt', width: 'w-[150px]' },
    { label: 'Sent At', field: 'createdAt', width: 'w-[150px]' },
    { label: 'Read', field: 'read', width: 'w-[100px]' },
    { label: 'Duration', field: 'duration', width: 'w-[150px]' },
  ];

  return (
    <div className="bg-border-light rounded-lg py-2.5 px-4 flex items-center h-[60px]">
      {/* Check All */}
      <div className="w-50 px-2.5 flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={onToggleAll}
          className="w-[18px] h-[18px] cursor-pointer"
        />
      </div>

      {/* Alert Level - Sortable */}
      <div className={`${sortableHeaders[0].width} px-2.5`}>
        <button
          onClick={() => onSort('alertLevel')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Alert Level</span>
          <SortIcon direction={sortField === 'alertLevel' ? sortDirection : null} />
        </button>
      </div>

      {/* Metric Type - sortable */}
      <div className={`${sortableHeaders[1].width} px-2.5`}>
        <button
          onClick={() => onSort('metricType')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Metric Type</span>
          <SortIcon direction={sortField === 'metricType' ? sortDirection : null} />
        </button>
      </div>


      {/* Agent Name - Sortable */}
      <div className={`${sortableHeaders[2].width} px-2.5`}>
        <button
          onClick={() => onSort('agentName')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Agent Name</span>
          <SortIcon direction={sortField === 'agentName' ? sortDirection : null} />
        </button>
      </div>

      {/* Container Name - Sortable */}
      <div className={`${sortableHeaders[3].width} px-2.5`}>
        <button
          onClick={() => onSort('containerName')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Container Name</span>
          <SortIcon direction={sortField === 'containerName' ? sortDirection : null} />
        </button>
      </div>

      {/* Message - sortable */}
      <div className={`${sortableHeaders[4].width} px-2.5`}>
        <button
          onClick={() => onSort('message')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Message</span>
          <SortIcon direction={sortField === 'message' ? sortDirection : null} />
        </button>
      </div>

      {/* Collection Time - Sortable */}
      <div className={`${sortableHeaders[5].width} px-2.5 flex justify-center`}>
        <button
          onClick={() => onSort('collectedAt')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Collection Time</span>
          <SortIcon direction={sortField === 'collectedAt' ? sortDirection : null} />
        </button>
      </div>

      {/* sentAt - Sortable */}
      <div className={`${sortableHeaders[6].width} px-2.5 flex justify-center`}>
        <button
          onClick={() => onSort('createdAt')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Sent At</span>
          <SortIcon direction={sortField === 'createdAt' ? sortDirection : null} />
        </button>
      </div>

      {/* Read - Sortable */}
      <div className={`${sortableHeaders[7].width} px-2.5 flex justify-center`}>
        <button
          onClick={() => onSort('read')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Read</span>
          <SortIcon direction={sortField === 'read' ? sortDirection : null} />
        </button>
      </div>

      {/* Duration - Sortable */}
      <div className={`${sortableHeaders[8].width} px-2.5 flex justify-center`}>
        <button
          onClick={() => onSort('duration')}
          className="flex items-center gap-2.5 hover:opacity-70"
        >
          <span className="text-text-secondary font-medium text-sm">Duration</span>
          <SortIcon direction={sortField === 'duration' ? sortDirection : null} />
        </button>
      </div>
    </div>
  );
};
