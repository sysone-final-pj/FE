import React from 'react';
import type { LogData } from '@/shared/types/metrics';

export const LogRow: React.FC<{ log: LogData }> = ({ log }) => {
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-600 font-medium';
      case 'ERROR': return 'text-red-600 font-medium';
      case 'WARN': return 'text-yellow-600 font-medium';
      case 'DEBUG': return 'text-gray-600 font-medium';
      case 'SUCCESS': return 'text-green-600 font-medium';
      default: return 'text-gray-600 font-medium';
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-2 py-3 text-gray-400 font-pretendard text-sm font-medium tracking-tight">
        {log.timestamp}
      </td>
      <td className="px-2 py-3 font-pretendard text-sm tracking-tight">
        <span className={getLevelStyles(log.level)}>{log.level}</span>
      </td>
      <td className="px-2 py-3 text-gray-700 font-pretendard text-sm font-medium tracking-tight">
        {log.containerName}
      </td>
      <td className="px-2 py-3 text-gray-600 font-pretendard text-sm font-medium tracking-tight leading-relaxed">
        {log.message}
      </td>
      <td className="px-2 py-3 text-gray-600 font-pretendard text-sm font-medium tracking-tight">
        {log.agentName}
      </td>
      <td className="px-2 py-3 text-gray-400 font-pretendard text-sm font-medium tracking-tight">
        {log.duration}
      </td>
    </tr>
  );
};

