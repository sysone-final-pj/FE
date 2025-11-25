import React from 'react';

interface FilterButtonProps {
  onClick: () => void;
  activeCount: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ onClick, activeCount }) => {
  return (
    <button 
      onClick={onClick}
      className="relative flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-border-light hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <path 
          d="M4 6h12M4 10h8M4 14h4" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm text-gray-800">Filters</span>
      {activeCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-state-running text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </button>
  );
};