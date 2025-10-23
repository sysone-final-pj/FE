import type { Alert } from '@/entities/alert/model/types';

export const alertsData: Alert[] = [
  {
    id: '1',
    level: 'Critical',
    metricType: 'Memory',
    agentName: 'web-node-1',
    containerName: 'web-server-01',
    message: 'Add notes about this agent (e.g. production, monitoring node)',
    timestamp: '2025.10.17 12:32',
    isRead: true,
    duration: '2 minutes ago',
  },
  {
    id: '2',
    level: 'Warning',
    metricType: 'Memory',
    agentName: 'web-node-1',
    containerName: 'web-server-01',
    message: 'Add notes about this agent (e.g. production, monitoring node)',
    timestamp: '2025.10.17 12:32',
    isRead: false,
    duration: '2 minutes ago',
  },
];
