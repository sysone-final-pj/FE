// import React, { useMemo } from 'react';
// import type { ContainerData } from '@/shared/types/container';
// import type { MemoryCardData } from '@/shared/types/metrics';
// import { mockMemoryData } from '@/shared/mocks/memoryData';
// import { MemoryCard } from '@/entities/memory/ui/MemoryCard';

// const MemoryTab: React.FC<{ selectedContainers: ContainerData[] }> = ({ selectedContainers }) => {
//   const filteredMemoryData = useMemo<MemoryCardData[]>(() => {
//     if (selectedContainers.length === 0) return mockMemoryData;
//     return mockMemoryData.slice(0, selectedContainers.length).map((data, index) => ({
//       ...data,
//       name: selectedContainers[index]?.containerName || data.name
//     }));
//   }, [selectedContainers]);

//   if (selectedContainers.length === 0) {
//     return (
//       <div className="memory-empty-state py-16 text-center">
//         <div className="text-gray-400 text-6xl mb-4">💾</div>
//         <h3 className="text-xl font-semibold text-gray-600 mb-2">컨테이너를 선택해주세요</h3>
//         <p className="text-gray-500">상단 테이블에서 체크박스를 선택하면 메모리 메트릭이 표시됩니다.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="memory-tab-container py-4">
//       <div className="memory-selection-info mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
//         <p className="text-sm text-blue-800">
//           <span className="font-semibold">{selectedContainers.length}개 컨테이너</span> 메모리 메트릭 표시 중
//         </p>
//       </div>

//       <section className="memory-overview-section bg-gray-100 rounded-xl border border-gray-300 p-6 mb-4">
//         <h2 className="text-gray-700 font-pretendard font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
//           Container Memory Overview
//         </h2>
//         <div className="flex gap-3 overflow-x-auto pb-2">
//           {filteredMemoryData.map((data) => (
//             <MemoryCard key={data.id} data={data} />
//           ))}
//         </div>
//       </section>

//       <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
//         <h3 className="text-gray-700 font-pretendard font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
//           메모리 상세 통계
//         </h3>
//         <div className="bg-white rounded overflow-hidden">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-100 border-b border-gray-300">
//                 <th className="px-4 py-3 text-gray-600 text-xs font-medium text-left">Name</th>
//                 <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">Usage (%)</th>
//                 <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">Usage (MB)</th>
//                 <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">Limit (GB)</th>
//                 <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">RSS (MB)</th>
//                 <th className="px-4 py-3 text-gray-600 text-xs font-medium text-center">Cache (MB)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredMemoryData.map((data, index) => (
//                 <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
//                   <td className="px-4 py-3 text-gray-600 text-xs">{data.name}</td>
//                   <td className="px-4 py-3 text-gray-600 text-xs text-center">{data.usagePercent}%</td>
//                   <td className="px-4 py-3 text-gray-600 text-xs text-center">{data.usage}</td>
//                   <td className="px-4 py-3 text-gray-600 text-xs text-center">{(data.limit / 1000).toFixed(1)}</td>
//                   <td className="px-4 py-3 text-gray-600 text-xs text-center">{data.rss}</td>
//                   <td className="px-4 py-3 text-gray-600 text-xs text-center">{data.cache}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default MemoryTab;


import React, { useMemo } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { MemoryCardData } from '@/shared/types/metrics';
import { mockMemoryData } from '@/shared/mocks/memoryData';
import { MemoryCard } from '@/entities/memory/ui/MemoryCard';
import { MemoryStatsTable } from './ui/MemoryStatsTable';
import { MemoryUsageChart } from './ui/MemoryUsageChart';
import { OOMKillsChart } from './ui/OOMKillsChart';

const MemoryTab: React.FC<{ selectedContainers: ContainerData[] }> = ({ selectedContainers }) => {
  const filteredMemoryData = useMemo<MemoryCardData[]>(() => {
    if (selectedContainers.length === 0) return mockMemoryData;
    return mockMemoryData.slice(0, selectedContainers.length).map((data, index) => ({
      ...data,
      name: selectedContainers[index]?.containerName || data.name
    }));
  }, [selectedContainers]);

  if (selectedContainers.length === 0) {
    return (
      <div className="memory-empty-state py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">💾</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">컨테이너를 선택해주세요</h3>
        <p className="text-gray-500">상단 테이블에서 체크박스를 선택하면 메모리 메트릭이 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="memory-tab-container py-4">
      {/* Info Badge */}
      <div className="memory-selection-info mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{selectedContainers.length}개 컨테이너</span> 메모리 메트릭 표시 중
        </p>
      </div>

      {/* Memory Cards Overview */}
      <section className="memory-overview-section bg-gray-100 rounded-xl border border-gray-300 p-6 mb-4">
        <h2 className="text-gray-700 font-pretendard font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
          Container Memory Overview
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filteredMemoryData.map((data) => (
            <MemoryCard key={data.id} data={data} />
          ))}
        </div>
      </section>

      {/* Memory Stats Table */}
      <MemoryStatsTable data={filteredMemoryData} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <MemoryUsageChart />
        <OOMKillsChart />
      </div>
    </div>
  );
};

export default MemoryTab;