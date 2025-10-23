// import React, { useMemo } from 'react';
// import type { ContainerData } from '@/shared/types/container';

// interface MemoryCardData {
//   id: string;
//   name: string;
//   status: 'healthy' | 'warning' | 'critical';
//   usagePercent: number;
//   usage: number;
//   limit: number;
//   rss: number;
//   cache: number;
// }

// interface NetworkCardData {
//   id: string;
//   name: string;
//   status: 'healthy' | 'warning' | 'critical';
//   statusPercent: number;
//   rxMbps: number;
//   rxMbpsMax: number;
//   txMbps: number;
//   txMbpsMax: number;
//   errorRate: number;
//   totalTraffic: number;
// }

// interface LogData {
//   timestamp: string;
//   level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG' | 'SUCCESS';
//   containerName: string;
//   message: string;
//   agentName: string;
//   duration: string;
// }

export interface MemoryCardData {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  usagePercent: number;
  usage: number;
  limit: number;
  rss: number;
  cache: number;
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
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG' | 'SUCCESS';
  containerName: string;
  message: string;
  agentName: string;
  duration: string;
}
