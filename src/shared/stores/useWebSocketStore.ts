import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WebSocketStatus, WebSocketError } from '@/shared/types/websocket';

/**
 * WebSocket 연결 상태 관리 Store
 */
interface WebSocketStore {
  // 상태
  status: WebSocketStatus;
  error: WebSocketError | null;

  // 액션
  setStatus: (status: WebSocketStatus) => void;
  setError: (error: WebSocketError | null) => void;
  clearError: () => void;

  // 헬퍼
  isConnected: () => boolean;
}

export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      status: 'disconnected',
      error: null,

      // 상태 업데이트
      setStatus: (status) => set({ status }),

      setError: (error) => set({ error, status: 'error' }),

      clearError: () => set({ error: null }),

      // 연결 확인
      isConnected: () => get().status === 'connected',
    }),
    { name: 'WebSocketStore' }
  )
);
