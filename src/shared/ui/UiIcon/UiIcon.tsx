/**
 작성자: 김슬기
 */
import InfoIcon from '@/assets/info-icon.svg?react';
import EditIcon from '@/assets/edit-icon.svg?react';
import DeleteIcon from '@/assets/delete-icon.svg?react';
import PlusIcon from '@/assets/plus-icon.svg?react';
import SearchIcon from '@/assets/search-icon.svg?react';

const iconMap = {
  info: InfoIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  plus: PlusIcon,
  search: SearchIcon,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export const Icon = ({ name, className = '', size = 20 }: IconProps) => {
  const SvgIcon = iconMap[name];
  return <SvgIcon className={className} width={size} height={size} />;
};
