export interface MemoryCardData {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  usagePercent: number;
  usage: number;
  limit: number;
}

export interface NetworkCardData {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  statusPercent: number;
  rxMbps: number;
  rxMbpsMax: number;
  txMbps: number;
  txMbpsMax: number;
  errorRate: number;
  totalTraffic: number;
}

export interface LogData {
  timestamp: string;
  level: string,
  containerName: string;
  message: string;
  agentName: string;
  duration: string;
}
