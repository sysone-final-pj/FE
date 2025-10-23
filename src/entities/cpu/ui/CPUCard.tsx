import React from 'react';
import type { CPUContainerData } from '@/shared/mocks/cpuData';

export const CPUCard: React.FC<{ data: CPUContainerData }> = ({ data }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 min-w-[235px] h-[135px] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-700 font-medium text-sm">
          {data.name}
        </h3>
        <span className="bg-green-500 rounded-full px-2 py-0.5 text-white text-xs font-medium">
          Healthy
        </span>
      </div>

      {/* Usage Gauge */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Usage</span>
          <span className="text-green-600 text-xs">{data.usagePercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-l-full"
            style={{
              width: `${data.usagePercent}%`,
              background: 'linear-gradient(90deg, rgba(4, 186, 91, 1) 0%, rgba(0, 255, 122, 1) 74%, rgba(86, 255, 167, 1) 100%)'
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex gap-6">
          <div className="flex gap-1 items-center">
            <span className="text-gray-500">Request:</span>
            <span className="text-gray-700">{data.request}m</span>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-gray-500">Limit:</span>
            <span className="text-gray-700">{data.limit}m</span>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="flex gap-1 items-center">
            <span className="text-gray-500">Throttling:</span>
            <span className="text-gray-700">{data.throttling}</span>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-gray-500">Core:</span>
            <span className="text-gray-700">{data.core}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
