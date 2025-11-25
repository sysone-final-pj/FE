import React from 'react';
import type { SortDirection } from '@/shared/types/container';

interface SortIconProps {
  direction: SortDirection;
}

export const SortIcon: React.FC<SortIconProps> = ({ direction }) => {
  if (direction === 'asc') return <span className="text-state-running text-xs ml-1">▲</span>;
  if (direction === 'desc') return <span className="text-state-running text-xs ml-1">▼</span>;
  return <span className="text-gray-300 text-xs ml-1">▼</span>;
};