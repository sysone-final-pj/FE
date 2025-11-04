// 파일 위치: widgets/DashboardFiltersModal/ui/DashboardFiltersModal.tsx

import { useState } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import { DashboardFilterSection } from '@/features/dashboard/ui/DashboardFilterSection';
import type { DashboardFilters } from '@/features/dashboard/model/filterTypes';

interface DashboardFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DashboardFilters;
  onApply: (filters: DashboardFilters) => void;
}

export const DashboardFiltersModal = ({ 
  isOpen, 
  onClose, 
  filters: initialFilters,
  onApply 
}: DashboardFiltersModalProps) => {
  const [filters, setFilters] = useState(initialFilters);

  const totalSelected = [
    ...filters.quickFilters,
    ...filters.agentNames,
    ...filters.states,
    ...filters.healthy
  ].filter(opt => opt.checked).length;

  const handleToggle = (section: keyof DashboardFilters, id: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: prev[section].map(opt =>
        opt.id === id ? { ...opt, checked: !opt.checked } : opt
      )
    }));
  };

  const handleReset = () => {
    setFilters({
      quickFilters: filters.quickFilters.map(opt => ({ ...opt, checked: false })),
      agentNames: filters.agentNames.map(opt => ({ ...opt, checked: false })),
      states: filters.states.map(opt => ({ ...opt, checked: false })),
      healthy: filters.healthy.map(opt => ({ ...opt, checked: false })),
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white w-[280px] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-2.5 px-4 flex items-center gap-2 flex-wrap">
          <span className="text-gray-700 font-pretendard font-medium text-xs tracking-tight">
            Select Filters
          </span>
          <span className="text-gray-700 font-pretendard font-medium text-xs tracking-tight">
            ({totalSelected.toString().padStart(2, '0')})
          </span>
          <svg 
            width="15" 
            height="15" 
            viewBox="0 0 15 15"
            className="ml-auto"
          >
            <path 
              d="M3.75 5.625L7.5 9.375L11.25 5.625" 
              stroke="#999" 
              strokeWidth="1.5" 
              fill="none"
            />
          </svg>
          <button
            onClick={handleReset}
            className="bg-gray-100 rounded-lg py-2.5 px-4 hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-700 font-pretendard font-medium text-xs tracking-tight">
              Filter reset
            </span>
          </button>
        </div>

        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto">
          <DashboardFilterSection
            title="Quick Filters"
            count={filters.quickFilters.filter(f => f.checked).length}
            options={filters.quickFilters}
            onToggle={(id) => handleToggle('quickFilters', id)}
          />

          <DashboardFilterSection
            title="Agent Name"
            count={filters.agentNames.filter(f => f.checked).length}
            options={filters.agentNames}
            onToggle={(id) => handleToggle('agentNames', id)}
          />

          <DashboardFilterSection
            title="State"
            count={filters.states.filter(f => f.checked).length}
            options={filters.states}
            onToggle={(id) => handleToggle('states', id)}
          />

          <DashboardFilterSection
            title="Healthy"
            count={filters.healthy.filter(f => f.checked).length}
            options={filters.healthy}
            onToggle={(id) => handleToggle('healthy', id)}
          />
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-200 p-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-600 font-pretendard font-medium text-sm">
              Cancel
            </span>
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-500 rounded-lg py-2.5 px-4 hover:bg-blue-600 transition-colors"
          >
            <span className="text-white font-pretendard font-medium text-sm">
              Apply
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
