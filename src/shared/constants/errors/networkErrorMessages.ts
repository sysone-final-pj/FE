/**
 작성자: 김슬기
 */
/**
 * 네트워크 및 서버 통신 관련 에러 메시지
 * - 연결 끊김, 타임아웃 등
 */
export const NETWORK_ERROR_MESSAGES = {
  DISCONNECTED: '네트워크 연결이 원활하지 않습니다.',
  TIMEOUT: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
  UNKNOWN: '알 수 없는 네트워크 오류가 발생했습니다.',
} as const;

export type NetworkErrorMessageKey = keyof typeof NETWORK_ERROR_MESSAGES;
