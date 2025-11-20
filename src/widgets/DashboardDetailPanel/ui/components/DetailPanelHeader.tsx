interface DetailPanelHeaderProps {
  agentName: string;
  containerName: string;
  containerHash: string;
}

export const DetailPanelHeader = ({ agentName, containerName, containerHash }: DetailPanelHeaderProps) => {
  return (
    <div className="pt-0 pl-[26px]">
      <p className="text-text-secondary font-pretendard font-semibold text-xl pb-2">
        Agent : {agentName}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-text-primary text-[28px] font-semibold">
          Container : {containerName}
        </p>
        <div className="w-0.5 h-7 bg-[#b9b9c9]" />
        <p className="text-text-primary text-[#28px] font-semibold">
          {containerHash}
        </p>
      </div>
    </div>
  );
};
