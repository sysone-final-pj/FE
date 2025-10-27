import { useEffect } from 'react';

export type ConfirmModalType = 'confirm' | 'complete' | 'delete';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  header: string;
  content: string;
  type?: ConfirmModalType;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  header,
  content,
  type = 'confirm'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getButtonConfig = () => {
    switch (type) {
      case 'confirm':
        return {
          confirmText: '확인',
          confirmBg: 'bg-[#0492F4] hover:bg-[#0378C9]',
          confirmTextColor: 'text-white',
          showCancel: false
        };
      case 'complete':
        return {
          confirmText: '완료',
          confirmBg: 'bg-[#0492F4] hover:bg-[#0378C9]',
          confirmTextColor: 'text-white',
          cancelText: '취소',
          cancelBg: 'bg-[#C9C9C9] hover:bg-[#B0B0B0]',
          cancelTextColor: 'text-[#999999]',
          showCancel: true
        };
      case 'delete':
        return {
          confirmText: '삭제',
          confirmBg: 'bg-[#FF6C5E] hover:bg-[#E55A4D]',
          confirmTextColor: 'text-white',
          cancelText: '취소',
          cancelBg: 'bg-[#C9C9C9] hover:bg-[#B0B0B0]',
          cancelTextColor: 'text-[#999999]',
          showCancel: true
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-[410px] h-[260px] relative overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-[#505050] text-center font-pretendard font-semibold text-xl leading-[140%] absolute left-1/2 -translate-x-1/2 top-[26px] tracking-[-0.025em]">
          {header}
        </div>

        {/* Content */}
        <div className="text-[#505050] text-center font-pretendard font-medium text-lg leading-[160%] absolute left-[57px] top-[calc(50%-52px)] w-[296px] h-[78px] flex items-center justify-center tracking-[-0.025em] whitespace-pre-line">
          {content}
        </div>

        {/* Buttons */}
        <div className="flex flex-row items-center justify-between w-[360px] absolute left-[25px] top-[182px]">
          {buttonConfig.showCancel ? (
            <div className="flex flex-row items-center justify-between shrink-0 w-[360px]">
              {/* Cancel Button */}
              <button
                onClick={onClose}
                className={`rounded-lg border border-[#C9C9C9] p-2.5 flex items-center justify-center w-[175px] h-[52px] transition-colors ${buttonConfig.cancelBg}`}
              >
                <div className={`${buttonConfig.cancelTextColor} text-center font-pretendard font-medium text-xl leading-[140%] tracking-[-0.025em]`}>
                  {buttonConfig.cancelText}
                </div>
              </button>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className={`rounded-lg border-none p-2.5 flex items-center justify-center w-[175px] h-[52px] transition-colors ${buttonConfig.confirmBg}`}
              >
                <div className={`${buttonConfig.confirmTextColor} text-center font-pretendard font-medium text-xl leading-[140%] tracking-[-0.025em]`}>
                  {buttonConfig.confirmText}
                </div>
              </button>
            </div>
          ) : (
            /* Single Confirm Button */
            <button
              onClick={handleConfirm}
              className="bg-white rounded-lg border border-[#0492F4] hover:border-[#0378C9] p-2.5 flex items-center justify-center w-[360px] h-[52px] transition-colors"
            >
              <div className="text-[#0492F4] hover:text-[#0378C9] text-center font-pretendard font-medium text-xl leading-[140%] tracking-[-0.025em]">
                {buttonConfig.confirmText}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};