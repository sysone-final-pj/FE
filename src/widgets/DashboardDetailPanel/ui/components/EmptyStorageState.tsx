/**
 작성자: 김슬기
 */
import whaleImg from '@/assets/whale.png';

export const EmptyStorageState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
      <img
        src={whaleImg}
        alt="No storage allocated"
        className="w-12 h-12 opacity-60"
      />
      <p className="text-sm text-text-secondary text-center">
        스토리지를 할당해주세요
      </p>
    </div>
  );
};
