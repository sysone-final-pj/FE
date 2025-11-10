/********************************************************************************************
 * 📊 CPUStatsTable.tsx
 ********************************************************************************************/
import React from 'react';

export const CPUStatsTable: React.FC = () => {
  return (
    <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 flex-1">
      <h3 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
        CPU Statistics (Avg / P95)
      </h3>
      <div className="bg-white rounded overflow-hidden p-8 text-center">
        <p className="text-gray-400 text-sm">
          Real-time statistical data will be provided later.
        </p>
      </div>
    </section>
  );
};
