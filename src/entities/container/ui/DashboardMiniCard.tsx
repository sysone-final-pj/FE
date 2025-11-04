import { type DashboardContainerCard } from '../model/types';

interface ContainerMiniCardProps {
  container: DashboardContainerCard;
  selected?: boolean;
  onClick?: () => void;
}

export const ContainerMiniCard = ({ container, selected, onClick }: ContainerMiniCardProps) => {
  const borderClass = container.borderColor ? 'border-2' : 'border';
  const borderColorClass = container.borderColor ? '' : 'border-gray-200';

  return (
    <button
      onClick={onClick}
      className={`
        ${container.bgColor}
        rounded-xl
        ${borderClass}
        ${borderColorClass}
        p-4
        flex flex-col
        gap-2
        items-start
        w-[165px]
        transition-all
        hover:bg-gray-50
        ${selected ? 'ring-2 ring-blue-400' : ''}
      `}
      style={{ borderColor: container.borderColor }}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="text-gray-700 font-pretendard font-semibold text-sm truncate max-w-[130px]">
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
