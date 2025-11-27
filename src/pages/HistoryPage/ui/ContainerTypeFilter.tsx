/**
 작성자: 김슬기
 */
import { useMemo, useState } from 'react';
import type { ContainerListDTO } from '@/entities/history/api';

interface ContainerTypeFilterProps {
  containerType: 'live' | 'deleted';
  selectedContainer: string;
  containers: ContainerListDTO[];
  onContainerTypeChange: (type: 'live' | 'deleted') => void;
  onSelectedContainerChange: (containerId: string) => void;
}

export const ContainerTypeFilter = ({
  containerType,
  selectedContainer,
  containers,
  onContainerTypeChange,
  onSelectedContainerChange,
}: ContainerTypeFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 검색어로 필터링된 컨테이너 목록
  const filteredContainers = useMemo(() => {
    if (!searchTerm) return containers;

    const lowerSearch = searchTerm.toLowerCase();
    return containers.filter((c) =>
      c.containerName.toLowerCase().includes(lowerSearch) ||
      c.containerHash.toLowerCase().includes(lowerSearch)
    );
  }, [containers, searchTerm]);

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-text-primary whitespace-nowrap">
        Container :
      </label>

      {/* 라디오 옵션 - Live */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="containerType"
          value="live"
          checked={containerType === 'live'}
          onChange={() => {
            onContainerTypeChange('live');
            onSelectedContainerChange('');
            setSearchTerm('');
          }}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm font-medium text-text-primary">Live</span>
        <select
          value={containerType === 'live' ? selectedContainer : ''}
          onChange={(e) => {
            onContainerTypeChange('live');
            onSelectedContainerChange(e.target.value);
          }}
          onClick={() => onContainerTypeChange('live')}
          className={
            `px-3 py-2 border rounded-md min-w-[250px] text-sm
            ${containerType !== 'live'
                ? 'bg-gray-100 text-gray-400 cursor-pointer'
                : 'bg-white text-text-primary'}`
          }
        >
          <option value="">-- 컨테이너 이름 --</option>
          {filteredContainers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.containerName} ({c.containerHash.slice(0, 12)})
            </option>
          ))}
        </select>
      </label>

      {/* 라디오 옵션 - Deleted */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="containerType"
          value="deleted"
          checked={containerType === 'deleted'}
          onChange={() => {
            onContainerTypeChange('deleted');
            onSelectedContainerChange('');
            setSearchTerm('');
          }}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm font-medium text-text-primary">Deleted</span>
        <select
          value={containerType === 'deleted' ? selectedContainer : ''}
          onChange={(e) => {
            onContainerTypeChange('deleted');
            onSelectedContainerChange(e.target.value);
          }}
          onClick={() => onContainerTypeChange('deleted')}
          className={
            `px-3 py-2 border rounded-md min-w-[250px] text-sm
            ${containerType !== 'deleted'
                ? 'bg-gray-100 text-gray-400 cursor-pointer'
                : 'bg-white text-text-primary'}`
          }
        >
          <option value="">-- 컨테이너 이름 --</option>
          {containers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.containerName} ({c.containerHash.slice(0, 12)})
            </option>
          ))}
        </select>
      </label>

      {/* Search Input - UserPage 디자인 */}
      <div className="bg-border-light rounded-xl px-4 py-2.5 flex items-center gap-1.5 w-[260px] shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.25)]">
        <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="none">
          <path
            d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
            stroke="#505050"
            strokeWidth="1.5"
          />
          <path d="M11.5 11.5L15 15" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          disabled={containerType !== 'live'}
          className={`bg-transparent text-text-primary font-medium text-xs opacity-60 outline-none w-full ${
            containerType !== 'live' ? 'cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
};
