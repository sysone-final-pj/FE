import { StorageUsageContent } from './StorageUsageContent';
import { EmptyStorageState } from './EmptyStorageState';

interface StorageUsageCardProps {
  percentage?: number;
  used?: string;
  available?: string;
}

export const StorageUsageCard = ({
  percentage,
  used,
  available
}: StorageUsageCardProps) => {
  // percentage가 없거나 0이면 빈 상태로 간주
  const hasStorageData = percentage !== undefined && percentage !== null && (used || available);

  return (
    <div className="bg-white w-[345px] h-[150px] rounded-xl border border-border-light p-4 flex flex-col">
      <div className="border-b border-border-light pb-3 px-3 mb-4">
        <p className="text-text-primary font-semibold text-xl">Storage Usage</p>
      </div>
      {hasStorageData ? (
        <StorageUsageContent
          percentage={percentage!}
          used={used!}
          available={available!}
        />
      ) : (
        <EmptyStorageState />
      )}
    </div>
  );
};
