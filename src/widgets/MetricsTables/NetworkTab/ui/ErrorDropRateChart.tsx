import React from 'react';

export const ErrorDropRateChart: React.FC = () => {
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        에러 및 드랍율
      </h3>
      <div className="bg-white rounded-lg p-8 h-64 flex items-center justify-center text-gray-400">
        에러/드랍율 차트 영역 (Recharts 등으로 구현)
      </div>
    </section>
  );
};