import React from 'react';
import type { MemoryCardData } from '@/shared/types/metrics';
import { formatBytes } from '@/shared/lib/formatters';

interface MemoryStatsTableProps {
  data: MemoryCardData[];
}

export const MemoryStatsTable: React.FC<MemoryStatsTableProps> = ({ data }) => {
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <h3 className="text-text-primary font-pretendard font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        메모리 상세 통계
      </h3>
      <div className="bg-white rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-left">Name</th>
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-center">Usage (%)</th>
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-center">Usage</th>
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-center">Limit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-border-light hover:bg-gray-50">
                <td className="px-4 py-3 text-text-secondary text-xs">{item.name}</td>
                <td className="px-4 py-3 text-text-secondary text-xs text-center">{item.usagePercent}%</td>
                <td className="px-4 py-3 text-text-secondary text-xs text-center">{formatBytes(item.usage)}</td>
                <td className="px-4 py-3 text-text-secondary text-xs text-center">{formatBytes(item.limit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};