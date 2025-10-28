export interface ApiError {
  status?: number;
  message: string;
  type: 'AUTH' | 'USER' | 'AGENT' | 'ALERT' | 'NETWORK' | 'SERVER' | 'UNKNOWN';
}
