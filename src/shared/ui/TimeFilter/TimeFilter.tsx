import { useState } from 'react';

export const TimeFilter = () => {
    const [selected, setSelected] = useState<'quick' | 'custom'>('quick');
    const [mode, setMode] = useState<'quick' | 'custom'>('quick');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState<string>('Select Range');

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

    const handleSelectRange = (label: string) => {
        setSelectedRange(label);
        setIsOpen(false);
        //  API 호출 or parent callback
    };

    return (
        <div className="px-2.5 flex items-center gap-3 relative">
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
                <div
                    className={`
            w-3.5 h-3.5 rounded-full border-2 border-[#C9C9D9]
            flex items-center justify-center peer-checked:border-[#0492F4]
          `}
                >
                    <div
                        className={`
              w-2 h-2 rounded-full
              ${mode === 'quick' ? 'bg-[#0492F4]' : ''}
            `}
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
                            className={`w-3 h-3 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'
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
                        <ul className="absolute z-10 left-0 mt-2 w-full bg-white border border-[#C9C9D9] rounded-lg shadow-md">
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
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                    type="radio"
                    name="timeFilter"
                    value="custom"
                    checked={mode === 'custom'}
                    onChange={() => setMode('custom')}
                    className="hidden peer"
                />
                <div
                    className={`
            w-3.5 h-3.5 rounded-full border-2 border-[#C9C9D9]
            flex items-center justify-center peer-checked:border-[#0492F4]
          `}
                >
                    <div
                        className={`
              w-2 h-2 rounded-full
              ${mode === 'custom' ? 'bg-[#0492F4]' : ''}
            `}
                    />
                </div>
                <div className="bg-[#EBEBF1] rounded-xl px-4 py-2.5">
                    <span className="text-[#505050] font-medium text-xs opacity-60">
                        Custom Range... (Start / End)
                    </span>
                </div>
            </label>
        </div>
    );
};
