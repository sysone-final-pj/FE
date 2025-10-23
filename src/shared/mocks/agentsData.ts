import type { Agent } from '@/entities/agent/model/types';

export const agentsData: Agent[] = [
  {
    id: '1',
    agentName: 'agent-web-service',
    apiEndpoint: 'http://192.168.0.45:8080',
    connectionStatus: 'Success',
    description: 'Add notes about this agent (e.g. production, monitoring node)',
    created: '2025.10.17 12:32',
  },
  {
    id: '2',
    agentName: 'agent-web-service',
    apiEndpoint: 'http://192.168.0.45:8080',
    connectionStatus: 'Fail',
    description: 'Add notes about this agent (e.g. production, monitoring node)',
    created: '2025.10.17 12:32',
  },
  {
    id: '3',
    agentName: 'agent-web-service',
    apiEndpoint: 'http://192.168.0.45:8080',
    connectionStatus: 'Fail',
    description: 'Add notes about this agent (e.g. production, monitoring node)',
    created: '2025.10.17 12:32',
  },
  {
    id: '4',
    agentName: 'agent-web-service',
    apiEndpoint: 'http://192.168.0.45:8080',
    connectionStatus: 'Success',
    description: 'Add notes about this agent (e.g. production, monitoring node)',
    created: '2025.10.17 12:32',
  },
];
