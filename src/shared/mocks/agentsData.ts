import type { Agent } from '@/entities/agent/model/types';

export const agentsData: Agent[] = [
  {
    id: '1',
    agentName: 'agent-web-service',
    active: 'ON',
    hashcode: 'abc123def456',
    description: 'Add notes about this agent (e.g. production, monitoring node)',
    createdAt: '2025.10.17 12:32',
  },
  {
    id: '2',
    agentName: 'agent-db-service',
    active: 'OFF',
    hashcode: 'xyz789uvw012',
    description: 'Add notes about this agent (e.g. production, monitoring node)',
    createdAt: '2025.10.17 12:32',
  },
  {
    id: '3',
    agentName: 'agent-api-service',
    active: 'OFF',
    hashcode: 'mno345pqr678',
    description: 'Add notes about this agent (e.g. production, monitoring node)',
    createdAt: '2025.10.17 12:32',
  },
  {
    id: '4',
    agentName: 'agent-cache-service',
    active: 'ON',
    hashcode: 'stu901vwx234',
    description: 'Add notes about this agent (e.g. production, monitoring node)',
    createdAt: '2025.10.17 12:32',
  },
];
