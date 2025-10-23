import React, { useState } from 'react';
import type { FilterState } from '@/shared/types/container';
import { stateConfig, healthConfig } from '@/entities/container/model/constants';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  availableAgents: string[];
  availableStates: string[];
  availableHealths: string[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableAgents,
  availableStates,
  availableHealths
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      agentName: [],
      state: [],
      health: [],
      favoriteOnly: false
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const toggleArrayFilter = (key: 'agentName' | 'state' | 'health', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Favorite Only */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={localFilters.favoriteOnly}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, favoriteOnly: e.target.checked }))}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Show favorites only</span>
            </label>
          </div>

          {/* Agent Name */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Agent Name</h4>
            <div className="space-y-2">
              {availableAgents.map(agent => (
                <label key={agent} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localFilters.agentName.includes(agent)}
                    onChange={() => toggleArrayFilter('agentName', agent)}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-600">{agent}</span>
                </label>
              ))}
            </div>
          </div>

          {/* state */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">state</h4>
            <div className="space-y-2">
              {availableStates.map(state => (
                <label key={state} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localFilters.state.includes(state)}
                    onChange={() => toggleArrayFilter('state', state)}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stateConfig[state as keyof typeof stateConfig]?.color || 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-600">{stateConfig[state as keyof typeof stateConfig]?.label || state}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Health */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Health</h4>
            <div className="space-y-2">
              {availableHealths.map(health => (
                <label key={health} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localFilters.health.includes(health)}
                    onChange={() => toggleArrayFilter('health', health)}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${healthConfig[health as keyof typeof healthConfig]?.color || 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-600">{healthConfig[health as keyof typeof healthConfig]?.label || health}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};