/**
 공동 작성자: 김슬기, 이지민
 */
import React, { useState } from 'react';
import './FilterModal.css';

// 필터 옵션 타입 정의
interface FilterOption {
  id: string;
  label: string;
  count: number | null;
}

// 선택된 필터 타입
interface SelectedFilters {
  Agent: string[];
  State: string[];
  Healthy: string[];
}

// Props 타입 정의
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: SelectedFilters) => void;
}

// 필터 카테고리 타입
type FilterCategory = 'Agent' | 'State' | 'Healthy';

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const [activeTab, setActiveTab] = useState<FilterCategory>('Agent');
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    Agent: [],
    State: [],
    Healthy: []
  });

  // 필터 옵션 데이터
  const filterOptions: Record<FilterCategory, FilterOption[]> = {
    Agent: [
      { id: 'mock-agent1', label: 'mock-agent1', count: null },
      { id: 'mock-agent2', label: 'mock-agent2', count: null },
      { id: 'mock-agent3', label: 'mock-agent3', count: null }
    ],
    State: [
      { id: 'running', label: 'Running', count: 37 },
      { id: 'restarting', label: 'Restarting', count: 5 },
      { id: 'paused', label: 'Paused', count: 3 },
      { id: 'created', label: 'Created', count: 5 },
      { id: 'exited', label: 'Exited', count: 10 }
    ],
    Healthy: [
      { id: 'healthy', label: 'Healthy', count: 67 },
      { id: 'unhealthy', label: 'Unhealthy', count: 5 },
      { id: 'starting', label: 'Starting', count: 13 },
      { id: 'none', label: 'None', count: 15 }
    ]
  };

  // 탭 아이콘
  const tabIcons: Record<FilterCategory, string> = {
    Agent: '🧑‍💼',
    State: '📋',
    Healthy: '💚'
  };

  // 체크박스 토글
  const handleCheckboxChange = (category: FilterCategory, filterId: string): void => {
    setSelectedFilters(prev => {
      const categoryFilters = prev[category];
      const isSelected = categoryFilters.includes(filterId);

      return {
        ...prev,
        [category]: isSelected
          ? categoryFilters.filter(id => id !== filterId)
          : [...categoryFilters, filterId]
      };
    });
  };

  // 개별 필터 제거
  const handleRemoveFilter = (category: FilterCategory, filterId: string): void => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(id => id !== filterId)
    }));
  };

  // 모든 필터 초기화
  const handleClearAll = (): void => {
    setSelectedFilters({
      Agent: [],
      State: [],
      Healthy: []
    });
  };

  // 선택된 필터 개수
  const getTotalSelectedCount = (): number => {
    return Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);
  };

  // 필터 라벨 가져오기
  const getFilterLabel = (category: FilterCategory, filterId: string): string => {
    const option = filterOptions[category].find(opt => opt.id === filterId);
    return option ? option.label : filterId;
  };

  // 적용 버튼 클릭
  const handleApply = (): void => {
    onApply(selectedFilters);
    onClose();
  };

  // 취소 버튼 클릭
  const handleCancel = (): void => {
    onClose();
  };

  if (!isOpen) return null;

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
            {(['Agent', 'State', 'Healthy'] as FilterCategory[]).map(tab => (
              <button
                key={tab}
                className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="tab-icon">{tabIcons[tab]}</span>
                <span className="tab-label">{tab}</span>
              </button>
            ))}
          </div>

          {/* 2번 영역: Filter Options (체크박스) */}
          <div className="filter-options">
            {filterOptions[activeTab].map(option => (
              <label key={option.id} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedFilters[activeTab].includes(option.id)}
                  onChange={() => handleCheckboxChange(activeTab, option.id)}
                />
                <span className="option-label">
                  {option.label}
                  {option.count !== null && (
                    <span className="option-count">({option.count})</span>
                  )}
                </span>
              </label>
            ))}
          </div>

          {/* 3번 영역: Selected Filters */}
          <div className="selected-filters">
            <div className="selected-filters-header">
              <span className="selected-count">
                {getTotalSelectedCount()} Filter Selected
              </span>
              <button className="clear-button" onClick={handleClearAll}>
                Clear
              </button>
            </div>

            <div className="selected-filters-list">
              {(Object.entries(selectedFilters) as [FilterCategory, string[]][]).map(([category, filters]) =>
                filters.length > 0 && (
                  <div key={category} className="selected-group">
                    <div className="selected-group-label">{category}</div>
                    {filters.map(filterId => (
                      <div key={filterId} className="selected-item">
                        <span>{getFilterLabel(category, filterId)}</span>
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveFilter(category, filterId)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-modal-footer">
          <button className="button button-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="button button-reset" onClick={handleClearAll}>
            Reset Filter
          </button>
          <button className="button button-apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
