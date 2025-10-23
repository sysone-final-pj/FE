import React from 'react';

export const OOMKillsChart: React.FC = () => {
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <h3 className="text-gray-700 font-pretendard font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        OOM Kills
      </h3>
      <div className="bg-white rounded-lg p-8 h-64 flex items-center justify-center text-gray-400">
        OOM Kills 차트 영역 (Recharts 등으로 구현)
      </div>
    </section>
  );
};