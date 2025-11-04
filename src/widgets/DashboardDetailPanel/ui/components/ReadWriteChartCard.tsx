interface ReadWriteChartCardProps {
  readValue?: string;
  writeValue?: string;
}

export const ReadWriteChartCard = ({ readValue = '9', writeValue = '24.2' }: ReadWriteChartCardProps) => {
  return (
    <div className="bg-white w-[567px] h-[203px] rounded-xl border border-[#ebebf1] p-4">
      <div className="border-b border-[#ebebf1] pb-3 px-3 flex items-center">
        <p className="text-[#505050] font-medium text-xl">Read & Write</p>
        <div className="flex items-center gap-2 text-sm text-[#767676] ml-5">
          <span>
            Read : <span className="text-[#8979ff]">{readValue}</span> MB/s
          </span>
          <span>|</span>
          <span>
            Write : <span className="text-[#ff928a]">{writeValue}</span> MB/s
          </span>
        </div>
      </div>
      <div className="h-[125px] bg-gray-100 rounded-lg flex items-center justify-center mt-3">
        <p className="text-gray-500 text-sm font-medium">차트 예정</p>
      </div>
    </div>
  );
};
