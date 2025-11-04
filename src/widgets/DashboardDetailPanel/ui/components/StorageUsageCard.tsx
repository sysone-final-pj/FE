import group1350 from '@/assets/dashboard/group-1350.svg';

interface StorageUsageCardProps {
  percentage?: number;
  used?: string;
  available?: string;
}

export const StorageUsageCard = ({
  percentage = 20,
  used = '2 GB',
  available = '10 GB'
}: StorageUsageCardProps) => {
  return (
    <div className="bg-white w-[345px] h-[150px] rounded-xl border border-[#ebebf1] p-4 flex flex-col">
      <div className="border-b border-[#ebebf1] pb-3 px-3 mb-4">
        <p className="text-[#505050] font-semibold text-xl">Storage Usage</p>
      </div>
      <div className="flex gap-[18px] items-center px-3">
        <div className="relative w-[62px] h-[62px]">
          <img src={group1350} className="absolute w-[62px] h-[62px]" alt="Storage chart" />
          <div className="absolute top-[30px] left-[37px] flex items-center gap-1">
            <p className="text-[#767676] text-sm font-medium">{percentage}</p>
            <p className="text-[#767676] text-[10px] font-semibold">%</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs text-[#767676] mb-1">
            <div className="w-2 h-2 bg-[#0199ee]" />
            <p>사용 중인 공간 : {used}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#767676]">
            <div className="w-2 h-2 bg-[#c3c3c3]" />
            <p>여유 공간 : {available}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
