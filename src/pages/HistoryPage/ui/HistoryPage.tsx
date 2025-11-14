import { useState, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Download } from 'lucide-react';
import { HISTORY_FIELDS } from '@/entities/history';

// Register Handsontable's modules
registerAllModules();

export const HistoryPage = () => {
  const hotTableRef = useRef<any>(null);
  const [containerType, setContainerType] = useState<'live' | 'dead'>('live');
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Mock data - Replace with actual API call
  const generateMockData = () => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      const row: Record<string, any> = {
        시간: `2025-10-${i + 1}`,
      };
      HISTORY_FIELDS.forEach((field) => {
        row[field] = Math.floor(Math.random() * 100);
      });
      data.push(row);
    }
    return data;
  };

  const [tableData] = useState(generateMockData());

  // Handsontable columns configuration
  const columns = [
    { data: '시간', title: '시간', readOnly: true, width: 120 },
    ...HISTORY_FIELDS.map((field) => ({
      data: field,
      title: field,
      readOnly: true,
      width: 120,
    })),
  ];

  const handleDownload = () => {
    const hot = hotTableRef.current?.hotInstance;
    if (!hot) return;

    // Export to CSV
    const exportPlugin = hot.getPlugin('exportFile');
    exportPlugin.downloadFile('csv', {
      filename: `container_history_${new Date().toISOString().split('T')[0]}`,
      columnHeaders: true,
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f8fa] px-[60px] pt-6 pb-10">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-6">Containers History</h1>

      {/* White container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Filters Section */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Container Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Container :
            </label>

            {/* Live Radio Button */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="containerType"
                value="live"
                checked={containerType === 'live'}
                onChange={() => {
                  setContainerType('live');
                  setSelectedContainer('');
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Live</span>
              <select
                value={selectedContainer}
                onChange={(e) => setSelectedContainer(e.target.value)}
                disabled={containerType !== 'live'}
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500 min-w-[250px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">컨테이너 이름(container id)</option>
                <option value="container1">Container 1(abc123)</option>
                <option value="container2">Container 2(def456)</option>
              </select>
            </label>

            {/* Dead Radio Button */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="containerType"
                value="dead"
                checked={containerType === 'dead'}
                onChange={() => {
                  setContainerType('dead');
                  setSelectedContainer('');
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Dead</span>
              <select
                value={selectedContainer}
                onChange={(e) => setSelectedContainer(e.target.value)}
                disabled={containerType !== 'dead'}
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500 min-w-[250px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">컨테이너 이름(container id)</option>
                <option value="dead1">Dead Container 1(xyz789)</option>
                <option value="dead2">Dead Container 2(uvw456)</option>
              </select>
            </label>
          </div>

          {/* Period Filter and Download Button Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Period
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Custom Range... [Start]"
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500 min-w-[180px]"
                popperClassName="z-[9999]"
              />
              <span className="text-gray-400">~</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
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
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500 min-w-[180px]"
                popperClassName="z-[9999]"
              />

              {/* Search Button */}
              <button
                onClick={() => console.log('Search clicked', { containerType, selectedContainer, startDate, endDate })}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                조회
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md flex items-center gap-2 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        {/* Handsontable */}
        <div className="w-full overflow-x-auto">
          <HotTable
            ref={hotTableRef}
            data={tableData}
            columns={columns}
            colHeaders={true}
            rowHeaders={true}
            width="100%"
            height="500"
            licenseKey="non-commercial-and-evaluation"
            stretchH="all"
            className="htCenter"
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
