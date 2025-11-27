/**
 작성자: 김슬기
 */
import { api } from './axiosInstance';
import { authToken } from '@/shared/lib/authToken';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * 로그아웃
   * - 서버에 로그아웃 요청
   * - 토큰 제거
   * - 히스토리 제거 (뒤로가기 방지)
   * - 로그인 페이지로 이동
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // 서버 요청 실패해도 클라이언트 로그아웃은 진행
      console.error('Server logout failed, proceeding with client logout', error);
    } finally {
      // 1. 토큰 제거
      authToken.remove();
  
      // 2. 히스토리 제거 (뒤로가기 방지)
      // 현재 히스토리를 /login으로 교체하여 뒤로가기 시 이전 페이지로 돌아가지 않음
      window.history.replaceState(null, '', '/login');
      
      // 3. 로그인 페이지로 이동
      window.location.href = '/login';
    }
  },
};