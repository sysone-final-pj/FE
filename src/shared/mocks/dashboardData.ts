// 파일 위치: shared/mocks/dashboardData.ts (기존 파일에 추가)

import type { DashboardContainerCard, DashboardContainerDetail } from '@/entities/container/model/types';
import type { DashboardFilters } from '@/features/dashboard/model/filterTypes';

const DASHBOARD_CONTAINER_BG_COLORS = [
  'bg-gray-50',
  'bg-orange-50',
  'bg-red-50 border-red-300',
  'bg-yellow-50 border-yellow-300',
  'bg-gray-100',
];

export const MOCK_DASHBOARD_CONTAINERS: DashboardContainerCard[] = Array.from({ length: 50 }, (_, i) => ({
  id: `dashboard-container-${i + 1}`,
  name: `Web-Container 0${((i % 9) + 1)}`,
  cpu: '38 %',
  memory: '1.2 MB',
  bgColor: DASHBOARD_CONTAINER_BG_COLORS[i % DASHBOARD_CONTAINER_BG_COLORS.length],
  borderColor: i % 5 === 2 ? '#FCA5A5' : i % 5 === 3 ? '#FCD34D' : undefined,
}));

// 상세 정보 Mock 데이터
export const MOCK_CONTAINER_DETAIL: DashboardContainerDetail = {
  agentName: 'node-name-01',
  containerName: 'web-service-01',
  containerId: '517faace4256',
  cpu: {
    usage: '20%',
    current: '33%',
    total: '100%',
  },
  memory: {
    usage: '2.533 MB',
    current: '2.54 MB',
    total: '4 GB',
  },
  state: {
    status: 'Running',
    uptime: '00 d 00 h 00 m',
  },
  healthy: {
    status: 'Healthy',
    lastCheck: '.00 ms',
    message: '00 %',
  },
  network: {
    rx: '24.2 Kbps',
    tx: '24.2 Kbps',
  },
  image: {
    repository: 'backend-api',
    tag: 'latest',
    imageId: 'f1e2d3c4b5a6',
    size: '278 MB',
  },
  storage: {
    used: '2 GB',
    total: '10 GB',
    percentage: 20,
  },
};

export const INITIAL_DASHBOARD_FILTERS: DashboardFilters = {
  quickFilters: [
    { id: 'favorite', label: 'Favorite', count: 0, checked: false },
    { id: 'all', label: 'All Containers', count: 0, checked: false },
  ],
  agentNames: [
    { id: 'agent-1', label: 'Spring Collector 01', count: 10, checked: false },
    { id: 'agent-2', label: 'Spring Collector 02', count: 10, checked: false },
    { id: 'agent-3', label: 'Spring Collector 03', count: 10, checked: false },
  ],
  states: [
    { id: 'dead', label: 'Dead', count: 10, checked: false },
    { id: 'running', label: 'Running', count: 10, checked: false },
    { id: 'restarting', label: 'Restarting', count: 10, checked: false },
    { id: 'paused', label: 'Paused', count: 10, checked: false },
    { id: 'created', label: 'Created', count: 10, checked: false },
    { id: 'exited', label: 'Exited', count: 10, checked: false },
  ],
  healthy: [
    { id: 'healthy', label: 'Healthy', count: 10, checked: false },
    { id: 'unhealthy', label: 'UnHealthy', count: 10, checked: false },
    { id: 'starting', label: 'Starting', count: 10, checked: false },
    { id: 'none', label: 'None', count: 10, checked: false },
  ],
};
