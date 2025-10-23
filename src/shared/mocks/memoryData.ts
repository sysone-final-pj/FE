import type { MemoryCardData } from '@/shared/types/metrics';

export const mockMemoryData: MemoryCardData[] = [
  { id: '1', name: 'web-service-1', status: 'healthy', usagePercent: 15, usage: 450, limit: 1000, rss: 320, cache: 130 },
  { id: '2', name: 'api-gateway-2', status: 'healthy', usagePercent: 25, usage: 750, limit: 1000, rss: 520, cache: 230 },
  { id: '3', name: 'database-1', status: 'warning', usagePercent: 75, usage: 3000, limit: 4000, rss: 2100, cache: 900 },
  { id: '4', name: 'cache-server', status: 'healthy', usagePercent: 18, usage: 540, limit: 1000, rss: 380, cache: 160 },
  { id: '5', name: 'message-queue', status: 'healthy', usagePercent: 30, usage: 900, limit: 1000, rss: 620, cache: 280 },
  { id: '6', name: 'worker-service', status: 'critical', usagePercent: 92, usage: 3680, limit: 4000, rss: 2580, cache: 1100 }
];
