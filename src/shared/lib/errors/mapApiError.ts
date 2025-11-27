/**
 작성자: 김슬기
 */
export function mapApiError(
  status?: number,
  domain?: 'auth' | 'user' | 'agent' | 'alert',
  serverMessage?: string
): string {
  // 서버 메시지가 있으면 최우선으로 사용
  if (serverMessage) return serverMessage;

  if (!status) return '요청 처리 중 오류가 발생했습니다.';

  // 400번대 공통 에러
  if (status === 400) {
    return '잘못된 요청입니다. 입력 내용을 확인해주세요.';
  }
  if (status === 401) {
    return '인증 정보가 올바르지 않습니다.';
  }
  if (status === 403) {
    return '접근 권한이 없습니다.';
  }
  if (status === 404) {
    // domain별로 다른 메시지
    switch (domain) {
      case 'user':
        return '해당 사용자를 찾을 수 없습니다.';
      case 'agent':
        return '에이전트를 찾을 수 없습니다.';
      case 'alert':
        return '알림 규칙을 찾을 수 없습니다.';
      default:
        return '요청한 데이터를 찾을 수 없습니다.';
    }
  }
  if (status === 409) {
    return '이미 존재하는 데이터입니다.';
  }
  if (status === 422) {
    return '입력 값이 올바르지 않습니다.';
  }

  // domain별 500번대 에러
  if (status >= 500) {
    switch (domain) {
      case 'auth':
        return '인증 서버에 문제가 발생했습니다.';
      case 'user':
        return '사용자 요청 처리 중 오류가 발생했습니다.';
      case 'agent':
        return '에이전트 등록 중 오류가 발생했습니다.';
      case 'alert':
        return '알림 규칙 처리 중 오류가 발생했습니다.';
      default:
        return '서버에 문제가 발생했습니다.';
    }
  }

  // 나머지 모든 경우
  return '알 수 없는 오류가 발생했습니다.';
}


export function mapNetworkError(code?: string): string {
  if (code === 'ECONNABORTED') {
    return '서버 응답이 지연되고 있습니다. (TIMEOUT)';
  }
  return '네트워크 연결이 끊어졌습니다. (DISCONNECTED)';
}