import axios, { AxiosError } from 'axios'

export interface ApiError {
  status?: number
  message: string
  type: 'NETWORK' | 'TIMEOUT' | 'SERVER' | 'UNKNOWN'
}

/**
 * axios 에러를 구분해서 사용자 친화적 메시지로 변환
 */
export function parseApiError(error: unknown): ApiError {
  if (axios.isCancel(error)) {
    return { message: '요청이 취소되었습니다.', type: 'UNKNOWN' }
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      // timeout 발생
      return { message: '서버 응답이 지연되고 있습니다.', type: 'TIMEOUT' }
    }

    if (!error.response) {
      // 네트워크 장애 (서버 다운 등)
      return {
        message: '서버와 연결할 수 없습니다. 네트워크 상태를 확인해주세요.',
        type: 'NETWORK',
      }
    }

    // 서버에서 응답은 왔지만 에러 상태 코드인 경우
    const status = error.response.status
    let message = '알 수 없는 서버 오류가 발생했습니다.'
    if (status >= 500) message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    else if (status === 404) message = '요청하신 데이터를 찾을 수 없습니다.'
    else if (status === 401) message = '인증이 만료되었습니다. 다시 로그인해주세요.'
    else if (status === 403) message = '접근 권한이 없습니다.'
    else if (status === 400) message = '잘못된 요청입니다.'

    return { status, message, type: 'SERVER' }
  }

  // axios 외의 예외 (예: JS 런타임 에러)
  return { message: '예기치 못한 오류가 발생했습니다.', type: 'UNKNOWN' }
}
