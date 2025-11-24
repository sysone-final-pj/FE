import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder="Search..." 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-64 px-4 py-2 pl-10 bg-border-border-light rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
      />
      <svg 
        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
    </div>
  );
};