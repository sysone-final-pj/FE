/**
 작성자: 김슬기
 */
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
    cpuQuota: number;
    cpuPeriod: number;
    core: number;
    throttling: string;
  };
}

export const CPUCard: React.FC<CPUCardProps> = ({ data }) => {
  const { name, cpuPercent, cpuQuota, cpuPeriod, core, throttling } = data;

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 min-w-[235px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary font-medium text-sm truncate">{name}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(cpuPercent)}`} />
          <span className="text-xs text-text-secondary">
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
          <span className="text-xs text-text-secondary">Usage</span>
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
        <div className="w-full h-2 bg-border-border-light rounded-full overflow-hidden">
          <div
            className={`h-full ${getStatusColor(cpuPercent)} rounded-full transition-all`}
            style={{ width: `${cpuPercent}%` }}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-y-2 text-xs">
        <div>
          <span className="text-text-secondary">Quota:</span>{' '}
          <span className="text-text-primary font-medium">
            {cpuQuota > 0 ? `${cpuQuota}` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-text-secondary">Period:</span>{' '}
          <span className="text-text-primary font-medium">
            {cpuPeriod > 0 ? `${cpuPeriod}` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-text-secondary">Throttling:</span>{' '}
          <span className="text-text-primary font-medium">{throttling}</span>
        </div>
        <div>
          <span className="text-text-secondary">Cores:</span>{' '}
          <span className="text-text-primary font-medium">{core}</span>
        </div>
      </div>
    </div>
  );
};
