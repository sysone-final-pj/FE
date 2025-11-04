import { type ContainerStats } from '../model/types';

interface ContainerStateCardProps {
  stats: ContainerStats[];
}

export const ContainerStateCard = ({ stats }: ContainerStateCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-col gap-0">
        <div className="border-b border-gray-200 px-3 pb-3">
          <h2 className="text-gray-700 font-pretendard font-semibold text-xl tracking-tight">
            Container State
          </h2>
        </div>
        
        <div className="flex flex-row gap-0">
          {stats.map((stat) => (
            <div key={stat.state} className="pt-6 px-3 flex flex-col gap-0.5 min-w-[80px]">
              <div 
                className="font-pretendard font-semibold text-[28px] tracking-tight"
                style={{ color: stat.color }}
              >
                {stat.count}
              </div>
              <div className="text-gray-500 font-pretendard font-medium text-sm tracking-tight">
                {stat.state}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
