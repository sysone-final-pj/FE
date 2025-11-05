import whaleImg from '@/assets/whale.png';

export const EmptyStorageState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
      <img
        src={whaleImg}
        alt="No storage allocated"
        className="w-12 h-12 opacity-60"
      />
      <p className="text-sm text-gray-500 text-center">
        할당된 스토리지 용량이 없습니다
      </p>
    </div>
  );
};
