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
  onCheckChange 
}) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-3 py-3 text-center">
        <button 
          onClick={() => onToggleFavorite(data.id)}
          className={`transition-colors ${data.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}
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
      <td className="px-3 py-3 text-sm text-gray-600">{data.agentName}</td>
      <td className="px-3 py-3 text-sm text-gray-600 font-mono">{data.containerId}</td>
      <td className="px-3 py-3 text-sm text-gray-800 font-medium">{data.containerName}</td>
      <td className="px-3 py-3 text-sm text-center">
        <span className="text-gray-800">{data.cpuPercent}</span>
        <span className="text-gray-400">%</span>
      </td>
      <td className="px-3 py-3 text-sm text-center">
        <span className="text-gray-800">{data.memoryUsed}</span>
        <span className="text-gray-400">MB / {data.memoryMax}MB</span>
      </td>
      <td className="px-3 py-3 text-sm text-center">
        <span className="text-gray-800">{data.storageUsed}</span>
        <span className="text-gray-400">GB / {data.storageMax}GB</span>
      </td>
      <td className="px-3 py-3 text-sm text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-blue-500">↓</span>
          <span className="text-gray-800">{data.networkRx}</span>
          <span className="text-gray-400">Kbps</span>
          <span className="text-gray-600">/</span>
          <span className="text-green-500">↑</span>
          <span className="text-gray-800">{data.networkTx}</span>
          <span className="text-gray-400">Kbps</span>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl">
          <span className={`w-2 h-2 rounded-full ${stateConfig[data.state].color}`}></span>
          <span className="text-sm text-gray-600">{stateConfig[data.state].label}</span>
        </span>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl">
          <span className={`w-2 h-2 rounded-full ${healthConfig[data.health].color}`}></span>
          <span className="text-sm text-gray-600">{healthConfig[data.health].label}</span>
        </span>
      </td>
      <td className="px-3 py-3 text-center">
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