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

  // checkedIds를 Set으로 변환 (빠른 조회를 위해)
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
        sortDirection === 'asc' ? 'desc' : 
        sortDirection === 'desc' ? null : 'asc'
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

  const availableAgents = useMemo(() => 
    Array.from(new Set(containers.map(c => c.agentName))).sort(), 
    [containers]
  );

  const availableStates = useMemo(() => 
    Array.from(new Set(containers.map(c => c.state))).sort(), 
    [containers]
  );

  const availableHealths = useMemo(() => 
    Array.from(new Set(containers.map(c => c.health))).sort(), 
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-white border-b sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-sm font-medium">⭐</th>
              <th 
                className="px-3 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('agentName')}
              >
                <div className="flex items-center">
                  Agent Name 
                  <SortIcon direction={sortField === 'agentName' ? sortDirection : null} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('containerId')}
              >
                <div className="flex items-center">
                  Container ID
                  <SortIcon direction={sortField === 'containerId' ? sortDirection : null} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('containerName')}
              >
                <div className="flex items-center">
                  Container Name
                  <SortIcon direction={sortField === 'containerName' ? sortDirection : null} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-center text-sm font-medium cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('cpuPercent')}
              >
                <div className="flex items-center justify-center">
                  CPU (%)
                  <SortIcon direction={sortField === 'cpuPercent' ? sortDirection : null} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-center text-sm font-medium cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('memoryUsed')}
              >
                <div className="flex items-center justify-center">
                  Memory
                  <SortIcon direction={sortField === 'memoryUsed' ? sortDirection : null} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-center text-sm font-medium cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('storageUsed')}
              >
                <div className="flex items-center justify-center">
                  Storage
                  <SortIcon direction={sortField === 'storageUsed' ? sortDirection : null} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-center text-sm font-medium cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('networkRx')}
              >
                <div className="flex items-center justify-center">
                  Network
                  <SortIcon direction={sortField === 'networkRx' ? sortDirection : null} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-center text-sm font-medium cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('state')}
              >
                <div className="flex items-center justify-center">
                  state
                  <SortIcon direction={sortField === 'state' ? sortDirection : null} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-center text-sm font-medium cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('health')}
              >
                <div className="flex items-center justify-center">
                  Health
                  <SortIcon direction={sortField === 'health' ? sortDirection : null} />
                </div>
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium">
                <input 
                  type="checkbox" 
                  checked={allChecked}
                  ref={(input) => {
                    if (input) input.indeterminate = someChecked;
                  }}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded cursor-pointer"
                  title={allChecked ? "Uncheck all" : "Check all"}
                />
              </th>
            </tr>
          </thead>
        </table>

        <div className="max-h-[282px] overflow-y-auto">
          <table className="w-full">
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
                  <td colSpan={11} className="px-3 py-8 text-center text-gray-500">
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
  );
};