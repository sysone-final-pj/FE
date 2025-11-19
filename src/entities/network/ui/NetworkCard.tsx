import React from 'react';
import type { NetworkCardData } from '@/shared/types/metrics';

export const NetworkCard: React.FC<{ data: NetworkCardData }> = ({ data }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 min-w-[235px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-700 font-medium text-sm">{data.name}</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-text-secondary capitalize">{data.status}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Status</span>
          <span className="text-xs text-green-600 font-medium">{data.statusPercent}%</span>
        </div>
        <div className="w-full h-2 bg-border-border-light rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${data.statusPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-xs">
        <div><span className="text-gray-500">Rx Mbps:</span> <span className="text-gray-700 font-medium">{data.rxMbps}/{data.rxMbpsMax}</span></div>
        <div><span className="text-gray-500">Tx Mbps:</span> <span className="text-gray-700 font-medium">{data.txMbps}/{data.txMbpsMax}</span></div>
        <div><span className="text-gray-500">Error Rate:</span> <span className="text-gray-700 font-medium">{data.errorRate}%</span></div>
        <div><span className="text-gray-500">Traffic:</span> <span className="text-gray-700 font-medium">{data.totalTraffic} KB</span></div>
      </div>
    </div>
  );
};
