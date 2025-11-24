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
          }}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm font-medium text-text-primary">Live</span>
        <select
          value={selectedContainer}
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
          {containers.map((c) => (
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
          }}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm font-medium text-text-primary">Deleted</span>
        <select
          value={selectedContainer}
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
    </div>
  );
};
