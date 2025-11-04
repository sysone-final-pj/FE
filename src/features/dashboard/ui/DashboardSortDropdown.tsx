import { useState, useRef, useEffect } from 'react';

type DashboardSortOption = 'name' | 'cpu' | 'memory' | 'state' | 'healthy';

interface DashboardSortDropdownProps {
  value: DashboardSortOption;
  onChange: (value: DashboardSortOption) => void;
}

const DASHBOARD_SORT_OPTIONS: { value: DashboardSortOption; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'cpu', label: 'CPU Usage' },
  { value: 'memory', label: 'Memory Usage' },
  { value: 'state', label: 'State' },
  { value: 'healthy', label: 'Health Status' },
];

export const DashboardSortDropdown = ({ value, onChange }: DashboardSortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = DASHBOARD_SORT_OPTIONS.find(opt => opt.value === value)?.label || 'Sort By';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-lg border border-gray-300 py-2.5 px-3 pr-8 flex items-center gap-2 hover:bg-gray-50 transition-colors relative"
      >
        <span className="text-gray-500 font-pretendard font-medium text-sm tracking-tight">
          {selectedLabel}
        </span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
          className={`absolute right-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path 
            d="M3 4.5L6 7.5L9 4.5" 
            stroke="#999" 
            strokeWidth="1.5" 
            fill="none"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
          {DASHBOARD_SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors
                ${value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                first:rounded-t-lg last:rounded-b-lg
              `}
            >
              <span className="font-pretendard font-medium text-sm">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
