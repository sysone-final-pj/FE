/********************************************************************************************
 * 💠 CPUCard.tsx (with Request field)
 * MemoryCard 스타일과 통일, Request 추가
 ********************************************************************************************/
import React from 'react';

interface CPUCardProps {
  data: {
    id: string;
    name: string;
    cpuPercent: number;
    cores: number;
    quota?: number;        
    request?: number;     
    throttled: string;
  };
}

export const CPUCard: React.FC<CPUCardProps> = ({ data }) => {
  const { name, cpuPercent, cores, quota, request, throttled } = data;

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 min-w-[235px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-700 font-medium text-sm truncate">{name}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(cpuPercent)}`} />
          <span className="text-xs text-gray-600">
            {cpuPercent >= 90
              ? 'Critical'
              : cpuPercent >= 80
              ? 'Warning'
              : 'Healthy'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Usage</span>
          <span
            className={`text-xs font-medium ${
              cpuPercent >= 90
                ? 'text-red-500'
                : cpuPercent >= 80
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {cpuPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStatusColor(cpuPercent)} rounded-full transition-all`}
            style={{ width: `${cpuPercent}%` }}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-y-2 text-xs">
        <div>
          <span className="text-gray-500">Request:</span>{' '}
          <span className="text-gray-700 font-medium">
            {request ? `${request} m` : '0'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Limit:</span>{' '}
          <span className="text-gray-700 font-medium">
            {quota ? `${quota} m` : 'Unlimited'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Throttling:</span>{' '}
          <span className="text-gray-700 font-medium">{throttled}</span>
        </div>
        <div>
          <span className="text-gray-500">Core:</span>{' '}
          <span className="text-gray-700 font-medium">{cores}</span>
        </div>
      </div>
    </div>
  );
};
