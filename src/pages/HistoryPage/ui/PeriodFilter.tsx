/**
 작성자: 이지민
 */
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Download } from 'lucide-react';

interface PeriodFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  loading: boolean;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onSearch: () => void;
  onDownload: () => void;
}

export const PeriodFilter = ({
  startDate,
  endDate,
  loading,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  onDownload,
}: PeriodFilterProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-text-primary whitespace-nowrap">
          Period :
        </label>
        <DatePicker
          selected={startDate}
          onChange={onStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm"
          placeholderText="Custom Range... [Start]"
          className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-text-secondary min-w-[180px]"
          popperClassName="z-[9999]"
        />
        <span className="text-gray-400">~</span>
        <DatePicker
          selected={endDate}
          onChange={onEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate || undefined}
          maxDate={new Date()}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm"
          placeholderText="Custom Range... [End]"
          className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-text-secondary min-w-[180px]"
          popperClassName="z-[9999]"
        />

        {/* 조회 */}
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-4 py-2 bg-state-running hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '조회 중...' : '조회'}
        </button>
      </div>

      {/* Download */}
      <button
        onClick={onDownload}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md flex items-center gap-2 transition-colors"
      >
        <Download size={16} />
        Download
      </button>
    </div>
  );
};
