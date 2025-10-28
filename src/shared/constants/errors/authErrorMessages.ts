/**
 * 인증/로그인 관련 에러 메시지
 * - 로그인 실패, 비밀번호 오류, 세션 만료 등
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  LOGIN_FAILED: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
  SERVER_ERROR: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  UNAUTHORIZED: '접근 권한이 없습니다. 로그인 후 다시 시도해주세요.',
} as const;

export type AuthErrorMessageKey = keyof typeof AUTH_ERROR_MESSAGES;
