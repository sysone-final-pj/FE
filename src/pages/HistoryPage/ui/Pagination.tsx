interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
}: PaginationProps) => {
  if (totalPages === 0) {
    return null;
  }

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const maxPages = Math.min(5, totalPages);

    for (let i = 0; i < maxPages; i++) {
      let pageNum;
      if (totalPages <= 5) {
        pageNum = i;
      } else if (currentPage < 3) {
        pageNum = i;
      } else if (currentPage >= totalPages - 3) {
        pageNum = totalPages - 5 + i;
      } else {
        pageNum = currentPage - 2 + i;
      }
      pageNumbers.push(pageNum);
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between mt-4 px-4">
      <div className="text-sm text-text-secondary">
        Total: {totalElements} records (Page {currentPage + 1} of {totalPages})
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 border rounded-md text-sm ${
                currentPage === pageNum
                  ? 'bg-state-running text-white border-state-running'
                  : 'hover:bg-gray-50'
              }`}
            >
              {pageNum + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Last
        </button>
      </div>
    </div>
  );
};
