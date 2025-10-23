export const AlertRuleTableHeader = () => {
  return (
    <div className="bg-[#EBEBF1] border-b border-[#EBEBF1] rounded-t-lg px-4 py-2.5 flex items-center h-[60px]">
      {/* Rule Name */}
      <div className="w-[250px] px-2.5 flex items-center">
        <span className="text-[#767676] font-medium text-sm">Rule Name</span>
      </div>

      {/* Metric Type */}
      <div className="w-[110px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">Metric type</span>
      </div>

      {/* Info Threshold */}
      <div className="w-[150px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">Info Threshold</span>
      </div>

      {/* Warning Threshold */}
      <div className="w-[150px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">Warning Threshold</span>
      </div>

      {/* High Threshold */}
      <div className="w-[150px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">High Threshold</span>
      </div>

      {/* Critical Threshold */}
      <div className="w-[150px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">Critical Threshold</span>
      </div>

      {/* Cooldown (seconds) */}
      <div className="w-[150px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">Cooldown (seconds)</span>
      </div>

      {/* Check Interval */}
      <div className="w-[150px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">Check Interval</span>
      </div>

      {/* Is Enabled */}
      <div className="w-[150px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">Is Enabled</span>
      </div>

      {/* Operation */}
      <div className="w-[218px] px-2.5 flex items-center justify-center">
        <span className="text-[#767676] font-medium text-sm">Operation</span>
      </div>
    </div>
  );
};
