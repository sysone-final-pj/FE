import React from 'react';

interface CPUStatsTableProps {
  data: {
    name: string;
    avg1min: number;
    avg5min: number;
    avg15min: number;
    p95: number;
  }[];
}

export const CPUStatsTable: React.FC<CPUStatsTableProps> = ({ data }) => {
  // Helper function to display value or "-" if 0
  const formatValue = (value: number) => value > 0 ? `${value.toFixed(1)}%` : '-';

  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-text-primary font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        CPU 통계 (평균 · P95)
      </h3>
      <div className="bg-white rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-left">Name</th>
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-center">1분</th>
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-center">5분</th>
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-center">15분</th>
              <th className="px-4 py-3 text-text-secondary text-xs font-medium text-center">P95</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-b border-border-light">
                <td className="px-4 py-3 text-text-secondary text-xs">{d.name}</td>
                <td className="px-4 py-3 text-text-secondary text-xs text-center">{formatValue(d.avg1min)}</td>
                <td className="px-4 py-3 text-text-secondary text-xs text-center">{formatValue(d.avg5min)}</td>
                <td className="px-4 py-3 text-text-secondary text-xs text-center">{formatValue(d.avg15min)}</td>
                <td className="px-4 py-3 text-text-secondary text-xs text-center">{formatValue(d.p95)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
