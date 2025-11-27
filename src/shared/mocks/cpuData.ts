/**
 작성자: 김슬기
 */
// src/shared/mocks/cpuData.ts

export interface CPUContainerData {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  usagePercent: number;
  request: number;
  limit: number;
  throttling: number;
  core: number;
}

export interface CurrentCPUData {
  name: string;
  usagePercent: number;
  coreUsage: number;
  cpuLimit: number;
  throttlingPercent: number;
}

export interface CPUStatsData {
  name: string;
  avg1min: number | string;
  avg5min: number;
  avg15min: number;
  p95: number;
}

export interface CPUModeData {
  name: string;
  user: number;
  system: number;
}

// Mock CPU Container Data
export const mockCPUContainerData: CPUContainerData[] = [
  { id: '1', name: 'web-service-1', status: 'healthy', usagePercent: 15, request: 500, limit: 1000, throttling: 0, core: 0 },
  { id: '2', name: 'api-gateway-2', status: 'healthy', usagePercent: 25, request: 600, limit: 1200, throttling: 0, core: 0 },
  { id: '3', name: 'database-1', status: 'degraded', usagePercent: 65, request: 800, limit: 1000, throttling: 5, core: 1 },
  { id: '4', name: 'cache-server', status: 'healthy', usagePercent: 18, request: 400, limit: 800, throttling: 0, core: 0 },
  { id: '5', name: 'message-queue', status: 'healthy', usagePercent: 30, request: 700, limit: 1500, throttling: 0, core: 0 },
  { id: '6', name: 'worker-service', status: 'critical', usagePercent: 85, request: 900, limit: 1000, throttling: 15, core: 1 }
];

// Mock Current CPU Data
export const mockCurrentCPUData: CurrentCPUData[] = [
  { name: 'web-server', usagePercent: 15, coreUsage: 0.15, cpuLimit: 1, throttlingPercent: 10 },
  { name: 'api-gateway', usagePercent: 25, coreUsage: 0.25, cpuLimit: 1, throttlingPercent: 8 },
  { name: 'database', usagePercent: 65, coreUsage: 0.65, cpuLimit: 1, throttlingPercent: 5 },
  { name: 'cache-server', usagePercent: 18, coreUsage: 0.18, cpuLimit: 1, throttlingPercent: 12 },
  { name: 'message-queue', usagePercent: 30, coreUsage: 0.30, cpuLimit: 1, throttlingPercent: 7 },
  { name: 'worker-service', usagePercent: 85, coreUsage: 0.85, cpuLimit: 1, throttlingPercent: 3 }
];

// Mock CPU Stats Data
export const mockCPUStatsData: CPUStatsData[] = [
  { name: 'web-server', avg1min: 15, avg5min: 15, avg15min: 10, p95: 20 },
  { name: 'api-gateway', avg1min: 25, avg5min: 23, avg15min: 20, p95: 30 },
  { name: 'database', avg1min: 65, avg5min: 60, avg15min: 58, p95: 75 },
  { name: 'cache-server', avg1min: 18, avg5min: 17, avg15min: 15, p95: 22 },
  { name: 'message-queue', avg1min: 30, avg5min: 28, avg15min: 25, p95: 35 },
  { name: 'worker-service', avg1min: 85, avg5min: 82, avg15min: 80, p95: 90 }
];

// Mock CPU Mode Data
export const mockCPUModeData: CPUModeData[] = [
  { name: 'web-service-1', user: 60, system: 40 },
  { name: 'api-gateway-2', user: 75, system: 25 },
  { name: 'database-1', user: 45, system: 55 },
  { name: 'cache-server', user: 70, system: 30 },
  { name: 'message-queue', user: 55, system: 45 },
  { name: 'worker-service', user: 80, system: 20 }
];

