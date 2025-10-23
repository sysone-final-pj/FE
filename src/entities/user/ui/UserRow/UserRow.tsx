import { Icon } from '@/shared/ui/Icon/Icon';
import type { User } from '@/entities/user/model/types';

interface UserRowProps {
  user: User;
  onInfo?: (userId: string) => void;
  onEdit?: (userId: string) => void;
  onDelete?: (userId: string) => void;
}

export const UserRow = ({ user, onInfo, onEdit, onDelete }: UserRowProps) => {
  return (
    <div className="flex items-center w-full h-14 bg-white rounded-lg px-5 hover:bg-gray-50 transition-colors">
      <div className="text-sm text-gray-700" style={{ width: '120px' }}>
        {user.name}
      </div>
      <div className="text-sm text-gray-700" style={{ width: '150px' }}>
        {user.position}
      </div>
      <div className="text-sm text-gray-700" style={{ width: '200px' }}>
        {user.company}
      </div>
      <div className="text-sm text-gray-700" style={{ width: '150px' }}>
        {user.mobile}
      </div>
      <div className="text-sm text-gray-700" style={{ width: '150px' }}>
        {user.officePhone}
      </div>
      <div className="text-sm text-gray-700" style={{ width: '250px' }}>
        {user.email}
      </div>

      <div className="flex items-center justify-end gap-2 flex-1">
        <button
          onClick={() => onInfo?.(user.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-500 hover:text-teal-600 transition-colors"
        >
          <Icon name="info" size={16} />
          <span>Info</span>
        </button>

        <button
          onClick={() => onEdit?.(user.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
        >
          <Icon name="edit" size={16} />
          <span>Edit</span>
        </button>

        <button
          onClick={() => onDelete?.(user.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
        >
          <Icon name="delete" size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
