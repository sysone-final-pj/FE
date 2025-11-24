import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
          w-[877px] h-[630px]
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-rounded
        "
      >
        {containers.length === 0 ? (
          // 빈 상태 UI
          <div className="flex flex-col items-center justify-center h-full gap-4">
            {/* 아이콘 */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-400"
            >
              <path
                d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11z"
                fill="currentColor"
              />
            </svg>

            {/* 메시지 */}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">
                실행된 Agent가 없습니다.
              </p>
              <p className="text-sm font-medium text-gray-500 mt-2">
                상세 정보는 Manage Containers 페이지를 확인해 주세요
              </p>
            </div>

            {/* 버튼 */}
            <button
              onClick={() => navigate('/containers')}
              className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-pretendard font-medium text-sm"
            >
              Manage Containers로 이동
            </button>
          </div>
        ) : (
          // 기존 컨테이너 리스트
          <div
            className="grid grid-cols-5 gap-2"
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
        )}
      </div>
    </div>
  );
};
