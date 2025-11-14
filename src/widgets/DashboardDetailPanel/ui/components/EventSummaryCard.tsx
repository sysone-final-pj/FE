interface EventSummaryCardProps {
  totalCount?: number;
  normalCount?: number;
  errorCount?: number;
  duration?: string;
}

export const EventSummaryCard = ({
  totalCount = 100,
  normalCount = 80,
  errorCount = 20,
  duration = '00d 00h'
}: EventSummaryCardProps) => {
  return (
    <div className="bg-white w-[530px] h-[150px] rounded-xl border border-border-light p-4">
      <div className="border-b border-border-light pb-3 px-3 flex justify-between items-center">
        <p className="text-[#505050] font-semibold text-xl">Event Summary</p>
        <div className="text-xs text-text-label">Total {totalCount}</div>
      </div>
      <div className="flex justify-between items-center mt-4 px-3">
        <p className="text-xs text-text-secondary">Event 기준 {duration}</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 border border-border-light rounded-xl px-2.5 py-1">
            <span className="text-xs text-text-label">Normal</span>
            <span className="text-xs text-text-secondary">{normalCount}</span>
          </div>
          <div className="flex items-center gap-2 border border-border-light rounded-xl px-2.5 py-1">
            <span className="text-xs text-text-label">Error</span>
            <span className="text-xs text-text-secondary">{errorCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
