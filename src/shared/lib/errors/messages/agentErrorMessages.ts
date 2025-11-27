/**
 작성자: 김슬기
 */
export const AGENT_ERROR_MESSAGES = {
  REGISTER_FAILED: '에이전트 등록 중 오류가 발생했습니다.',
  TOKEN_INVALID: '에이전트 토큰이 유효하지 않습니다.',
  NOT_FOUND: '에이전트를 찾을 수 없습니다.',
} as const;

export type AgentErrorMessageKey = keyof typeof AGENT_ERROR_MESSAGES;
