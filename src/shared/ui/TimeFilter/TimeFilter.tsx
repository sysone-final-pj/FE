import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import {
  differenceInDays,
  isAfter,
  isBefore,
  subDays,
} from 'date-fns';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { MODAL_MESSAGES } from '@/shared/ui/ConfirmModal/modalMessages';
import 'react-datepicker/dist/react-datepicker.css';

export const TimeFilter = () => {
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>('Select Range');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  /** Quick Range 목록 */
  const quickRanges = [
    { label: 'Last 5 minutes', value: 5 },
    { label: 'Last 10 minutes', value: 10 },
    { label: 'Last 30 minutes', value: 30 },
    { label: 'Last 1 hour', value: 60 },
    { label: 'Last 3 hours', value: 180 },
    { label: 'Last 6 hours', value: 360 },
    { label: 'Last 12 hours', value: 720 },
    { label: 'Last 24 hours', value: 1440 },
  ];

  /** Quick Range 선택 */
  const handleSelectRange = (label: string) => {
    setSelectedRange(label);
    setIsOpen(false);
    setError('');
  };

    /** input 입력 방지 핸들러 (명시적 타입 지정) */
    const handleRawInput = (
    e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => {
    e?.preventDefault();
    };

  /** Custom Range 유효성 검사 */
  useEffect(() => {
    if (mode !== 'custom' || !startDate || !endDate) return;

    const start = startDate;
    const end = endDate;

    if (isAfter(start, now) || isAfter(end, now)) {
      setError('미래 시점은 조회할 수 없습니다.');
      return;
    }

    if (isBefore(end, start)) {
      setError('종료일은 시작일을 넘을 수 없습니다.');
      return;
    }

    const diff = differenceInDays(end, start);
    if (diff > 7) {
      setError('조회 기간은 최대 7일까지만 가능합니다.');
      return;
    }

    setError('');
  }, [startDate, endDate, mode]);

  /** 조회 버튼 클릭 */
  const handleSearch = () => {
    if (error) {
      setShowErrorModal(true);
      return;
    }

    if (mode === 'custom') {
      if (!startDate || !endDate) {
        setError('조회 기간을 선택해주세요.');
        setShowErrorModal(true);
        return;
      }
      console.log('🔍 Custom Range 조회:', { startDate, endDate });
    } else {
      console.log('🔍 Quick Range 조회:', selectedRange);
    }
  };

  /** 에러 모달 닫기 + 입력 초기화 */
  const handleConfirmError = () => {
    setShowErrorModal(false);
    setStartDate(null);
    setEndDate(null);
    setError('');
  };

  /** 모드 전환 시 상태 초기화 */
  useEffect(() => {
    if (mode === 'quick') {
      setStartDate(null);
      setEndDate(null);
      setError('');
    } else {
      setSelectedRange('Select Range');
    }
  }, [mode]);

  return (
    <div className="px-2.5 flex items-center gap-3 relative overflow-visible">
      <span className="text-[#505050] font-medium text-sm">Time Filter</span>

      {/* Quick Range */}
      <label className="flex items-center gap-1.5 cursor-pointer select-none relative">
        <input
          type="radio"
          name="timeFilter"
          value="quick"
          checked={mode === 'quick'}
          onChange={() => setMode('quick')}
          className="hidden peer"
        />
        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C9C9D9] flex items-center justify-center peer-checked:border-[#0492F4]">
          <div
            className={`w-2 h-2 rounded-full ${
              mode === 'quick' ? 'bg-[#0492F4]' : ''
            }`}
          />
        </div>

        <div className="bg-[#EBEBF1] rounded-xl px-4 py-2.5 relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-[#505050] font-medium text-xs opacity-60 outline-none flex items-center gap-1"
          >
            {selectedRange}
            <svg
              className={`w-3 h-3 transform transition-transform duration-200 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="#505050"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {isOpen && (
            <ul className="absolute z-50 left-0 mt-2 w-full bg-white border border-[#C9C9D9] rounded-lg shadow-md">
              {quickRanges.map((item) => (
                <li
                  key={item.value}
                  onClick={() => handleSelectRange(item.label)}
                  className="px-4 py-2 text-xs text-[#505050] hover:bg-[#F2F2F2] cursor-pointer"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </label>

      {/* Custom Range */}
      <label className="flex items-center gap-1.5 cursor-pointer select-none relative">
        <input
          type="radio"
          name="timeFilter"
          value="custom"
          checked={mode === 'custom'}
          onChange={() => setMode('custom')}
          className="hidden peer"
        />
        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C9C9D9] flex items-center justify-center peer-checked:border-[#0492F4]">
          <div
            className={`w-2 h-2 rounded-full ${
              mode === 'custom' ? 'bg-[#0492F4]' : ''
            }`}
          />
        </div>

        <div className="bg-[#EBEBF1] rounded-xl px-4 py-2.5 flex flex-col">
          <span className="text-[#505050] font-medium text-xs opacity-60 mb-2">
            Custom Range (Start / End)
          </span>

          {mode === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  showTimeSelect
                  dateFormat="yyyy-MM-dd HH:mm"
                  placeholderText="Start Date"
                  minDate={sevenDaysAgo}
                  maxDate={now}
                  popperClassName="z-50"
                  onChangeRaw={handleRawInput} // 타입 명시된 핸들러
                  className="w-[130px] border border-[#C9C9D9] rounded-lg px-2 py-1 text-xs text-[#505050] bg-white"
                />
                <span className="text-[#505050] text-xs opacity-60">~</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  showTimeSelect
                  dateFormat="yyyy-MM-dd HH:mm"
                  placeholderText="End Date"
                  minDate={sevenDaysAgo}
                  maxDate={now}
                  popperClassName="z-50"
                  onChangeRaw={handleRawInput} // 타입 명시된 핸들러
                  className="w-[130px] border border-[#C9C9D9] rounded-lg px-2 py-1 text-xs text-[#505050] bg-white"
                />
              </div>

              {error && (
                <p className="text-[#FF6C5E] text-[11px] mt-1 font-medium">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </label>

      {/* 조회 버튼 */}
      <button
        onClick={handleSearch}
        className="ml-2 bg-[#0492F4] hover:bg-[#007AD9] text-white text-sm font-medium rounded-lg px-4 py-2.5 shadow-sm transition-colors duration-200"
      >
        조회
      </button>

      {/* 에러 모달 */}
        <ConfirmModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={handleConfirmError}
        header={
            MODAL_MESSAGES.SYSTEM?.VALIDATION_ERROR?.header || '입력 오류'
        }
        content={error || '입력값이 잘못되었습니다. 다시 선택해주세요.'}
        type="confirm"
        />
    </div>
  );
};
