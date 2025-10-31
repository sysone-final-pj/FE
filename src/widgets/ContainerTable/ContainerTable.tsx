import React, { useState, useMemo } from 'react';
import type { ContainerData, FilterState, SortField, SortDirection } from '@/shared/types/container';
import { SortIcon } from '@/shared/ui/SortIcon/SortIcon';
import { TableRow } from '@/entities/container/ui/TableRow';
import { SearchBar } from './ui/SearchBar';
import { FilterButton } from './ui/FilterButton';
import { FilterModal } from './ui/FilterModal';

interface ContainerTableProps {
  containers: ContainerData[];
  onContainersChange: (containers: ContainerData[]) => void;
  checkedIds?: string[];
  onCheckedIdsChange?: (ids: string[]) => void;
}

export const ContainerTable: React.FC<ContainerTableProps> = ({
  containers,
  onContainersChange,
  checkedIds = [],
  onCheckedIdsChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    agentName: [],
    state: [],
    health: [],
    favoriteOnly: false
  });

  const checkedIdsSet = useMemo(() => new Set(checkedIds), [checkedIds]);

  const handleToggleFavorite = (id: string) => {
    const updated = containers.map(c =>
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    onContainersChange(updated);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === 'asc'
          ? 'desc'
          : sortDirection === 'desc'
            ? null
            : 'asc'
      );
      if (sortDirection === 'desc') setSortField(null);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCheckChange = (id: string, checked: boolean) => {
    if (!onCheckedIdsChange) return;
    const newIds = checked
      ? [...checkedIds, id]
      : checkedIds.filter(cid => cid !== id);
    onCheckedIdsChange(newIds);
  };

  const handleCheckAll = (checked: boolean) => {
    if (!onCheckedIdsChange) return;
    onCheckedIdsChange(checked ? filteredData.map(c => c.id) : []);
  };

  const filteredData = useMemo(() => {
    let result = [...containers];

    if (searchQuery) {
      result = result.filter(c =>
        c.containerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.containerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.agentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.favoriteOnly) {
      result = result.filter(c => c.isFavorite);
    }

    if (filters.agentName.length > 0) {
      result = result.filter(c => filters.agentName.includes(c.agentName));
    }

    if (filters.state.length > 0) {
      result = result.filter(c => filters.state.includes(c.state));
    }

    if (filters.health.length > 0) {
      result = result.filter(c => filters.health.includes(c.health));
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [containers, searchQuery, sortField, sortDirection, filters]);

  const availableAgents = useMemo(
    () => Array.from(new Set(containers.map(c => c.agentName))).sort(),
    [containers]
  );
  const availableStates = useMemo(
    () => Array.from(new Set(containers.map(c => c.state))).sort(),
    [containers]
  );
  const availableHealths = useMemo(
    () => Array.from(new Set(containers.map(c => c.health))).sort(),
    [containers]
  );

  const activeFilterCount =
    (filters.favoriteOnly ? 1 : 0) +
    filters.agentName.length +
    filters.state.length +
    filters.health.length;

  const allChecked = filteredData.length > 0 && filteredData.every(c => checkedIdsSet.has(c.id));
  const someChecked = filteredData.some(c => checkedIdsSet.has(c.id)) && !allChecked;

  return (
    <div className="w-full">
      {/* 검색 & 필터 */}
      <div className="flex items-center justify-end gap-3 mb-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterButton
          onClick={() => setIsFilterOpen(true)}
          activeCount={activeFilterCount}
        />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#e5e5ec]">
        <table className="w-full border-collapse">
          <thead className="bg-[#ffffff] border-b border-[#e5e5ec] sticky top-0 z-10">
            <tr className="h-[45px]">
              {/* ⭐ Favorite */}
              <th className="w-[45px] text-center pt-6 pr-3 pb-3 pl-3">
                <button
                  onClick={() => {
                    const updated = containers.map(c => ({
                      ...c,
                      isFavorite: !c.isFavorite
                    }));
                    onContainersChange(updated);
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="#FFE171"
                    stroke="#FFE171"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              </th>

              {/* 컬럼 헤더들 (ListBox 스타일 반영) */}
              {
                [
                  { key: 'agentName', label: 'Agent Name', width: 'w-[150px]', align: 'text-left' },
                  { key: 'containerId', label: 'Container ID', width: 'w-[140px]', align: 'text-left' },
                  { key: 'containerName', label: 'Container Name', width: 'w-[190px]', align: 'text-left' },
                  { key: 'cpuPercent', label: <>CPU<span className="text-[#767676]">(%)</span></>, width: 'w-[110px]', align: 'text-center' },
                  { key: 'memoryUsed', label: <>Memory<span className="text-[#767676]">(Current / Max)</span></>, width: 'w-[200px]', align: 'text-center' },
                  { key: 'storageUsed', label: <>Storage<span className="text-[#767676]">(Current / Max)</span></>, width: 'w-[220px]', align: 'text-center' },
                  { key: 'networkRx', label: <>Network<span className="text-[#767676] ">(Rx / Tx)</span></>, width: 'w-[200px]', align: 'text-center' },
                  { key: 'state', label: 'State', width: 'w-[120px]', align: 'text-left' },
                  { key: 'health', label: 'Health', width: 'w-[120px]', align: 'text-left' }
                ].map(({ key, label, width, align }) => (
                  <th
                    key={key}
                    className={`${width} ${align} pt-5 pr-3 pb-3 pl-3 text-[#333333] text-sm font-medium cursor-pointer hover:bg-[#f8f8fa]`}
                    onClick={() => handleSort(key as SortField)}
                  >
                    <div
                      className={`flex items-center ${align === 'text-center'
                        ? 'justify-center'
                        : 'justify-start'
                        } gap-2.5`}
                    >
                      {label}
                      <SortIcon
                        direction={sortField === key ? sortDirection : null}
                      />
                    </div>
                  </th>
                ))}

              {/* Check */}
              <th className="w-[73px] text-center pt-3 pr-9 pb-3 pl-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(input) => {
                    if (input) input.indeterminate = someChecked;
                  }}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded cursor-pointer"
                />
              </th>
            </tr>
          </thead>
        </table>

        {/* Body */}
        <div className="max-h-[282px] overflow-y-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse table-fixed">
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map(c => (
                    <TableRow
                      key={c.id}
                      data={c}
                      onToggleFavorite={handleToggleFavorite}
                      isChecked={checkedIdsSet.has(c.id)}
                      onCheckChange={handleCheckChange}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      No containers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <FilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onApplyFilters={setFilters}
          availableAgents={availableAgents}
          availableStates={availableStates}
          availableHealths={availableHealths}
        />
      </div>
    </div>
  );
};
