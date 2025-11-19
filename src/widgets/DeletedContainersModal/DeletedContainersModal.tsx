import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';

// 삭제된 컨테이너 타입 정의
export interface DeletedContainer {
  agentName: string;
  containerId: string;
  containerName: string;
  deletedAt: string; // ISO 8601 format
}

interface DeletedContainersModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedContainers?: DeletedContainer[];
}

type SortField = 'agentName' | 'containerId' | 'containerName' | 'deletedAt';
type SortDirection = 'asc' | 'desc' | null;

export const DeletedContainersModal: React.FC<DeletedContainersModalProps> = ({
  isOpen,
  onClose,
  deletedContainers = []
}) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // 클린업: 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 같은 필드 클릭: asc → desc → null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      // 다른 필드 클릭: asc부터 시작
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Container ID 복사 핸들러
  const handleCopyContainerId = async (containerId: string) => {
    try {
      await navigator.clipboard.writeText(containerId);
      setCopiedId(containerId);
      setTimeout(() => setCopiedId(null), 2000); // 2초 후 복사 표시 제거
    } catch (error) {
      console.error('Failed to copy container ID:', error);
      alert('복사에 실패했습니다.');
    }
  };

  // 정렬된 데이터
  const sortedContainers = useMemo(() => {
    if (!sortField || !sortDirection) return deletedContainers;

    return [...deletedContainers].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [deletedContainers, sortField, sortDirection]);

  // 날짜 포맷 함수 (date-fns 사용)
  const formatDeletedAt = (isoString: string) => {
    const date = new Date(isoString);
    return (
      <>
        {format(date, 'yyyy-MM-dd')}
        <br />
        {format(date, 'HH:mm:ss')}
      </>
    );
  };

  // 정렬 아이콘 컴포넌트
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    const isActive = sortField === field;
    const direction = isActive ? sortDirection : null;

    return (
      <svg
        className="shrink-0 w-3 h-3 overflow-visible"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M6 3L9 6L3 6L6 3Z"
          fill={direction === 'asc' ? '#333333' : '#C9C9D9'}
        />
        <path
          d="M6 9L3 6L9 6L6 9Z"
          fill={direction === 'desc' ? '#333333' : '#C9C9D9'}
        />
      </svg>
    );
  };

  if (!isOpen) return null;

  // 5개 이상이면 스크롤바 활성화
  const shouldScroll = sortedContainers.length > 5;
  const tableBodyMaxHeight = shouldScroll ? 'max-h-[225px]' : 'max-h-none'; // 45px * 5 = 225px

  return (
    <>
      {/* 모달 배경 (Overlay) */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
        onClick={onClose}
      >
        {/* 모달 컨테이너 */}
        <div
          className="bg-white rounded-[11px] pt-3 pb-3 flex flex-col gap-3 items-center justify-center relative shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >

          {/* 안내 메시지 */}
          <div className="pt-2.5 pb-2.5 flex flex-row gap-2.5 items-center justify-center relative">
            <div
              className="text-text-primary text-left font-['Inter-Medium',_sans-serif] text-sm leading-5 font-medium relative"
            >
              최근 24시간 내에 삭제된 컨테이너 목록을 확인할 수 있습니다.
            </div>
          </div>
          {/* 테이블 컨테이너 */}
          <div className="bg-white rounded-lg border-solid border-[#ebebf1] border pt-2.5 pr-6 pb-2.5 pl-6 flex flex-col gap-0 items-start justify-start shrink-0 relative overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="bg-white border-solid border-[#e5e5ec] border-b flex flex-row gap-0 items-center justify-start shrink-0 w-[591px] relative">
              {/* Agent Name */}
              <div
                className="pt-3 pr-5 pb-3 pl-3 flex flex-row gap-2.5 items-center justify-start shrink-0 w-[150px] h-[45px] relative cursor-pointer hover:bg-[#f8f8fa]"
                onClick={() => handleSort('agentName')}
              >
                <div
                  className="text-[#333333] text-left font-['Pretendard-SemiBold',_sans-serif] text-sm leading-[140%] font-semibold relative"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Agent Name
                </div>
                <SortIcon field="agentName" />
              </div>

              {/* Container ID */}
              <div
                className="pt-3 pr-5 pb-3 pl-3 flex flex-row gap-2 items-center justify-start shrink-0 w-[140px] h-[45px] relative cursor-pointer hover:bg-[#f8f8fa]"
                onClick={() => handleSort('containerId')}
              >
                <div
                  className="text-[#333333] text-left font-['Pretendard-Medium',_sans-serif] text-sm leading-[140%] font-medium relative"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Container ID
                </div>
                <SortIcon field="containerId" />
              </div>

              {/* Container Name */}
              <div
                className="pt-3 pr-5 pb-3 pl-3 flex flex-row gap-2.5 items-center justify-start shrink-0 w-[190px] h-[45px] relative cursor-pointer hover:bg-[#f8f8fa]"
                onClick={() => handleSort('containerName')}
              >
                <div
                  className="text-[#333333] text-left font-['Pretendard-SemiBold',_sans-serif] text-sm leading-[140%] font-semibold relative"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Container Name
                </div>
                <SortIcon field="containerName" />
              </div>

              {/* Deleted At */}
              <div
                className="p-3 flex flex-row gap-2.5 items-center justify-center shrink-0 w-[119px] h-[45px] relative cursor-pointer hover:bg-[#f8f8fa]"
                onClick={() => handleSort('deletedAt')}
              >
                <div
                  className="text-[#333333] text-left font-['Pretendard-SemiBold',_sans-serif] text-sm leading-[140%] font-semibold relative"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Deleted At
                </div>
                <SortIcon field="deletedAt" />
              </div>
            </div>

            {/* 테이블 바디 (5개 이상이면 스크롤) */}
            <div className={`overflow-y-auto ${tableBodyMaxHeight} w-[591px]`}>
              {sortedContainers.length > 0 ? (
                sortedContainers.map((container, index) => (
                  <div
                    key={index}
                    className="bg-white border-solid border-[#e5e5ec] border-b pt-0.5 flex flex-row gap-0 items-center justify-start shrink-0 w-full relative"
                  >
                    {/* Agent Name */}
                    <div className="p-3 flex flex-row gap-2.5 items-center justify-start shrink-0 w-[150px] h-[45px] relative">
                      <div
                        className="text-text-primary text-left font-['Pretendard-Medium',_sans-serif] text-sm leading-[140%] font-medium relative truncate"
                        style={{ letterSpacing: '-0.025em' }}
                      >
                        {container.agentName}
                      </div>
                    </div>

                    {/* Container ID with Copy Button */}
                    <div className="p-3 flex flex-row gap-1 items-center justify-start shrink-0 w-[140px] h-[45px] relative group">
                      <div
                        className="text-[#767676] text-left font-['Pretendard-Medium',_sans-serif] text-sm leading-[140%] font-medium relative truncate flex-1"
                        style={{ letterSpacing: '-0.025em' }}
                        title={container.containerId}
                      >
                        {container.containerId}
                      </div>
                      <button
                        onClick={() => handleCopyContainerId(container.containerId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                        title="복사"
                      >
                        {copiedId === container.containerId ? (
                          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Container Name */}
                    <div className="p-3 flex flex-row gap-2.5 items-center justify-start shrink-0 w-[190px] h-[45px] relative">
                      <div
                        className="text-text-primary text-left font-['Pretendard-Medium',_sans-serif] text-sm leading-[140%] font-medium relative truncate"
                        style={{ letterSpacing: '-0.025em' }}
                      >
                        {container.containerName}
                      </div>
                    </div>

                    {/* Deleted At */}
                    <div className="p-3 flex flex-row gap-2.5 items-center justify-center shrink-0 w-[111px] h-[45px] relative">
                      <div
                        className="text-text-primary text-center font-['Pretendard-Medium',_sans-serif] text-sm leading-[140%] font-medium relative"
                        style={{ letterSpacing: '-0.025em' }}
                      >
                        {formatDeletedAt(container.deletedAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white pt-8 pb-8 flex items-center justify-center w-full">
                  <div className="text-[#767676] text-center font-['Pretendard-Medium',_sans-serif] text-sm">
                    최근 24시간 내에 삭제된 컨테이너가 없습니다.
                  </div>
                </div>
              )}
            </div>
          </div>



          {/* 닫기 버튼 */}
          <div
            className="bg-white rounded-lg border-solid border-[#ebebf1] border p-2.5 flex flex-row gap-2.5 items-center justify-center shrink-0 w-[115px] relative cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            <div
              className="text-[#767676] text-center font-['Pretendard-Medium',_sans-serif] text-xs leading-[140%] font-medium relative"
              style={{ letterSpacing: '-0.025em' }}
            >
              닫기
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
