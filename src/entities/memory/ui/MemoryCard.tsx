import React from 'react';
import type { MemoryCardData } from '@/shared/types/metrics';

export const MemoryCard: React.FC<{ data: MemoryCardData }> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 min-w-[235px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary font-medium text-sm">{data.name}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(data.status)}`}></div>
          <span className="text-xs text-text-secondary capitalize">{data.status}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-secondary">Usage</span>
          <span className="text-xs text-green-600 font-medium">{data.usagePercent}%</span>
        </div>
        <div className="w-full h-2 bg-border-border-light rounded-full overflow-hidden relative">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${data.usagePercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-xs">
        <div><span className="text-text-secondary">Usage:</span> <span className="text-text-primary font-medium">{data.usage} MB</span></div>
        <div><span className="text-text-secondary">Limit:</span> <span className="text-text-primary font-medium">{(data.limit / 1000).toFixed(1)} GB</span></div>
        <div><span className="text-text-secondary">RSS:</span> <span className="text-text-primary font-medium">{data.rss} MB</span></div>
        <div><span className="text-text-secondary">Cache:</span> <span className="text-text-primary font-medium">{data.cache} MB</span></div>
      </div>
    </div>
  );
};
