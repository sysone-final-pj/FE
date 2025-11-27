/**
 작성자: 김슬기
 */
export interface DashboardFilterOption {
  id: string;
  label: string;
  count: number;
  checked: boolean;
}

export interface DashboardFilters {
  quickFilters: DashboardFilterOption[];
  agentNames: DashboardFilterOption[];
  states: DashboardFilterOption[];
  healthy: DashboardFilterOption[];
}
