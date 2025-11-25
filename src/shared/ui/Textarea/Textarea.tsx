interface TextareaProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
}

export const Textarea = ({
  label,
  placeholder,
  value = '',
  onChange,
  rows = 4,
}: TextareaProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm text-text-primary placeholder-gray-400 outline-none focus:ring-2 focus:ring-state-running resize-none"
      />
    </div>
  );
};
