import { Icon } from '@/shared/ui/UiIcon/UiIcon';
import type { User } from '@/entities/user/model/types';

interface UserRowProps {
  user: User;
  onInfo: (userId: number) => void;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => void;
}

export const UserRow = ({ user, onInfo, onEdit, onDelete }: UserRowProps) => {
  return (
    <tr className="bg-white border-b border-border-light hover:bg-gray-50">
      {/* Name */}
      <td className="p-2.5 px-4 align-middle w-[14%]">
        <span className="text-text-label font-medium text-base w-full truncate block">
          {user.name}
        </span>
      </td>

      {/* Position */}
      <td className="p-2.5 align-middle w-[12%]">
        <span className="text-text-label font-medium text-base truncate block">
          {user.position}
        </span>
      </td>

      {/* Company */}
      <td className="p-2.5 align-middle w-[16%]">
        <span className="text-text-label font-medium text-base truncate block">
          {user.companyName}
        </span>
      </td>

      {/* Mobile */}
      <td className="p-2.5 align-middle w-[13%]">
        <span className="text-text-label font-medium text-base truncate block">
          {user.mobileNumber}
        </span>
      </td>

      {/* Office Phone */}
      <td className="p-2.5 align-middle w-[13%]">
        <span className="text-text-label font-medium text-base truncate block">
          {user.officePhone}
        </span>
      </td>

      {/* Email */}
      <td className="p-2.5 align-middle w-[20%]">
        <span className="text-text-label font-medium text-base truncate block">
          {user.email}
        </span>
      </td>

      {/* Operation */}
      <td className="p-2.5 align-middle w-[12%]">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => user.id && onInfo(user.id)}
            className="bg-white border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
          >
            <Icon name='info' size={22} className='text-state-healthy' />
            <span className="text-text-secondary font-medium text-sm">Info</span>
          </button>

          <button
            onClick={() => user.id && onEdit(user.id)}
            className="bg-white border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
          >
            <Icon name='edit' size={18} className='text-state-high' />
            <span className="text-text-secondary font-medium text-sm">Edit</span>
          </button>

          <button
            onClick={() => user.id && onDelete(user.id)}
            className="bg-white border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
          >
            <Icon name='delete' size={20} className='text-text-muted' />
            <span className="text-text-secondary font-medium text-sm">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};
