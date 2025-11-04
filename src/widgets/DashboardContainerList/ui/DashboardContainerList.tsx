import { useState } from 'react';
import { ContainerMiniCard } from '@/entities/container/ui/DashboardMiniCard';
import { DashboardSortDropdown } from '@/features/dashboard/ui/DashboardSortDropdown';
import type { DashboardContainerCard } from '@/entities/container/model/types';

interface DashboardContainerListProps {
  containers: DashboardContainerCard[];
  onFilterClick: () => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export const DashboardContainerList = ({
  containers,
  onFilterClick,
  selectedIds = [],
  onToggleSelect,
}: DashboardContainerListProps) => {
  const [sortBy, setSortBy] = useState<
    'name' | 'cpu' | 'memory' | 'state' | 'healthy'
  >('name');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-[925px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-700 font-pretendard font-semibold text-xl tracking-tight">
          Container List
        </h2>

        <div className="flex items-center gap-2">
          <DashboardSortDropdown value={sortBy} onChange={setSortBy} />

          <button
            onClick={onFilterClick}
            className="bg-white rounded-lg border border-gray-300 py-2.5 px-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4H14M4 8H12M6 12H10"
                stroke="#767676"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-gray-500 font-pretendard font-medium text-sm tracking-tight">
              Filters
            </span>
          </button>
        </div>
      </div>

      <div
        className="
          bg-[#f7f7f7] rounded-xl p-[10px]
          grid grid-cols-5 gap-2
          w-[877px] h-[630px]
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-rounded
        "
      >
        {containers.map((container) => (
          <ContainerMiniCard
            key={container.id}
            container={container}
            selected={selectedIds.includes(container.id)}
            onClick={() => onToggleSelect?.(container.id)}
          />
        ))}
      </div>
    </div>
  );
};
