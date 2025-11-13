interface DetailStatCardProps {
  title: string;
  mainValue: string;
  subValue: string;
}

export const DetailStatCard = ({ title, mainValue, subValue }: DetailStatCardProps) => {
  return (
    <div className="bg-white w-[214px] rounded-xl border border-border-light p-4">
      <div className="border-b border-border-light pb-3 px-3 mb-4">
        <p className="text-[#505050] font-semibold text-xl">{title}</p>
      </div>
      <div className="px-3">
        <p className="text-text-secondary font-semibold text-2xl">{mainValue}</p>
        <p className="text-tertiary text-xs text-center mt-1">{subValue}</p>
      </div>
    </div>
  );
};
