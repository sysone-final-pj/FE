import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AlertNotification, AlertMessageResponseDTO } from '@/shared/types/websocket';

/**
 * 알림 상태 관리 Store
 * - 실시간 알림 수신 및 관리
 * - localStorage 영구 저장
 * - 읽지 않은 알림 카운트
 */
interface AlertStore {
  // 상태
  notifications: AlertNotification[];
  unreadCount: number;

  // 액션
  addNotification: (alert: AlertMessageResponseDTO) => void;
  setNotifications: (notifications: AlertNotification[]) => void;
  markAsRead: (alertId: number) => Promise<void>;
  markAllAsRead: () => void;
  removeNotification: (alertId: number) => void;
  clearAll: () => void;
  clearRead: () => void;

  // 헬퍼
  getUnreadNotifications: () => AlertNotification[];
  getNotification: (alertId: number) => AlertNotification | undefined;
}

export const useAlertStore = create<AlertStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        notifications: [],
        unreadCount: 0,

        // 새 알림 추가 (WebSocket 실시간)
        addNotification: (alert) =>
          set((state) => {
            // 중복 체크
            const exists = state.notifications.some(
              (n) => n.alertId === alert.alertId
            );
            if (exists) {
              return state;
            }

            const newNotification: AlertNotification = {
              ...alert,
              isRead: false,
            };

            return {
              notifications: [newNotification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            };
          }),

        // 전체 알림 설정 (초기 로드)
        setNotifications: (notifications) =>
          set({
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
          }),

        // 알림 읽음 처리
        markAsRead: async (alertId) => {
          set((state) => {
            const notification = state.notifications.find(
              (n) => n.alertId === alertId
            );

            if (!notification || notification.isRead) {
              return state;
            }

            return {
              notifications: state.notifications.map((n) =>
                n.alertId === alertId ? { ...n, isRead: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          });
        },

        // 모든 알림 읽음 처리
        markAllAsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
          })),

        // 특정 알림 제거
        removeNotification: (alertId) =>
          set((state) => {
            const notification = state.notifications.find(
              (n) => n.alertId === alertId
            );
            const wasUnread = notification && !notification.isRead;

            return {
              notifications: state.notifications.filter(
                (n) => n.alertId !== alertId
              ),
              unreadCount: wasUnread
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
            };
          }),

        // 모든 알림 삭제
        clearAll: () => set({ notifications: [], unreadCount: 0 }),

        // 읽은 알림만 삭제
        clearRead: () =>
          set((state) => ({
            notifications: state.notifications.filter((n) => !n.isRead),
          })),

        // 읽지 않은 알림 목록 반환
        getUnreadNotifications: () => {
          const state = get();
          return state.notifications.filter((n) => !n.isRead);
        },

        // 특정 알림 조회
        getNotification: (alertId) => {
          const state = get();
          return state.notifications.find((n) => n.alertId === alertId);
        },
      }),
      {
        name: 'alert-storage', // localStorage 키 이름
        partialize: (state) => ({
          // notifications와 unreadCount만 저장
          notifications: state.notifications,
          unreadCount: state.unreadCount,
        }),
      }
    ),
    { name: 'AlertStore' }
  )
);
