/**
 작성자: 김슬기
 */
import type { LogData } from '@/shared/types/metrics';

export const mockLogsData: LogData[] = [
 { timestamp: '2025-10-16 14:35:22', level: 'INFO', containerName: 'web-service-12', message: 'Container restarted automatically', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:23:10', level: 'ERROR', containerName: 'web-service-12', message: 'OOMKilled: Container memory limit exceeded (2048MB)', agentName: 'container-01', duration: '12 minutes ago' },
  { timestamp: '2025-10-16 14:35:00', level: 'INFO', containerName: 'web-service-12', message: 'Container restarted automatically', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:34:45', level: 'DEBUG', containerName: 'web-service-12', message: 'Checking resource metrics (CPU: 23%, RAM: 62%)', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:33:30', level: 'WARN', containerName: 'web-service-12', message: 'High memory usage detected (95% of limit)', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:32:15', level: 'WARN', containerName: 'web-service-12', message: 'High memory usage detected (95% of limit)', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:20:50', level: 'ERROR', containerName: 'web-service-12', message: 'OOMKilled: Container memory limit exceeded (2048MB)', agentName: 'container-01', duration: '12 minutes ago' },
  { timestamp: '2025-10-16 14:19:20', level: 'SUCCESS', containerName: 'web-service-12', message: 'Reconnected to database successfully', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:18:05', level: 'INFO', containerName: 'web-service-12', message: 'Container restarted automatically', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:15:40', level: 'ERROR', containerName: 'web-service-12', message: 'OOMKilled: Container memory limit exceeded (2048MB)', agentName: 'container-01', duration: '12 minutes ago' },
  { timestamp: '2025-10-16 14:12:25', level: 'WARN', containerName: 'web-service-12', message: 'High memory usage detected (95% of limit)', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:10:10', level: 'ERROR', containerName: 'web-service-12', message: 'OOMKilled: Container memory limit exceeded (2048MB)', agentName: 'container-01', duration: '12 minutes ago' },
  { timestamp: '2025-10-16 14:08:55', level: 'SUCCESS', containerName: 'web-service-12', message: 'Reconnected to database successfully', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:07:30', level: 'INFO', containerName: 'web-service-12', message: 'Container restarted automatically', agentName: 'container-01', duration: '2 minutes ago' },
  { timestamp: '2025-10-16 14:05:15', level: 'SUCCESS', containerName: 'web-service-12', message: 'Reconnected to database successfully', agentName: 'container-01', duration: '2 minutes ago' }
];