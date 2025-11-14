import type { Agent } from '@/entities/agent/model/types';
import { CONNECTION_STATUS_COLORS } from '@/entities/agent/model/constants';
import { Icon } from '@/shared/ui/UiIcon/UiIcon';

interface AgentRowProps {
  agent: Agent;
  onInfo: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AgentRow = ({ agent, onInfo, onEdit, onDelete }: AgentRowProps) => {
  return (
    <tr className="bg-white border-b border-border-light hover:bg-gray-50">
      {/* Agent Name */}
      <td className="p-2.5 px-4 align-middle w-[14.12%]">
        <span className="text-text-label font-medium text-base w-full truncate block">
          {agent.agentName}
        </span>
      </td>

      {/* Active */}
      <td className="p-2.5 align-middle w-[5.74%]">
        <span className={`font-medium text-base ${CONNECTION_STATUS_COLORS[agent.active]}`}>
          {agent.active}
        </span>
      </td>

      {/* Hashcode */}
      <td className="p-2.5 align-middle w-[22.95%]">
        <span className="text-text-label font-medium text-base truncate block">
          {agent.hashcode}
        </span>
      </td>

      {/* Description */}
      <td className="p-2.5 align-middle w-[30.98%]">
        <span className="text-text-label font-medium text-base truncate block">
          {agent.description}
        </span>
      </td>

      {/* Created */}
      <td className="p-2.5 text-center align-middle w-[8.60%]">
        <span className="text-tertiary font-medium text-base">
          {agent.createdAt}
        </span>
      </td>

      {/* Operation */}
      <td className="p-2.5 align-middle w-[17.62%]">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onInfo(agent.id)}
            className="bg-white border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
          >
            <Icon name='info' size={22} className='text-state-healthy' />
            <span className="text-text-secondary font-medium text-sm">Info</span>
          </button>

          <button
            onClick={() => onEdit(agent.id)}
            className="bg-white border border-border-light rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
          >
            <Icon name='edit' size={18} className='text-state-high' />
            <span className="text-text-secondary font-medium text-sm">Edit</span>
          </button>

          <button
            onClick={() => onDelete(agent.id)}
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
