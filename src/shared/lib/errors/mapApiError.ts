export function mapApiError(
  status?: number,
  domain?: 'auth' | 'user' | 'agent' | 'alert',
  serverMessage?: string
): string {
  if (serverMessage) return serverMessage;

  if (!status) return '요청 처리 중 오류가 발생했습니다.';

  switch (domain) {
    case 'auth':
      if (status === 401) return '인증 정보가 올바르지 않습니다.';
      if (status === 403) return '접근 권한이 없습니다.';
      if (status >= 500) return '서버에 문제가 발생했습니다.';
      break;

    case 'user':
      if (status === 404) return '해당 사용자를 찾을 수 없습니다.';
      if (status >= 500) return '사용자 요청 처리 중 오류가 발생했습니다.';
      break;

    case 'agent':
      if (status === 404) return '에이전트를 찾을 수 없습니다.';
      if (status >= 500) return '에이전트 등록 중 오류가 발생했습니다.';
      break;

    case 'alert':
      if (status >= 500) return '알림 데이터를 가져오는 중 오류가 발생했습니다.';
      break;

    default:
      if (status >= 500) return '알 수 없는 서버 오류가 발생했습니다.';
  }

  return '알 수 없는 오류가 발생했습니다.'; // 마지막 fallback
}


export function mapNetworkError(code?: string): string {
  if (code === 'ECONNABORTED') {
    return '서버 응답이 지연되고 있습니다. (TIMEOUT)';
  }
  return '네트워크 연결이 끊어졌습니다. (DISCONNECTED)';
}