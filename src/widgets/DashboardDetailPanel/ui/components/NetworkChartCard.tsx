interface NetworkChartCardProps {
  rxValue?: string;
  txValue?: string;
}

export const NetworkChartCard = ({ rxValue = '24.2', txValue = '24.2' }: NetworkChartCardProps) => {
  return (
    <div className="mt-3.5 bg-white w-[883px] h-[308px] rounded-xl border border-[#ebebf1] p-4">
      <div className="flex items-center gap-2 border-b border-[#ebebf1] pb-3 px-3 mb-4">
        <p className="text-[#505050] font-semibold text-xl">Network</p>
        <div className="flex items-center gap-3 ml-4">
          <div className="bg-white rounded-lg px-2.5 py-[5px] flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 12L8 4M8 4L5 7M8 4L11 7" stroke="#0492f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[#767676] text-sm">Rx</p>
            <p className="text-[#0492f4] text-sm">{rxValue}</p>
            <p className="text-[#767676] text-xs">Kbps</p>
          </div>
          <div className="text-[#767676] text-xs">|</div>
          <div className="bg-white rounded-lg px-2.5 py-[5px] flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4L8 12M8 12L11 9M8 12L5 9" stroke="#14ba6d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[#767676] text-sm">Tx</p>
            <p className="text-[#14ba6d] text-sm">{txValue}</p>
            <p className="text-[#767676] text-xs">Kbps</p>
          </div>
        </div>
      </div>
      <div className="w-full h-[225px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm font-medium">차트 예정</p>
      </div>
    </div>
  );
};
