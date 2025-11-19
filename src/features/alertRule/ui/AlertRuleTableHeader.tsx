export const AlertRuleTableHeader = () => {
  return (
    <thead className="sticky top-0 bg-border-light z-10">
      <tr className="text-text-primary font-medium text-sm h-[60px]">
        <th className="w-[250px] py-2.5 px-4 text-left rounded-tl-xl">Rule Name</th>
        <th className="w-[110px] py-2.5 px-4 text-center">Metric Type</th>
        <th className="w-[150px] py-2.5 px-4 text-center">Info Threshold</th>
        <th className="w-[150px] py-2.5 px-4 text-center">Warning Threshold</th>
        <th className="w-[150px] py-2.5 px-4 text-center">High Threshold</th>
        <th className="w-[150px] py-2.5 px-4 text-center">Critical Threshold</th>
        <th className="w-[150px] py-2.5 px-4 text-center">Cooldown (sec)</th>
        <th className="w-[150px] py-2.5 px-4 text-center">Enabled</th>
        <th className="w-[218px] py-2.5 px-4 text-center rounded-tr-xl">Operation</th>
      </tr>
    </thead>
  );
};
