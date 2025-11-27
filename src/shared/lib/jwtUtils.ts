/**
 작성자: 김슬기
 */
import { authToken } from './authToken';

/**
 * JWT 토큰 페이로드 인터페이스
 */
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

/**
 * JWT 토큰 디코딩
 * Base64 디코딩을 사용하여 페이로드 추출
 *
 * @param token JWT 토큰 문자열
 * @returns 디코딩된 페이로드 또는 null
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    // JWT는 header.payload.signature 형식
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // payload 부분 (두 번째 부분)
    const payload = parts[1];

    // Base64 디코딩
    const decodedPayload = atob(payload);

    // JSON 파싱
    const rawPayload = JSON.parse(decodedPayload);

    // 백엔드 JWT 필드를 프론트엔드 형식으로 매핑
    // sub → userId, accountId → username
    return {
      userId: rawPayload.sub || rawPayload.userId,
      username: rawPayload.accountId || rawPayload.username,
      email: rawPayload.email || '',
      role: rawPayload.role,
      exp: rawPayload.exp,
      iat: rawPayload.iat,
    };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * 현재 저장된 토큰에서 사용자 정보 추출
 * 
 * @returns 사용자 정보 또는 null
 */
export const getCurrentUser = (): JwtPayload | null => {
  const token = authToken.get();
  
  if (!token) {
    return null;
  }
  
  return decodeJwt(token);
};

/**
 * 토큰이 만료되었는지 확인
 * 
 * @returns true if expired, false otherwise
 */
export const isTokenExpired = (): boolean => {
  const user = getCurrentUser();
  
  if (!user || !user.exp) {
    return true;
  }
  
  // exp는 초 단위, Date.now()는 밀리초 단위
  return user.exp * 1000 < Date.now();
};