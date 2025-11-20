interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
}

export const ModalHeader = ({ title, onClose }: ModalHeaderProps) => {
  return (
    <div className="h-14 px-8 border-b border-border-light flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-text-secondary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
