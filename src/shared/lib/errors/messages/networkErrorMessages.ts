export const NETWORK_ERROR_MESSAGES = {
  DISCONNECTED: '네트워크 연결이 원활하지 않습니다.',
  TIMEOUT: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
  UNKNOWN: '알 수 없는 네트워크 오류가 발생했습니다.',
} as const;

export type NetworkErrorMessageKey = keyof typeof NETWORK_ERROR_MESSAGES;
