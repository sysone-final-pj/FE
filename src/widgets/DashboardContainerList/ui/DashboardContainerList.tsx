import { useMemo } from 'react';
import { ContainerMiniCard } from '@/entities/container/ui/DashboardMiniCard';
import { DashboardSortDropdown } from '@/features/dashboard/ui/DashboardSortDropdown';
import type { DashboardContainerCard } from '@/entities/container/model/types';

interface DashboardContainerListProps {
  containers: DashboardContainerCard[];
  onFilterClick: () => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  sortBy: 'favorite' | 'name' | 'cpu' | 'memory';
  onSortChange: (sort: 'favorite' | 'name' | 'cpu' | 'memory') => void;
}

// CPU/Memory 문자열에서 숫자 추출 (예: "15%" -> 15, "2.1 GB" -> 2.1)
const parseNumericValue = (value: string): number => {
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

export const DashboardContainerList = ({
  containers,
  onFilterClick,
  selectedIds = [],
  onToggleSelect,
  sortBy,
  onSortChange,
}: DashboardContainerListProps) => {

  // 정렬된 컨테이너 리스트
  const sortedContainers = useMemo(() => {
    const sorted = [...containers];

    switch (sortBy) {
      case 'favorite':
        return sorted.sort((a, b) => {
          // favorite를 먼저 정렬 (true가 앞으로)
          if (a.isFavorite === b.isFavorite) return 0;
          return a.isFavorite ? -1 : 1;
        });

      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'cpu':
        return sorted.sort((a, b) => {
          const cpuA = parseNumericValue(a.cpu);
          const cpuB = parseNumericValue(b.cpu);
          return cpuB - cpuA; // 내림차순 (높은 것이 위로)
        });

      case 'memory':
        return sorted.sort((a, b) => {
          const memA = parseNumericValue(a.memory);
          const memB = parseNumericValue(b.memory);
          return memB - memA; // 내림차순 (높은 것이 위로)
        });

      default:
        return sorted;
    }
  }, [containers, sortBy]);

  return (
    <div className="bg-white rounded-xl border border-border-light p-6 w-[925px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-700 font-pretendard font-semibold text-xl tracking-tight">
          Container List
        </h2>

        <div className="flex items-center gap-2">
          <DashboardSortDropdown value={sortBy} onChange={onSortChange} />

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
        style={{ gridAutoRows: '96px' }}
      >
        {sortedContainers.map((container) => (
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
