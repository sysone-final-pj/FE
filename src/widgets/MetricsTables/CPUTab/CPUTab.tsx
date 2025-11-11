import React, { useMemo } from 'react';
import type { ContainerData } from '@/shared/types/container';
import { CPUCard } from '@/entities/cpu/ui/CPUCard';
import { useContainerStore } from '@/shared/stores/useContainerStore';
import type { ContainerDashboardResponseDTO } from '@/shared/types/websocket';

interface CPUTabProps {
  selectedContainers: ContainerData[];
}


// ===================================================
// CPUTab Main Component
// ===================================================
export const CPUTab: React.FC<CPUTabProps> = ({ selectedContainers }) => {
  // Store에서 실시간 데이터 가져오기
  const getDisplayData = useContainerStore((state) => state.getDisplayData);

  // 선택된 컨테이너의 실시간 메트릭 데이터
  const selectedMetrics = useMemo(() => {
    const allData = getDisplayData();
    const selectedIds = new Set(selectedContainers.map((c) => Number(c.id)));
    return allData.filter((dto) => selectedIds.has(dto.containerId));
  }, [getDisplayData, selectedContainers]);

  // CPU Overview Cards 데이터
  const cpuCards = useMemo(() => {
    return selectedMetrics.map((dto) => ({
      id: String(dto.containerId),
      name: dto.containerName,
      cpuPercent: Number(dto.cpuPercent.toFixed(1)),
      cores: dto.onlineCpus,
      quota: dto.cpuQuota > 0 ? dto.cpuQuota : undefined,
      throttled: dto.throttledPeriods > 0 ? ((dto.throttledPeriods / dto.throttlingPeriods) * 100).toFixed(1) : '0',
    }));
  }, [selectedMetrics]);

  // 현재 CPU 테이블 데이터
  const currentCPUData = useMemo(() => {
    return selectedMetrics.map((dto) => {
      const throttlingPercent =
        dto.throttlingPeriods > 0
          ? ((dto.throttledPeriods / dto.throttlingPeriods) * 100).toFixed(1)
          : '0';

      return {
        name: dto.containerName,
        usagePercent: Number(dto.cpuPercent.toFixed(1)),
        coreUsage: Number(dto.cpuCoreUsage.toFixed(2)),
        cpuLimit: dto.cpuQuota > 0 ? `${(dto.cpuQuota / 100000).toFixed(2)} cores` : 'Unlimited',
        throttlingPercent,
      };
    });
  }, [selectedMetrics]);

  // CPU Mode (User/System) 데이터
  const cpuModeData = useMemo(() => {
    return selectedMetrics.map((dto) => {
      const totalCpu = dto.cpuUser + dto.cpuSystem;
      const userPercent = totalCpu > 0 ? ((dto.cpuUser / totalCpu) * 100).toFixed(0) : '0';
      const systemPercent = totalCpu > 0 ? ((dto.cpuSystem / totalCpu) * 100).toFixed(0) : '0';

      return {
        name: dto.containerName,
        user: Number(userPercent),
        system: Number(systemPercent),
      };
    });
  }, [selectedMetrics]);

  // 선택된 컨테이너가 없으면 안내 메시지
  if (selectedContainers.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          컨테이너를 선택해주세요
        </h3>
        <p className="text-gray-500">
          상단 테이블에서 체크박스를 선택하면 해당 컨테이너의 CPU 메트릭이 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 px-10">
      
      {/* 선택된 컨테이너 정보 표시 */}
      <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{selectedContainers.length}개 컨테이너</span> 메트릭 표시 중
        </p>
      </div>

      {/* CPU Overview Cards */}
      <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 mb-4">
        <h2 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
          Container CPU Overview
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cpuCards.map((c, index) => (
            <CPUCard key={`${c.id}-${index}`} data={c} />
          ))}
        </div>
      </section>

      {/* Top Tables Row */}
      <div className="flex gap-4 mb-4">
        
        {/* Current CPU Table */}
        <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
          <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
            현재 CPU (mCPU)
          </h3>
          <div className="bg-white rounded overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-4 py-3 text-gray-600 text-xs font-medium text-left">Name</th>
                  <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">Usage (%)</th>
                  <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">Core 사용량</th>
                  <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">CPU 제한</th>
                  <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">Throttling (%)</th>
                </tr>
              </thead>
              <tbody>
                {currentCPUData.map((d, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-gray-600 text-xs">{d.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs text-center">{d.usagePercent}%</td>
                    <td className="px-4 py-3 text-gray-600 text-xs text-center">{d.coreUsage}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs text-center">{d.cpuLimit}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs text-center">{d.throttlingPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CPU Stats Table - 통계 데이터는 향후 서버에서 제공 예정 */}
        <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
          <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
            CPU 통계 (평균 · P95)
          </h3>
          <div className="bg-white rounded overflow-hidden p-8 text-center">
            <div className="text-gray-400 text-sm">
              실시간 통계 데이터는 향후 제공 예정입니다.
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Charts Row */}
      <div className="flex gap-4">
        
        {/* CPU Mode Distribution Chart */}
        <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
          <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
            CPU 모드 분포 (User/System)
          </h3>
          <div className="bg-white rounded-lg p-5 h-[280px]">
            <div className="flex justify-end mb-2">
              <span className="text-xs text-gray-400">100%</span>
            </div>
            {cpuModeData.map((d, i) => (
              <div key={i} className="flex items-center gap-3 mb-4">
                <div className="w-[120px] text-xs text-gray-500 text-right truncate">{d.name}</div>
                <div className="flex-1 flex h-6">
                  <div
                    className="flex items-center justify-center text-xs font-medium"
                    style={{
                      width: `${d.user}%`,
                      background: '#abff7d',
                      color: '#2d5016'
                    }}
                  >
                    {d.user > 15 && `${d.user}%`}
                  </div>
                  <div
                    className="flex items-center justify-center text-xs font-medium"
                    style={{
                      width: `${d.system}%`,
                      background: '#43dffa',
                      color: '#0a4d5c'
                    }}
                  >
                    {d.system > 15 && `${d.system}%`}
                  </div>
                </div>
              </div>
            ))}
            {/* Legend */}
            <div className="flex gap-4 mt-5 justify-end pr-5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2" style={{ background: '#abff7d' }} />
                <span>User</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2" style={{ background: '#43dffa' }} />
                <span>System</span>
              </div>
            </div>
          </div>
        </section>

        {/* CPU Usage Trend Chart */}
        <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
          <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
            CPU 사용률 추이
          </h3>
          <div 
            className="rounded-lg h-[213px] relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)' }}
          >
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className="absolute left-0 right-0 h-px"
                style={{ 
                  top: `${i * 25}%`,
                  background: 'rgba(255,255,255,0.1)' 
                }} 
              />
            ))}
            
            {/* Chart Lines (SVG) - 선택된 컨테이너 수만큼만 표시 */}
            <svg width="100%" height="100%" className="absolute">
              {selectedContainers.slice(0, 3).map((_, index) => {
                const colors = ['#43dffa', '#f0a100', '#abff7d'];
                const paths = [
                  'M 50,150 L 100,120 L 150,130 L 200,110 L 250,125 L 300,115 L 350,120 L 400,100 L 450,110 L 500,105 L 550,115 L 600,110',
                  'M 50,120 L 100,100 L 150,110 L 200,95 L 250,105 L 300,100 L 350,98 L 400,85 L 450,90 L 500,88 L 550,95 L 600,92',
                  'M 50,100 L 100,85 L 150,90 L 200,80 L 250,88 L 300,82 L 350,85 L 400,75 L 450,78 L 500,76 L 550,82 L 600,80'
                ];
                return (
                  <path
                    key={index}
                    d={paths[index]}
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
            
            {/* Legend */}
            <div 
              className="absolute top-2 right-2 rounded px-3 py-2 text-xs text-white"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              {selectedContainers.slice(0, 3).map((container, index) => {
                const colors = ['#43dffa', '#f0a100', '#abff7d'];
                return (
                  <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                    <div className="w-3 h-0.5" style={{ background: colors[index] }} />
                    <span className="truncate max-w-[120px]">{container.containerName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CPUTab;