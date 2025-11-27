/**
 작성자: 김슬기
 */
export const EmptyDetailState = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          상세 정보를 표시할 수 없습니다
        </h3>
        <p className="text-sm text-text-secondary">
          컨테이너를 선택하거나 데이터를 다시 불러와 주세요
        </p>
      </div>
    </div>
  );
};
