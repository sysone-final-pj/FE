import { api } from './axiosInstance';
import type { User } from '@/entities/user/model/types';

export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  company?: string;
  position?: string;
  mobile?: string;
  office?: string;
  email: string;
  note?: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  name?: string;
  company?: string;
  position?: string;
  mobile?: string;
  office?: string;
  email?: string;
  note?: string;
}

export interface CheckUsernameResponse {
  available: boolean;
  message?: string;
}

interface GetUsersResponse {
  statusCode: number;
  message: string;
  data: User[];
}

export const userApi = {
  /**
   * Username 중복 확인
   */
  async checkUsername(username: string): Promise<CheckUsernameResponse> {
    const response = await api.get<CheckUsernameResponse>(`/members/check-username`, {
      params: { username }
    });
    return response.data;
  },

  /**
   * 사용자 생성
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post<User>('/members', data);
    return response.data;
  },

  /**
   * 사용자 수정
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.post<User>(`/members/${userId}`, data);
    return response.data;
  },

  /**
   * 사용자 삭제
   */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/members/${userId}`);
  },

  /**
   * 사용자 목록 조회
   */
  async getUsers(): Promise<GetUsersResponse> {
    const response = await api.get<GetUsersResponse>('/members');
    return response.data;
  },

  /**
   * 사용자 단일 조회
   */
  async getUser(userId: string): Promise<User> {
    const response = await api.get<User>(`/members/${userId}`);
    return response.data;
  },
};