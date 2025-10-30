interface IconProps {
  name: 'bell' | 'search' | 'plus' | 'info' | 'edit' | 'delete';
  className?: string;
  size?: number;
}

export const Icon = ({ name, className = '', size = 20 }: IconProps) => {
  const iconMap = {
    bell: 'bell-icon.svg',
    search: 'search-icon.svg',
    plus: 'plus-icon.svg',
    info: 'info-icon.svg',
    edit: 'edit-icon.svg',
    delete: 'delete-icon.svg',
  };

  return (
    <img
      src={iconMap[name]}
      alt={name}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};
