/**
 작성자: 김슬기
 */
interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

export const Input = ({
  label,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  required = false,
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-secondary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-9 px-3 bg-gray-100 rounded-lg text-sm text-text-primary placeholder-gray-400 outline-none focus:ring-2 focus:ring-state-running"
      />
    </div>
  );
};
