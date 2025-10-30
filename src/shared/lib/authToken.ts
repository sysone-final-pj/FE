/**
 * 인증 토큰 관리 유틸리티
 * localStorage를 사용한 토큰 저장/제거/확인
 */

const TOKEN_KEY = 'accessToken';

export const authToken = {
  /**
   * 토큰 저장
   */
  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * 토큰 가져오기
   */
  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * 토큰 제거
   */
  remove: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * 토큰 존재 여부 확인
   */
  exists: (): boolean => {
    return !!authToken.get();
  },

  /**
   * 토큰이 유효한지 확인 (선택사항 - JWT 디코딩)
   * 필요시 jwt-decode 라이브러리 추가
   */
  isValid: (): boolean => {
    const token = authToken.get();
    if (!token) return false;
    
    // TODO: JWT 만료 시간 체크 (필요시)
    // const decoded = jwtDecode(token);
    // return decoded.exp * 1000 > Date.now();
    
    return true;
  }
};