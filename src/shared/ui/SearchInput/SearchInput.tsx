import { Icon } from '@/shared/ui/Icon/Icon';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const SearchInput = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  className = '',
}: SearchInputProps) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg ${className}`}
    >
      <Icon name="search" size={16} className="text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none border-0 w-40"
      />
    </div>
  );
};
