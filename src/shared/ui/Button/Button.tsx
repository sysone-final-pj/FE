interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'info' | 'edit' | 'delete';
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Button = ({
  variant = 'secondary',
  icon,
  children,
  onClick,
  className = '',
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors';

  const variantStyles = {
    primary:
      'bg-white text-text-primary border border-border-light hover:bg-gray-50 shadow-sm',
    secondary: 'bg-white text-text-secondary border border-border-light hover:bg-gray-50',
    info: 'bg-transparent text-teal-500 hover:bg-teal-50 border-0',
    edit: 'bg-transparent text-yellow-600 hover:bg-yellow-50 border-0',
    delete: 'bg-transparent text-text-secondary hover:bg-red-50 border-0',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
