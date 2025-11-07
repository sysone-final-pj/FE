import React from 'react';
import type { ContainerData } from '@/shared/types/container';
import { stateConfig, healthConfig } from '@/entities/container/model/constants';

interface TableRowProps {
  data: ContainerData;
  onToggleFavorite: (id: string) => void;
  isChecked: boolean;
  onCheckChange: (id: string, checked: boolean) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
  data,
  onToggleFavorite,
  isChecked,
  onCheckChange,
}) => {
  return (
    <tr className="h-[45px] border-b border-[#e5e5ec] hover:bg-[#f8f8fa] transition-colors table w-full table-fixed">
      {/* ⭐ Favorite */}
      <td className="w-[45px] min-w-[45px] text-center p-3">
        <button
          onClick={() => onToggleFavorite(data.id)}
          className={`transition-colors ${
            data.isFavorite
              ? 'text-[#FFE171]'
              : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={data.isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </td>

      {/* Agent Name */}
      <td className="w-[150px] min-w-[150px] pt-3 pr-3 pb-3 pl-3 text-left text-sm text-[#333333] font-medium">
        {data.agentName}
      </td>

      {/* Container ID */}
      <td className="w-[140px] min-w-[140px] pt-3 pr-3 pb-3 pl-3 text-left text-sm text-[#333333] font-medium font-mono">
        <span title={data.containerId}>
          {data.containerId.length > 12
            ? `${data.containerId.substring(0, 12)}...`
            : data.containerId}
        </span>
      </td>

      {/* Container Name */}
      <td className="w-[190px] min-w-[190px] pt-3 pr-3 pb-3 pl-3 text-left text-sm text-[#333333] font-medium">
        {data.containerName}
      </td>

      {/* CPU (%) */}
      <td className="w-[110px] min-w-[110px] pt-3 pr-3 pb-3 pl-3 text-center text-sm text-[#333333] font-medium">
        {data.cpuPercent}
        <span className="text-[#999999] mx-1">%</span>
      </td>

      {/* Memory */}
      <td className="w-[200px] min-w-[200px] pt-3 pr-3 pb-3 pl-3 text-center text-sm text-[#333333] font-medium">
        {data.memoryUsed}
        <span className="text-[#999999] mx-1">MB</span>
        <span className= "mx-1.5">/</span>
        {data.memoryMax}
        <span className="text-[#999999] mx-1">MB</span>
      </td>

      {/* Storage */}
      <td className="w-[220px] min-w-[220px] pt-3 pr-3 pb-3 pl-3 text-center text-sm text-[#333333] font-medium">
        {data.storageUsed}
        <span className="text-[#999999] mx-1">GB</span>
        <span className= "mx-1.5">/</span>
        {data.storageMax}
        <span className="text-[#999999] mx-1">GB</span>
      </td>

      {/* Network */}
      <td className="w-[200px] min-w-[200px] p-3 text-center text-sm text-[#333333] font-medium">
        <div className="flex items-center justify-center">
          <span className="text-[#0492f4] mx-1.5">↓</span>
          <span>{data.networkRx}</span>
          <span className="text-[#999999] mx-1.5">Kbps</span>
          <span className="mx-1">/</span>
          <span className="text-[#14ba6d] mx-1.5">↑</span>
          <span>{data.networkTx}</span>
          <span className="text-[#999999] mx-1">Kbps</span>
        </div>
      </td>

      {/* State */}
      <td className="w-[120px] min-w-[120px] pt-3 pr-3 pb-3 pl-3 text-left text-sm text-[#999999] font-medium">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl">
          <span
            className={`w-2 h-2 rounded-full ${
              stateConfig[data.state].color
            }`}
          />
          <span>{stateConfig[data.state].label}</span>
        </div>
      </td>

      {/* Health */}
      <td className="w-[120px] min-w-[120px] pt-3 pr-3 pb-3 pl-3 text-left text-sm text-[#999999] font-medium">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl">
          <span
            className={`w-2 h-2 rounded-full ${
              healthConfig[data.health].color
            }`}
          />
          <span>{healthConfig[data.health].label}</span>
        </div>
      </td>

      {/* Check */}
      <td className="w-[73px] min-w-[73px] pt-3 pr-3 pb-3 pl-3 text-center">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckChange(data.id, e.target.checked)}
          className="w-4 h-4 text-blue-500 rounded cursor-pointer"
        />
      </td>
    </tr>
  );
};
