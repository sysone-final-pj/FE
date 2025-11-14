import React, { useState, useEffect } from 'react';
import './FilterModal.css';
import type { FilterState } from '@/shared/types/container';

// Props 타입 정의
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  availableAgents: string[];
  availableStates: string[];
  availableHealths: string[];
}

// 필터 카테고리 타입
type FilterCategory = 'quickFilters' | 'agentName' | 'state' | 'health';

const categoryLabels: Record<FilterCategory, string> = {
  quickFilters: 'Quick Filters',
  agentName: 'Agent Name',
  state: 'State',
  health: 'Health'
};

const categoryIcons: Record<FilterCategory, string> = {
  quickFilters: '⚡',
  agentName: '🧑‍💼',
  state: '📋',
  health: '💚'
};

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableAgents,
  availableStates,
  availableHealths
}) => {
  const [activeTab, setActiveTab] = useState<FilterCategory>('quickFilters');
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // filters prop이 변경되면 localFilters 업데이트
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  // 모달 내에서만 필터 초기화 (모달 닫지 않음)
  const handleReset = () => {
    setLocalFilters({
      quickFilters: localFilters.quickFilters.map(f => ({ ...f, checked: false })),
      agentName: [],
      state: [],
      health: [],
      favoriteOnly: false
    });
  };

  // 필터 초기화하고 적용 후 모달 닫기
  const handleClearAndClose = () => {
    const resetFilters: FilterState = {
      quickFilters: localFilters.quickFilters.map(f => ({ ...f, checked: false })),
      agentName: [],
      state: [],
      health: [],
      favoriteOnly: false
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  // Quick Filter 토글
  const toggleQuickFilter = (id: string) => {
    setLocalFilters(prev => ({
      ...prev,
      quickFilters: prev.quickFilters.map(f =>
        f.id === id ? { ...f, checked: !f.checked } : f
      )
    }));
  };

  // 배열 필터 토글 (agentName, state, health)
  const toggleArrayFilter = (key: 'agentName' | 'state' | 'health', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  // Quick Filter 제거
  const removeQuickFilter = (id: string) => {
    setLocalFilters(prev => ({
      ...prev,
      quickFilters: prev.quickFilters.map(f =>
        f.id === id ? { ...f, checked: false } : f
      )
    }));
  };

  // 배열 필터 제거
  const removeArrayFilter = (key: 'agentName' | 'state' | 'health', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key].filter(v => v !== value)
    }));
  };

  // 총 선택된 필터 개수
  const getTotalSelectedCount = (): number => {
    return (
      localFilters.quickFilters.filter(f => f.checked).length +
      localFilters.agentName.length +
      localFilters.state.length +
      localFilters.health.length
    );
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-modal-header">
          <h2>Filters</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Main Content */}
        <div className="filter-modal-content">
          {/* 1번 영역: Filter Types (탭) */}
          <div className="filter-types">
            <div className="filter-types-label">Filter Types</div>
            {(['quickFilters', 'agentName', 'state', 'health'] as FilterCategory[]).map(category => (
              <button
                key={category}
                className={`filter-tab ${activeTab === category ? 'active' : ''}`}
                onClick={() => setActiveTab(category)}
              >
                <span className="tab-icon">{categoryIcons[category]}</span>
                <span className="tab-label">{categoryLabels[category]}</span>
              </button>
            ))}
          </div>

          {/* 2번 영역: Filter Options (체크박스) */}
          <div className="filter-options">
            {/* Quick Filters */}
            {activeTab === 'quickFilters' && localFilters.quickFilters.map(option => (
              <label key={option.id} className="filter-option">
                <input
                  type="checkbox"
                  checked={option.checked}
                  onChange={() => toggleQuickFilter(option.id)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="option-label">
                  {option.label}
                  {option.count !== undefined && option.count !== null && (
                    <span className="option-count">({option.count})</span>
                  )}
                </span>
              </label>
            ))}

            {/* Agent Name */}
            {activeTab === 'agentName' && availableAgents.map(agent => (
              <label key={agent} className="filter-option">
                <input
                  type="checkbox"
                  checked={localFilters.agentName.includes(agent)}
                  onChange={() => toggleArrayFilter('agentName', agent)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="option-label">{agent}</span>
              </label>
            ))}

            {/* State */}
            {activeTab === 'state' && availableStates.map(state => (
              <label key={state} className="filter-option">
                <input
                  type="checkbox"
                  checked={localFilters.state.includes(state)}
                  onChange={() => toggleArrayFilter('state', state)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="option-label">{state}</span>
              </label>
            ))}

            {/* Health */}
            {activeTab === 'health' && availableHealths.map(health => (
              <label key={health} className="filter-option">
                <input
                  type="checkbox"
                  checked={localFilters.health.includes(health)}
                  onChange={() => toggleArrayFilter('health', health)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="option-label">{health}</span>
              </label>
            ))}
          </div>

          {/* 3번 영역: Selected Filters */}
          <div className="selected-filters">
            <div className="selected-filters-header">
              <span className="selected-count">
                {getTotalSelectedCount()} Filter Selected
              </span>
              <button className="clear-button" onClick={handleReset}>
                Clear
              </button>
            </div>

            <div className="selected-filters-list">
              {/* Quick Filters */}
              {localFilters.quickFilters.filter(f => f.checked).length > 0 && (
                <div className="selected-group">
                  <div className="selected-group-label">Quick Filters</div>
                  {localFilters.quickFilters.filter(f => f.checked).map(filter => (
                    <div key={filter.id} className="selected-item">
                      <span>{filter.label}</span>
                      <button
                        className="remove-button"
                        onClick={() => removeQuickFilter(filter.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agent Name */}
              {localFilters.agentName.length > 0 && (
                <div className="selected-group">
                  <div className="selected-group-label">Agent Name</div>
                  {localFilters.agentName.map(agent => (
                    <div key={agent} className="selected-item">
                      <span>{agent}</span>
                      <button
                        className="remove-button"
                        onClick={() => removeArrayFilter('agentName', agent)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* State */}
              {localFilters.state.length > 0 && (
                <div className="selected-group">
                  <div className="selected-group-label">State</div>
                  {localFilters.state.map(state => (
                    <div key={state} className="selected-item">
                      <span>{state}</span>
                      <button
                        className="remove-button"
                        onClick={() => removeArrayFilter('state', state)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Health */}
              {localFilters.health.length > 0 && (
                <div className="selected-group">
                  <div className="selected-group-label">Health</div>
                  {localFilters.health.map(health => (
                    <div key={health} className="selected-item">
                      <span>{health}</span>
                      <button
                        className="remove-button"
                        onClick={() => removeArrayFilter('health', health)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-modal-footer">
          <button className="button button-reset" onClick={handleClearAndClose}>
            Clear and Close
          </button>
          <button className="button button-apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
