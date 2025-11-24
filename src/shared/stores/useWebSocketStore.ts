import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WebSocketStatus, WebSocketError } from '@/shared/types/websocket';

/** 재연결 시도 최대 횟수 (이 횟수 초과 시 완전 실패로 간주) */
const MAX_RETRY_COUNT = 5;

/**
 * WebSocket 연결 상태 관리 Store
 * - 연결 상태 및 에러 관리
 * - 재연결 시도 횟수 추적
 * - 완전 실패 감지 (REST fallback 트리거용)
 */
interface WebSocketStore {
  // 상태
  status: WebSocketStatus;
  error: WebSocketError | null;
  retryCount: number;
  isConnectionFailed: boolean; // WebSocket 완전 실패 여부 (REST fallback 필요)

  // 액션
  setStatus: (status: WebSocketStatus) => void;
  setError: (error: WebSocketError | null) => void;
  clearError: () => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  setConnectionFailed: (failed: boolean) => void;

  // 헬퍼
  isConnected: () => boolean;
  shouldUseFallback: () => boolean;
}

export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      status: 'disconnected',
      error: null,
      retryCount: 0,
      isConnectionFailed: false,

      // 상태 업데이트
      setStatus: (status) => {
        // 연결 성공 시 retry 카운트 리셋
        if (status === 'connected') {
          set({ status, retryCount: 0, isConnectionFailed: false });
        } else {
          set({ status });
        }
      },

      setError: (error) => set({ error, status: 'error' }),

      clearError: () => set({ error: null }),

      // 재연결 시도 횟수 증가
      incrementRetry: () => {
        const newCount = get().retryCount + 1;
        const isFailed = newCount >= MAX_RETRY_COUNT;
        set({
          retryCount: newCount,
          isConnectionFailed: isFailed,
        });
        if (isFailed) {
          console.warn(`[WebSocketStore] WebSocket 연결 ${MAX_RETRY_COUNT}회 실패 - REST fallback 활성화`);
        }
      },

      // 재연결 시도 횟수 리셋
      resetRetry: () => set({ retryCount: 0, isConnectionFailed: false }),

      // 연결 실패 상태 직접 설정
      setConnectionFailed: (failed) => set({ isConnectionFailed: failed }),

      // 연결 확인
      isConnected: () => get().status === 'connected',

      // REST fallback 사용 여부
      shouldUseFallback: () => get().isConnectionFailed,
    }),
    { name: 'WebSocketStore' }
  )
);
