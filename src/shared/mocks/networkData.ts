/**
 작성자: 김슬기
 */
import type { NetworkCardData } from '@/shared/types/metrics';

export const mockNetworkData: NetworkCardData[] = [
  { id: '1', name: 'web-service-1', status: 'healthy', statusPercent: 100, rxMbps: 100, rxMbpsMax: 100, txMbps: 100, txMbpsMax: 100, errorRate: 0, totalTraffic: 470 },
  { id: '2', name: 'api-gateway-2', status: 'healthy', statusPercent: 100, rxMbps: 150, rxMbpsMax: 150, txMbps: 120, txMbpsMax: 120, errorRate: 0.1, totalTraffic: 680 },
  { id: '3', name: 'database-1', status: 'healthy', statusPercent: 100, rxMbps: 80, rxMbpsMax: 100, txMbps: 60, txMbpsMax: 80, errorRate: 0, totalTraffic: 350 },
  { id: '4', name: 'cache-server', status: 'healthy', statusPercent: 100, rxMbps: 200, rxMbpsMax: 200, txMbps: 180, txMbpsMax: 200, errorRate: 0.5, totalTraffic: 920 },
  { id: '5', name: 'message-queue', status: 'healthy', statusPercent: 100, rxMbps: 120, rxMbpsMax: 150, txMbps: 100, txMbpsMax: 120, errorRate: 0.2, totalTraffic: 540 },
  { id: '6', name: 'worker-service', status: 'healthy', statusPercent: 100, rxMbps: 90, rxMbpsMax: 100, txMbps: 70, txMbpsMax: 100, errorRate: 0, totalTraffic: 410 }
];
