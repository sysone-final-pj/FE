interface UsernameInputProps {
  value: string;
  onChange: (v: string) => void;
  onCheckId: () => void;
  isChecking?: boolean;
  isAvailable?: boolean | null;
}

export const UsernameInput = ({
  value,
  onChange,
  onCheckId,
  isChecking = false,
  isAvailable = null,
}: UsernameInputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600">
        Username <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter username"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 px-3 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={onCheckId}
          disabled={isChecking || !value}
          className="h-9 px-3 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check ID'}
        </button>
      </div>
      {isAvailable !== null && (
        <p className={`text-xs ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
          {isAvailable ? '✓ Available' : '✗ Already taken'}
        </p>
      )}
    </div>
  );
};
