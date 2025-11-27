/**
 작성자: 김슬기
 */
import type { DashboardContainerStats, DashboardHealthyStats } from './types';

export const DASHBOARD_CONTAINER_STATE_COLORS: Record<string, string> = {
  Running: '#1890FF',
  Dead: '#FF6C5E',
  Paused: '#FF9411',
  Restarting: '#FF9411',
  Created: '#767676',
  Exited: '#767676',
};

export const DASHBOARD_HEALTHY_STATUS_COLORS: Record<string, string> = {
  Healthy: '#1890FF',
  UnHealthy: '#FF6C5E',
  Starting: '#FF9411',
  None: '#767676',
};

export const MOCK_DASHBOARD_CONTAINER_STATES: DashboardContainerStats[] = [
  { state: 'Running', count: 20, color: DASHBOARD_CONTAINER_STATE_COLORS.Running },
  { state: 'Dead', count: 20, color: DASHBOARD_CONTAINER_STATE_COLORS.Dead },
  { state: 'Paused', count: 20, color: DASHBOARD_CONTAINER_STATE_COLORS.Paused },
  { state: 'Restarting', count: 20, color: DASHBOARD_CONTAINER_STATE_COLORS.Restarting },
  { state: 'Created', count: 20, color: DASHBOARD_CONTAINER_STATE_COLORS.Created },
  { state: 'Exited', count: 20, color: DASHBOARD_CONTAINER_STATE_COLORS.Exited },
];

export const MOCK_DASHBOARD_HEALTHY_STATES: DashboardHealthyStats[] = [
  { status: 'Healthy', count: 20, color: DASHBOARD_HEALTHY_STATUS_COLORS.Healthy },
  { status: 'UnHealthy', count: 20, color: DASHBOARD_HEALTHY_STATUS_COLORS.UnHealthy },
  { status: 'Starting', count: 20, color: DASHBOARD_HEALTHY_STATUS_COLORS.Starting },
  { status: 'None', count: 20, color: DASHBOARD_HEALTHY_STATUS_COLORS.None },
];
