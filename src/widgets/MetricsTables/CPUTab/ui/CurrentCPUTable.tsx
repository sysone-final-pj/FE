/********************************************************************************************
 * 🧮 CurrentCPUTable.tsx
 ********************************************************************************************/
import React, { useMemo } from 'react';
import type { MetricDetail } from '@/shared/types/api/manage.types';

interface Props {
  selectedMetrics: MetricDetail[];
}

export const CurrentCPUTable: React.FC<Props> = ({ selectedMetrics }) => {
  const rows = useMemo(() => {
    return selectedMetrics.map((metric) => {
      const throttlingPeriods = metric?.cpu?.throttlingPeriods ?? 0;
      const throttledPeriods = metric?.cpu?.throttledPeriods ?? 0;
      const throttlingPercent =
        throttlingPeriods > 0
          ? ((throttledPeriods / throttlingPeriods) * 100).toFixed(1)
          : '0';

      const cpuQuota = metric?.cpu?.cpuQuota ?? 0;
      const cpuPeriod = metric?.cpu?.cpuPeriod ?? 0;

      return {
        name: metric?.container?.containerName ?? 'Unknown',
        usagePercent: Number((metric?.cpu?.currentCpuPercent ?? 0).toFixed(1)),
        coreUsage: Number((metric?.cpu?.currentCpuCoreUsage ?? 0).toFixed(2)),
        cpuLimit: cpuQuota > 0 && cpuPeriod > 0
          ? `${(cpuQuota / cpuPeriod).toFixed(2)} cores`
          : 'Unlimited',
        throttlingPercent,
      };
    });
  }, [selectedMetrics]);

  
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        Current CPU (mCPU)
      </h3>
      <div className="bg-white rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs text-gray-600">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-center">Usage (%)</th>
              <th className="px-4 py-3 text-center">Core</th>
              <th className="px-4 py-3 text-center">Limit</th>
              <th className="px-4 py-3 text-center">Throttling (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-200 text-xs text-gray-600">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3 text-center">{r.usagePercent}%</td>
                <td className="px-4 py-3 text-center">{r.coreUsage}</td>
                <td className="px-4 py-3 text-center">{r.cpuLimit}</td>
                <td className="px-4 py-3 text-center">{r.throttlingPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
