/**
 작성자: 김슬기
 */
interface DetailStatCardProps {
  title: string;
  mainValue: string;
  subValue?: string;
  subValueLine2?: string;
  variant?: 'default' | 'state' | 'healthy';
}

const getMainValueColor = (variant: string, value: string): string => {
  if (variant === 'state') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'running') return 'text-state-running';
    if (lowerValue === 'exited' || lowerValue === 'dead') return 'text-state-tertiary';
    if (lowerValue === 'paused') return 'text-state-tertiary';
    return 'text-text-tertiary';
  }
  if (variant === 'healthy') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'healthy') return 'text-state-healthy';
    if (lowerValue === 'unhealthy') return 'text-state-error';
    if (lowerValue === 'none' || lowerValue === 'starting') return 'text-state-tertiary';
    return 'text-text-tertiary';
  }
  return 'text-text-tertiary';
};

export const DetailStatCard = ({
  title,
  mainValue,
  subValue,
  subValueLine2,
  variant = 'default',
}: DetailStatCardProps) => {
  const hasSubValue = subValue || subValueLine2;
  const mainValueColor = getMainValueColor(variant, mainValue);

  return (
    <div className="bg-white w-[214px] rounded-xl border border-border-light p-4">
      <div className="border-b border-border-light pb-3 px-3 mb-4">
        <p className="text-text-primary font-semibold text-xl">{title}</p>
      </div>
      <div className={`px-3 ${!hasSubValue ? 'flex items-center justify-center h-[52px]' : ''}`}>
        <p className={`${mainValueColor} font-semibold text-2xl text-center`}>{mainValue}</p>
        {hasSubValue && (
          <div className="text-tertiary text-xs text-center mt-1">
            {subValue && <p>{subValue}</p>}
            {subValueLine2 && <p>{subValueLine2}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
