interface DetailStatCardProps {
  title: string;
  mainValue: string;
  subValue: string;
}

export const DetailStatCard = ({ title, mainValue, subValue }: DetailStatCardProps) => {
  return (
    <div className="bg-white w-[214px] rounded-xl border border-[#ebebf1] p-4">
      <div className="border-b border-[#ebebf1] pb-3 px-3 mb-4">
        <p className="text-[#505050] font-semibold text-xl">{title}</p>
      </div>
      <div className="px-3">
        <p className="text-[#767676] font-semibold text-2xl">{mainValue}</p>
        <p className="text-[#808080] text-xs text-center mt-1">{subValue}</p>
      </div>
    </div>
  );
};
