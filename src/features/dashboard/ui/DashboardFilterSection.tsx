import { useState } from 'react';
import type { DashboardFilterOption } from '../model/filterTypes';

interface DashboardFilterSectionProps {
  title: string;
  count: number;
  options: DashboardFilterOption[];
  onToggle: (id: string) => void;
  defaultCollapsed?: boolean;
}

export const DashboardFilterSection = ({ 
  title, 
  count, 
  options, 
  onToggle,
  defaultCollapsed = false 
}: DashboardFilterSectionProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="border-b border-gray-100">
      <div 
        className="bg-white border-b border-border-light py-2.5 px-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-pretendard font-medium text-xs tracking-tight">
            {title}
          </span>
          <span className="text-gray-700 font-pretendard font-medium text-xs tracking-tight">
            ({count.toString().padStart(2, '0')})
          </span>
        </div>
        
        <svg 
          width="15" 
          height="15" 
          viewBox="0 0 15 15"
          className={`transform transition-transform ${collapsed ? '' : 'rotate-180'}`}
        >
          <path 
            d="M3.75 5.625L7.5 9.375L11.25 5.625" 
            stroke="#999" 
            strokeWidth="1.5" 
            fill="none"
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="py-2.5 px-4 flex flex-col gap-1">
          {options.map((option) => (
            <label 
              key={option.id}
              className="py-1.5 px-3.5 flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={option.checked}
                onChange={() => onToggle(option.id)}
                className="w-3 h-3 border border-gray-300 rounded"
              />
              <span className="text-text-secondary font-pretendard font-medium text-[11px] tracking-tight flex-1">
                {option.label}
              </span>
              {option.count > 0 && (
                <>
                  <div className="w-px h-3.5 bg-gray-300" />
                  <span className="text-text-secondary font-pretendard font-medium text-[10px] tracking-tight min-w-[14px] text-right">
                    {option.count}
                  </span>
                </>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
