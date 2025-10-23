import React, { useMemo } from 'react';
import type { ContainerData } from '@/shared/types/container';
import type { NetworkCardData } from '@/shared/types/metrics';
import { mockNetworkData } from '@/shared/mocks/networkData';
import { NetworkCard } from '@/entities/network/ui/NetworkCard';
import { NetworkRxChart } from './ui/NetworkRxChart';
import { NetworkTxChart } from './ui/NetworkTxChart';
import { TrafficUsageChart } from './ui/TrafficUsageChart';
import { ErrorDropRateChart } from './ui/ErrorDropRateChart';

const NetworkTab: React.FC<{ selectedContainers: ContainerData[] }> = ({ selectedContainers }) => {
  const filteredNetworkData = useMemo<NetworkCardData[]>(() => {
    if (selectedContainers.length === 0) return mockNetworkData;
    return mockNetworkData.slice(0, selectedContainers.length).map((data, index) => ({
      ...data,
      name: selectedContainers[index]?.containerName || data.name
    }));
  }, [selectedContainers]);

  if (selectedContainers.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-6xl mb-4">🌐</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">컨테이너를 선택해주세요</h3>
        <p className="text-gray-500">상단 테이블에서 체크박스를 선택하면 네트워크 메트릭이 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Info Badge */}
      <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{selectedContainers.length}개 컨테이너</span> 네트워크 메트릭 표시 중
        </p>
      </div>

      {/* Network Cards Overview */}
      <section className="bg-gray-100 rounded-xl border border-gray-300 p-6 mb-4">
        <h2 className="text-gray-700 font-medium text-base border-b-2 border-gray-300 pb-2 pl-2 mb-4">
          Container Network Overview
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filteredNetworkData.map((data) => (
            <NetworkCard key={data.id} data={data} />
          ))}
        </div>
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetworkRxChart />
        <NetworkTxChart />
        <TrafficUsageChart />
        <ErrorDropRateChart />
      </div>
    </div>
  );
};

export default NetworkTab;