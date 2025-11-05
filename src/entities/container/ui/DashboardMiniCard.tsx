import { type DashboardContainerCard } from '../model/types';

interface ContainerMiniCardProps {
  container: DashboardContainerCard;
  selected?: boolean;
  onClick?: () => void;
}

// State에 따른 배경색 반환
const getStateBgColor = (state: string): string => {
  switch (state) {
    case 'Dead':
      return 'bg-red-50';
    case 'Paused':
    case 'Restarting':
      return 'bg-orange-50';
    case 'Created':
    case 'Exited':
      return 'bg-gray-100';
    default: // Running
      return 'bg-white';
  }
};

// Healthy에 따른 테두리 반환
const getHealthyBorder = (healthy: string): { borderClass: string; borderColor?: string } => {
  switch (healthy) {
    case 'UnHealthy':
      return { borderClass: 'border-2', borderColor: '#FCA5A5' }; // red-300
    case 'Starting':
      return { borderClass: 'border-2', borderColor: '#FCD34D' }; // yellow-300
    default: // Healthy, None
      return { borderClass: 'border', borderColor: undefined };
  }
};

export const ContainerMiniCard = ({ container, selected, onClick }: ContainerMiniCardProps) => {
  const bgColor = getStateBgColor(container.state);
  const { borderClass, borderColor } = getHealthyBorder(container.healthy);
  const borderColorClass = borderColor ? '' : 'border-gray-200';

  return (
    <button
      onClick={onClick}
      className={`
        ${bgColor}
        rounded-xl
        ${borderClass}
        ${borderColorClass}
        p-4
        flex flex-col
        gap-1
        items-start
        w-[165px]
        h-[96px]
        transition-all
        hover:opacity-80
        ${selected ? 'ring-2 ring-blue-400' : ''}
      `}
      style={{ borderColor }}
    >
      <div className="flex items-center gap-2 w-full">
        {container.isFavorite && (
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="#FFE171"
            stroke="#FFE171"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        )}
        <span className={`text-gray-700 font-pretendard font-semibold text-sm truncate ${container.isFavorite ? 'max-w-[110px]' : 'max-w-[130px]'}`}>
          {container.name}
        </span>
      </div>
      <div className="text-gray-600 font-pretendard text-xs">
        CPU: {container.cpu}
      </div>
      <div className="text-gray-600 font-pretendard text-xs">
        Mem: {container.memory}
      </div>
    </button>
  );
};
