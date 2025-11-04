export const ALERT_ERROR_MESSAGES = {
  FETCH_FAILED: '알림 데이터를 불러오지 못했습니다.',
  DELETE_FAILED: '알림을 삭제하는 중 오류가 발생했습니다.',
  RULE_CREATE_FAILED: '알림 규칙 생성 중 오류가 발생했습니다.',
  RULE_FETCH_FAILED: '알림 규칙 목록을 불러오지 못했습니다.',
  RULE_UPDATE_FAILED: '알림 규칙 수정 중 오류가 발생했습니다.',
  RULE_DELETE_FAILED: '알림 규칙 삭제 중 오류가 발생했습니다.',
  RULE_TOGGLE_FAILED: '알림 규칙 활성화/비활성화 중 오류가 발생했습니다.',
} as const;

export type AlertErrorMessageKey = keyof typeof ALERT_ERROR_MESSAGES;